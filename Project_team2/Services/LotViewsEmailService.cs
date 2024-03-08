using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Mail;
using System.Threading;
using System.Threading.Tasks;

public class LotViewsEmailService : BackgroundService
{
    private readonly string _connString;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
  

    public LotViewsEmailService(string connString, string smtpServer, int smtpPort, string smtpUsername, string smtpPassword)
    {
        _connString = connString;
        _smtpServer = smtpServer;
        _smtpPort = smtpPort;
        _smtpUsername = smtpUsername;
        _smtpPassword = smtpPassword;
        
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Console.WriteLine("Lot views email service is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessLotsAndSendEmail();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while processing lots and sending email: {ex}");
            }

            // Ожидаем 5 минут перед повторным запуском
            await Task.Delay(TimeSpan.FromMinutes(1440), stoppingToken);
        }

        Console.WriteLine("Lot views email service is stopping.");
    }

    private async Task ProcessLotsAndSendEmail()
    {
        Console.WriteLine("Processing lots and sending email.");

        List<string> recipientEmails = new List<string>();

        using (MySqlConnection connection = new MySqlConnection(_connString))
        {
            await connection.OpenAsync();

            // Получаем адреса электронной почты пользователей, у которых установлен флаг NotificationsAdvices = true
            string getUsersWithEmailsQuery = "SELECT Email FROM Users WHERE NotificationsAdvices = true";
            using (MySqlCommand getUsersCommand = new MySqlCommand(getUsersWithEmailsQuery, connection))
            using (MySqlDataReader emailReader = await getUsersCommand.ExecuteReaderAsync())
            {
                while (await emailReader.ReadAsync())
                {
                    recipientEmails.Add(emailReader.GetString("Email"));
                }
            }

            Console.WriteLine($"Found {recipientEmails.Count} recipient(s) with notification advices enabled.");

            // Получаем данные о лоте с наибольшим количеством просмотров
            string query = "SELECT * FROM Lots ORDER BY Views DESC LIMIT 1";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            using (MySqlDataReader reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    // Получаем данные о лоте с наибольшим количеством просмотров
                    int lotId = reader.GetInt32("Id");
                    string lotTitle = reader.GetString("Title");
                    int views = reader.GetInt32("Views");

                    Console.WriteLine($"Found lot with ID={lotId}, Title='{lotTitle}', Views={views}.");

                    // Отправляем письмо с информацией о лоте каждому пользователю
                    foreach (var email in recipientEmails)
                    {
                        string emailBody = $"Лот с наибольшим количеством просмотров: ID={lotId}, Название={lotTitle}, Просмотры={views}" +
                            $"" +
                            $"Ссылка: https://localhost:44424/lot/{lotId}";
                        SendEmail(email, "Лот с наибольшим количеством просмотров", emailBody);
                    }

                    Console.WriteLine("Emails sent successfully.");
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
