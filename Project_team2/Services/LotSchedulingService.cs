using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using System;
using System.Net.Mail;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

public class LotSchedulingService : BackgroundService
{
    private readonly string _connectionString;
    private readonly ILogger<LotSchedulingService> _logger;
    private readonly string _smtpServer;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    public LotSchedulingService(string connectionString, ILogger<LotSchedulingService> logger, string smtpServer, int smtpPort, string smtpUsername, string smtpPassword)
    {
        _connectionString = connectionString;
        _logger = logger;
        
        _smtpServer = smtpServer;
        _smtpPort = smtpPort;
        _smtpUsername = smtpUsername;
        _smtpPassword = smtpPassword;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Lot scheduling service is starting.");

        try
        {
            await ScheduleLotTasks();
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while scheduling lot tasks: {ex}");
        }

        _logger.LogInformation("Lot scheduling service is stopping.");
    }

    private async Task ScheduleLotTasks()
    {
        using (MySqlConnection connection = new MySqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            // Получение всех активных лотов
            string query = "SELECT Id, TimeTillEnd FROM Lots WHERE Active = true";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            using (MySqlDataReader reader = await command.ExecuteReaderAsync())
            {
                while (await reader.ReadAsync())
                {
                    int lotId = reader.GetInt32("Id");
                    DateTime endTime = reader.GetDateTime("TimeTillEnd");

                    // Планирование задачи на время завершения лота
                    ScheduleTaskForLotEnd(lotId, endTime);
                }
            }
        }
    }

    private void ScheduleTaskForLotEnd(int lotId, DateTime endTime)
    {
        // Рассчитываем время до завершения лота
        TimeSpan timeUntilEnd = endTime - DateTime.Now;

        // Проверяем, что время до завершения положительное
        if (timeUntilEnd.TotalMilliseconds > 0)
        {
            // Планирование задачи для завершения лота
            Task.Delay(timeUntilEnd).ContinueWith(async _ =>
            {
                try
                {
                    // Выполнение действий для завершения лота
                    await DeactivateLot(lotId);
                }
                catch (Exception ex)
                {
                    _logger.LogError($"An error occurred while deactivating lot {lotId}: {ex}");
                }
            });

            // Вывод информации о запланированной задаче в консоль
            Console.WriteLine($"Task scheduled for lot {lotId} end at {endTime}");
        }
        else
        {
            _logger.LogWarning($"Task for lot {lotId} could not be scheduled because end time has already passed.");
        }
    }

    private async Task DeactivateLot(int lotId)
    {
        using (MySqlConnection connection = new MySqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            string winnerUserId;
            string ownerId;
            string lotTitle;
            // Получение информации о победителе и владельце лота, а также название лота
            string getUserInfoQuery = @"
    SELECT b.UserId AS WinnerUserId, l.UserId AS OwnerId, l.Title
    FROM Bids b
    INNER JOIN Lots l ON b.LotId = l.Id
    WHERE b.LotId = @LotId
    ORDER BY b.BidAmount DESC
    LIMIT 1";

            using (MySqlCommand getUserInfoCommand = new MySqlCommand(getUserInfoQuery, connection))
            {
                getUserInfoCommand.Parameters.AddWithValue("@LotId", lotId);
                using (MySqlDataReader reader = await getUserInfoCommand.ExecuteReaderAsync())
                {
                    if (reader.Read())
                    {
                        winnerUserId = reader.GetString("WinnerUserId");
                        ownerId = reader.GetString("OwnerId");
                        lotTitle = reader.GetString("Title");
                    }
                    else
                    {
                        // Если не найдено ставок, выходим из метода
                        return;
                    }
                }
            }

            // Получение адресов электронной почты победителя и владельца лота
            string winnerEmailQuery = "SELECT Email FROM Users WHERE Id = @WinnerUserId";
            string ownerEmailQuery = "SELECT Email FROM Users WHERE Id = @OwnerId";

            string winnerEmail;
            string ownerEmail;

            using (MySqlCommand winnerEmailCommand = new MySqlCommand(winnerEmailQuery, connection))
            {
                winnerEmailCommand.Parameters.AddWithValue("@WinnerUserId", winnerUserId);
                winnerEmail = (string)await winnerEmailCommand.ExecuteScalarAsync();
            }

            using (MySqlCommand ownerEmailCommand = new MySqlCommand(ownerEmailQuery, connection))
            {
                ownerEmailCommand.Parameters.AddWithValue("@OwnerId", ownerId);
                ownerEmail = (string)await ownerEmailCommand.ExecuteScalarAsync();
            }

            // Отправка письма владельцу лота
            await SendEmailAsync(ownerEmail, $"Ваш лот \"{lotTitle}\" завершен", "Ваш лот завершен, ожидайте оплату от победителя. Пожалуйста, приготовьте товар к отправке. С уважением, Exestic.");

            // Отправка письма победителю лота
            await SendEmailAsync(winnerEmail, $"Поздравляем! Вы победили в лоте \"{lotTitle}\"", "Поздравляем! Вы победили в аукционе. Пожалуйста, оплатите товар.");

            // Обновление состояния лота и поля WinnerUserId в базе данных
            string updateLotQuery = "UPDATE Lots SET Active = false, AllowBids = false, IsWaitingPayment = true, WinnerUserId = @WinnerUserId WHERE Id = @LotId";
            using (MySqlCommand command = new MySqlCommand(updateLotQuery, connection))
            {
                command.Parameters.AddWithValue("@LotId", lotId);
                command.Parameters.AddWithValue("@WinnerUserId", winnerUserId);
                await command.ExecuteNonQueryAsync();
            }
        }

        _logger.LogInformation($"Lot {lotId} has been deactivated.");
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