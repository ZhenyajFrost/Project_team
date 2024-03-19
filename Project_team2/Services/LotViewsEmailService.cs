using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

using MySqlConnector;
using System;
using System.Collections.Generic;
using System.IO;
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

            // Wait for 24 hours before running again
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

            // Get emails of users with NotificationsAdvices set to true
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

            // Get data of the lot with the highest number of views
            string query = "SELECT * FROM Lots ORDER BY Views DESC LIMIT 1";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            using (MySqlDataReader reader = await command.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync())
                {
                    int lotId = reader.GetInt32("Id");
                    string lotTitle = reader.GetString("Title");
                    string lotDescription = reader.GetString("ShortDescription");
                    string imageUrlString = reader.GetString("ImageUrls"); // Получение строки URL изображения из базы данных

                    // Разделение строки на массив по запятой и взятие первого элемента
                    string[] imageUrlArray = imageUrlString.Split(',');
                    string imageUrl = imageUrlArray[0];
                    Console.WriteLine($"Found lot with ID={lotId}, Title='{lotTitle}'.");

                    // Read HTML template content
                    string htmlTemplate = await File.ReadAllTextAsync("Pages/Sending.html");

                    // Replace placeholders with data from the database
                    htmlTemplate = htmlTemplate.Replace("{{Zagolovok}}", "Уважаемый пользователь! Самое время посмотреть восстребованный лот");
                    htmlTemplate = htmlTemplate.Replace("{{title}}", lotTitle);
                    htmlTemplate = htmlTemplate.Replace("{{Description}}", lotDescription);
                    htmlTemplate = htmlTemplate.Replace("{{URL_Lots}}", $"https://localhost:44424/lot/{lotId}");
                    htmlTemplate = htmlTemplate.Replace("{{image_url}}", imageUrl); // Замена заполнителя для изображения
                    // Send email with lot information to each user
                    foreach (var email in recipientEmails)
                    {
                        await SendEmailAsync(email, "Лот с наибольшим количеством просмотров", htmlTemplate);
                    }

                    Console.WriteLine("Emails sent successfully.");
                }
            }
        }
    }

    private async Task SendEmailAsync(string toEmail, string subject, string body)
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
                mailMessage.IsBodyHtml = true;

                await smtpClient.SendMailAsync(mailMessage);
            }
        }
    }
}
