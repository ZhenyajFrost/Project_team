using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using System;
using System.Threading;
using System.Threading.Tasks;

public class LotSchedulingService : BackgroundService
{
    private readonly string _connectionString;
    private readonly ILogger<LotSchedulingService> _logger;

    public LotSchedulingService(string connectionString, ILogger<LotSchedulingService> logger)
    {
        _connectionString = connectionString;
        _logger = logger;
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
        // Выполнение действий для завершения лота
        using (MySqlConnection connection = new MySqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            // Получение идентификатора пользователя с самой большой ставкой на лот
            string getUserIdQuery = "SELECT UserId FROM Bids WHERE LotId = @LotId ORDER BY BidAmount DESC LIMIT 1";
            using (MySqlCommand getUserIdCommand = new MySqlCommand(getUserIdQuery, connection))
            {
                getUserIdCommand.Parameters.AddWithValue("@LotId", lotId);
                var winnerUserId = await getUserIdCommand.ExecuteScalarAsync();

                // Обновление состояния лота и поля WinnerUserId в базе данных
                string updateLotQuery = "UPDATE Lots SET Active = false, AllowBids = false, isWaitingPayment = true, WinnerUserId = @WinnerUserId WHERE Id = @LotId";
                using (MySqlCommand command = new MySqlCommand(updateLotQuery, connection))
                {
                    command.Parameters.AddWithValue("@LotId", lotId);
                    command.Parameters.AddWithValue("@WinnerUserId", winnerUserId);
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        _logger.LogInformation($"Lot {lotId} has been deactivated.");
    }

}
