﻿using Microsoft.Extensions.Hosting;
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

    private async Task DeactivateLot(int lotId)
    {
        // Выполнение действий для завершения лота
        using (MySqlConnection connection = new MySqlConnection(_connectionString))
        {
            await connection.OpenAsync();

            // Обновление состояния лота в базе данных
            string query = "UPDATE Lots SET Active = false, Unactive = true WHERE Id = @LotId";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            {
                command.Parameters.AddWithValue("@LotId", lotId);
                await command.ExecuteNonQueryAsync();
            }
        }

        _logger.LogInformation($"Lot {lotId} has been deactivated.");
    }
}