using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

public class LotExpirationReminderService : BackgroundService
{
    private readonly string _connString;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;

    public LotExpirationReminderService(string connString, string smtpServer, int smtpPort, string smtpUsername, string smtpPassword)
    {
        _connString = connString;
        _smtpServer = smtpServer;
        _smtpPort = smtpPort;
        _smtpUsername = smtpUsername;
        _smtpPassword = smtpPassword;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendLotExpirationReminders();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while checking lot expiration and sending reminders: {ex}");
            }

            // Ожидаем 1 час перед повторным запуском
            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    private async Task CheckAndSendLotExpirationReminders()
    {
        using (MySqlConnection connection = new MySqlConnection(_connString))
        {
            await connection.OpenAsync();

            // Получаем лоты, у которых осталось менее 12 часов до окончания
            string query = "SELECT * FROM Lots WHERE TIMESTAMPDIFF(HOUR, NOW(), TimeTillEnd) <= 12";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            using (MySqlDataReader reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    int lotId = reader.GetInt32("Id");
                    string lotTitle = reader.GetString("Title");
                    DateTime expirationTime = reader.GetDateTime("TimeTillEnd");
                    int ownerId = reader.GetInt32("UserId"); // Получаем UserId

                    // Получаем пользователей, у которых NotificationsRemind = true и которые поставили ставку на данный лот
                    List<string> recipientEmails = new List<string>();
                    string getUsersWithEmailsQuery = @"
                        SELECT DISTINCT U.Email
                        FROM Users U
                        JOIN Bids B ON U.UserId = B.UserId
                        WHERE U.NotificationsRemind = true AND B.LotId = @LotId";
                    using (MySqlCommand getUsersCommand = new MySqlCommand(getUsersWithEmailsQuery, connection))
                    {
                        getUsersCommand.Parameters.AddWithValue("@LotId", lotId);
                        using (MySqlDataReader emailReader = await getUsersCommand.ExecuteReaderAsync())
                        {
                            while (await emailReader.ReadAsync())
                            {
                                recipientEmails.Add(emailReader.GetString("Email"));
                            }
                        }
                    }

                    // Получаем почту пользователя
                    string ownerEmail = string.Empty;
                    
                    string getOwnerEmailQuery = "SELECT Email FROM Users WHERE UserId = @UserId";
                    using (MySqlCommand getOwnerEmailCommand = new MySqlCommand(getOwnerEmailQuery, connection))
                    {
                        getOwnerEmailCommand.Parameters.AddWithValue("@UserId", ownerId);
                        object ownerEmailResult = await getOwnerEmailCommand.ExecuteScalarAsync();
                        if (ownerEmailResult != null)
                        {
                            ownerEmail = ownerEmailResult.ToString();
                        }
                    }

                    // Отправляем оповещения пользователям и владельцу лота
                    foreach (var email in recipientEmails)
                    {
                        SendEmail(email, "Оповещение: Осталось менее 12 часов до окончания аукциона", $"Лот '{lotTitle}' (ID={lotId}) заканчивается через менее 12 часов. Дата окончания: {expirationTime}");
                    }

                    if (!string.IsNullOrEmpty(ownerEmail))
                    {
                        SendEmail(ownerEmail, "Оповещение: Осталось менее 12 часов до окончания вашего лота", $"Ваш лот '{lotTitle}' (ID={lotId}) заканчивается через менее 12 часов. Дата окончания: {expirationTime}");
                    }
                }
            }
        }
    }

    private void SendEmail(string toEmail, string subject, string body)
    {
        using (SmtpClient smtpClient = new SmtpClient(_smtpServer, _smtpPort))
        {
            smtpClient.UseDefaultCredentials = false;
            smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
            smtpClient.EnableSsl = true;

            using (MailMessage mailMessage = new MailMessage())
            {
                mailMessage.From = new MailAddress(_smtpUsername);
                mailMessage.To.Add(toEmail);
                mailMessage.Subject = subject;
                mailMessage.Body = body;
                mailMessage.IsBodyHtml = false;

                smtpClient.Send(mailMessage);
            }
        }
    }
}
