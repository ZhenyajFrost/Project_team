using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using System;
using Project_team2;
using System.Text.Json.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using Newtonsoft.Json.Linq;
using System.Reflection.PortableExecutable;
using System.Security.Cryptography;

namespace Project2.Controllers
{
    [Route("api/lots")]
    [ApiController]
    public class LotsController : ControllerBase
    {
        private readonly ILogger<LotSchedulingService> _logger;
        private readonly string _connString;
        public LotsController() {
            _connString = Config.MySqlConnection;
        }
        public string ExtractUserIdFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtToken = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (jwtToken != null)
            {
                var userIdClaim = jwtToken.Claims.FirstOrDefault(claim => claim.Type == "UserId");
                if (userIdClaim != null)
                {
                    return userIdClaim.Value;
                }
            }

            return null;
        }

        [HttpPost("createLot")]
        public IActionResult CreateLot([FromBody] LotModel model)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "INSERT INTO Lots (title, price, shortDescription, category, timeTillEnd, imageURLs, UserId, region, city, IsNew, MinPrice, MinStepPrice) " +
                            "VALUES (@title, @price, @shortDescription, @category, @timeTillEnd, @imageURLs, @userId, @region, @city, @isNew, @minPrice, @minStepPrice)";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@title", model.Title);
                        command.Parameters.AddWithValue("@price", model.Price);
                        command.Parameters.AddWithValue("@shortDescription", model.ShortDescription);
                        command.Parameters.AddWithValue("@category", model.Category);
                        command.Parameters.AddWithValue("@timeTillEnd", model.TimeTillEnd);
                        command.Parameters.AddWithValue("@imageURLs", string.Join(",", model.ImageURLs));
                        command.Parameters.AddWithValue("@userId", model.UserId);
                        command.Parameters.AddWithValue("@region", model.Region);
                        command.Parameters.AddWithValue("@city", model.City);
                        command.Parameters.AddWithValue("@isNew", model.IsNew);
                        command.Parameters.AddWithValue("@minPrice", model.MinPrice);
                        command.Parameters.AddWithValue("@minStepPrice", model.MinStepPrice);

                        command.ExecuteNonQuery();
                    }

                    // Получение идентификатора созданного лота
                    int createdLotId = GetCreatedLotId(connection);

                    // Планирование задачи на момент завершения лота
                    DateTime endTime = DateTime.Parse(model.TimeTillEnd);

                    // Планирование задачи на время завершения лота

                    ScheduleTaskForLotEnd(createdLotId, endTime);

                    return Ok(new { message = "Lot created successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
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
            using (MySqlConnection connection = new MySqlConnection(_connString))
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

        private int GetCreatedLotId(MySqlConnection connection)
        {
            string query = "SELECT LAST_INSERT_ID()";
            using (MySqlCommand command = new MySqlCommand(query, connection))
            {
                return Convert.ToInt32(command.ExecuteScalar());
            }
        }

        [HttpPost("getHotsLot")]
        public IActionResult GetHotLots(int page = 1, int pageSize = 10)
        {
            try
            {
                List<Lot> hotLots = new List<Lot>();
                int totalCount = 0;

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Выборка активных лотов, у которых таймер TimeTillEnd менее 24 часов
                    string queryTimeTillEnd = "SELECT * FROM Lots WHERE Active = true AND TimeTillEnd < DATE_ADD(NOW(), INTERVAL 24 HOUR)";
                    using (MySqlCommand commandTimeTillEnd = new MySqlCommand(queryTimeTillEnd, connection))
                    {
                        using (MySqlDataReader reader = commandTimeTillEnd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                hotLots.Add(lot);
                            }
                        }
                    }

                    // Выборка активных лотов, у которых последняя ставка составляет 90% или более от начальной цены
                    string queryCurrentBid = "SELECT * FROM Lots WHERE Active = true AND CurrentBid >= Price * 0.9";
                    using (MySqlCommand commandCurrentBid = new MySqlCommand(queryCurrentBid, connection))
                    {
                        using (MySqlDataReader reader = commandCurrentBid.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                if (!hotLots.Contains(lot)) // Убеждаемся, что лоты, которые уже были добавлены из предыдущего запроса, не добавляются снова
                                {
                                    hotLots.Add(lot);
                                }
                            }
                        }
                    }

                    // Получение общего количества найденных лотов
                    totalCount = hotLots.Count;

                    // Применение пагинации
                    hotLots = hotLots.Skip((page - 1) * pageSize).Take(pageSize).ToList();
                }

                return Ok(new { hotLots, totalCount });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetHotLots method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }


        [HttpGet("getAllLots")]
        public IActionResult GetAllLots(int page = 1, int pageSize = 10)
        {
            try
            {
                if (page <= 0 || pageSize <= 0)
                {
                    return BadRequest("Page and pageSize values should be greater than zero.");
                }

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string countQuery = "SELECT COUNT(*) FROM Lots WHERE Active = true";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        int totalCount = Convert.ToInt32(countCommand.ExecuteScalar());

                        int offset = (page - 1) * pageSize;

                        string query = "SELECT * FROM Lots WHERE Active = true LIMIT @pageSize OFFSET @offset";
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@pageSize", pageSize);
                            command.Parameters.AddWithValue("@offset", offset);

                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                List<LotModel> lots = new List<LotModel>();
                                while (reader.Read())
                                {
                                    LotModel lot = new LotModel();
                                    lot.Id = reader.GetInt32("id");
                                    lot.Title = reader.GetString("title");
                                    lot.Price = reader.GetDecimal("price");
                                    lot.ShortDescription = reader.GetString("shortDescription");
                                    lot.Category = int.Parse(reader.GetString("category"));
                                    lot.TimeTillEnd = reader.GetDateTime("timeTillEnd").ToString();
                                    lot.ImageURLs = reader["ImageURLs"].ToString().Split(',');
                                    lot.UserId = reader.GetInt16("UserId");
                                    lot.Region = reader["region"].ToString();
                                    lot.City = reader["city"].ToString();
                                    lot.IsNew = Convert.ToBoolean(reader["isNew"]);
                                    lot.MinPrice = reader.GetDecimal("minPrice");
                                    lot.MinStepPrice = reader.GetDecimal("minStepPrice");

                                    // Handle null values and type conversion errors if needed

                                    lots.Add(lot);
                                }

                                return Ok(new { lots, totalCount });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetAllLots method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }


        [HttpGet("getLotsByCategory")]
        public IActionResult GetLotsByCategory(string category, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос на получение общего количества лотов по указанной категории
                    string countQuery = "SELECT COUNT(*) FROM Lots WHERE Category = @category";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@category", category);
                        int totalCount = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Строим запрос на выборку лотов по категории с учетом пагинации
                        string query = "SELECT * FROM Lots WHERE Category = @category " +
                                       "ORDER BY Id DESC LIMIT @pageSize OFFSET @offset";

                        // Вычисляем смещение (offset) на основе номера страницы и размера страницы
                        int offset = (pageNumber - 1) * pageSize;

                        // Выполняем запрос на выборку
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@category", category);
                            command.Parameters.AddWithValue("@pageSize", pageSize);
                            command.Parameters.AddWithValue("@offset", offset);

                            // Создаем список для хранения результатов выборки
                            List<LotModel> lots = new List<LotModel>();

                            // Читаем результаты выборки
                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    // Создаем объект LotModel для каждой строки результата
                                    LotModel lot = new LotModel
                                    {
                                        Id = Convert.ToInt32(reader["Id"]),
                                        Title = reader["Title"].ToString(),
                                        Price = Convert.ToDecimal(reader["Price"]),
                                        CurrentBid = Convert.ToDecimal(reader["CurrentBid"]),
                                        ShortDescription = reader["ShortDescription"].ToString(),
                                        Category = (int)reader["Category"],
                                        TimeTillEnd = reader["TimeTillEnd"].ToString(),
                                        // Парсим строку ImageURLs в массив строк
                                        ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                        UserId = reader.GetInt16("UserId"),
                                        Region = reader["region"].ToString(), // Добавляем извлечение региона из базы данных
                                        City = reader["city"].ToString(), // Добавляем извлечение города из базы данных
                                        IsNew = Convert.ToBoolean(reader["isNew"]), // Добавляем извлечение IsNew из базы данных
                                        MinPrice = reader.GetDecimal("minPrice"), // Добавляем извлечение MinPrice из базы данных
                                        MinStepPrice = reader.GetDecimal("minStepPrice") // Добавляем извлечение MinStepPrice из базы данных
                                    };

                                    // Добавляем лот в список
                                    lots.Add(lot);
                                }
                            }

                            // Возвращаем список лотов и общее количество
                            return Ok(new { lots, totalCount });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // В случае ошибки возвращаем статус 500 и сообщение об ошибке
                Console.WriteLine($"Error getting lots by category: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }

        [HttpGet("getLotsByUser")]
        public IActionResult GetLotsByUser(int userId, string? searchQuery = "", decimal? minPrice = null, decimal? maxPrice = null, DateTime? timeTillEnd = null, string? sortBy = "", int? category = null, bool active = false, bool archive = false, bool unactive = false, bool isWaitingPayment = false, bool isWaitingDelivery = false, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Формируем условие для фильтрации по состоянию лотов
                    string condition = "";
                    if (active)
                    {
                        condition += " AND Active = true";
                    }
                    if (archive)
                    {
                        condition += " AND Archive = true";
                    }
                    if (unactive)
                    {
                        condition += " AND Unactive = true";
                    }
                    if (isWaitingPayment)
                    {
                        condition += " AND isWaitingPayment = true";
                    }
                    if (isWaitingDelivery)
                    {
                        condition += " AND isWaitingDelivery = true";
                    }

                    // Формируем условие для поиска по запросу
                    string searchCondition = "";
                    if (!string.IsNullOrEmpty(searchQuery))
                    {
                        searchCondition = " AND Title LIKE @searchQuery";
                    }

                    // Формируем условие для выборки по категории
                    string categoryCondition = "";
                    if (category != null)
                    {
                        categoryCondition = " AND Category = @category";
                    }

                    // Запрос на получение общего количества лотов, созданных выбранным пользователем
                    string countQuery = $"SELECT COUNT(*) FROM Lots WHERE UserId = @userId {condition}{searchCondition}{categoryCondition}";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@userId", userId);
                        if (!string.IsNullOrEmpty(searchQuery))
                        {
                            countCommand.Parameters.AddWithValue("@searchQuery", $"%{searchQuery}%");
                        }
                        if (category != null)
                        {
                            countCommand.Parameters.AddWithValue("@category", category);
                        }
                        int totalCount = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Строим запрос на выборку лотов, созданных пользователем, с учетом пагинации и фильтрации
                        string query = $"SELECT * FROM Lots WHERE UserId = @userId {condition}{searchCondition}{categoryCondition} ORDER BY Id DESC LIMIT @pageSize OFFSET @offset";

                        // Вычисляем смещение (offset) на основе номера страницы и размера страницы
                        int offset = (pageNumber - 1) * pageSize;

                        // Выполняем запрос на выборку
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@userId", userId);
                            if (!string.IsNullOrEmpty(searchQuery))
                            {
                                command.Parameters.AddWithValue("@searchQuery", $"%{searchQuery}%");
                            }
                            if (category != null)
                            {
                                command.Parameters.AddWithValue("@category", category);
                            }
                            command.Parameters.AddWithValue("@pageSize", pageSize);
                            command.Parameters.AddWithValue("@offset", offset);

                            // Создаем список для хранения результатов выборки
                            List<LotModel> lots = new List<LotModel>();

                            // Читаем результаты выборки
                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    // Создаем объект LotModel для каждой строки результата
                                    LotModel lot = new LotModel
                                    {
                                        Id = Convert.ToInt32(reader["Id"]),
                                        Title = reader["Title"].ToString(),
                                        Price = Convert.ToDecimal(reader["Price"]),
                                        CurrentBid = Convert.ToDecimal(reader["CurrentBid"]),
                                        ShortDescription = reader["ShortDescription"].ToString(),
                                        Category = (int)reader["Category"],
                                        TimeTillEnd = reader["TimeTillEnd"].ToString(),
                                        // Парсим строку ImageURLs в массив строк
                                        ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                        UserId = reader.GetInt16("UserId"),
                                        Region = reader["region"].ToString(), // Добавляем извлечение региона из базы данных
                                        City = reader["city"].ToString(), // Добавляем извлечение города из базы данных
                                        IsNew = Convert.ToBoolean(reader["isNew"]), // Добавляем извлечение IsNew из базы данных
                                        MinPrice = reader.GetDecimal("minPrice"), // Добавляем извлечение MinPrice из базы данных
                                        MinStepPrice = reader.GetDecimal("minStepPrice") // Добавляем извлечение MinStepPrice из базы данных
                                    };

                                    // Добавляем лот в список
                                    lots.Add(lot);
                                }
                            }
                            // Возвращаем список лотов и общее количество
                            return Ok(new { lots, totalCount });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // В случае ошибки возвращаем статус 500 и сообщение об ошибке
                Console.WriteLine($"Error getting lots by user: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }



        [HttpPost("updateLot")]
        public IActionResult UpdateLot([FromBody] UpdateLotRequest request)
        {
            try
            {
                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Строим запрос на обновление данных лота
                    string query = "UPDATE Lots SET ";

                    // Проверяем наличие идентификатора лота в запросе
                    if (request.LotId == 0)
                    {
                        return BadRequest(new { message = "Lot Id is required" });
                    }

                    // Проверяем наличие полей для обновления
                    if (request.FieldsToUpdate == null || request.FieldsToUpdate.Count == 0)
                    {
                        return BadRequest(new { message = "Fields to update are required" });
                    }

                    // Добавляем каждое поле из запроса к запросу на обновление
                    foreach (var field in request.FieldsToUpdate)
                    {
                        query += $"{field.Key} = '{field.Value}', ";
                    }

                    // Удаляем последнюю запятую и пробел из запроса
                    query = query.TrimEnd(',', ' ');

                    // Добавляем условие WHERE для выбора лота по идентификатору
                    query += $" WHERE id = {request.LotId}";

                    // Выполняем запрос на обновление
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.ExecuteNonQuery();
                    }

                    // Возвращаем успешный результат
                    return Ok(new { message = "Lot updated successfully" });
                }
            }
            catch (Exception ex)
            {
                // В случае ошибки возвращаем статус 500 и сообщение об ошибке
                Console.WriteLine($"Error updating lot: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }

        [HttpPost("deleteLot")]
        public IActionResult DeleteLot(int id)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string deleteLikedLotsQuery = "DELETE FROM LikedLots WHERE LotId = @id";
                    using (MySqlCommand deleteLikedLotsCommand = new MySqlCommand(deleteLikedLotsQuery, connection))
                    {
                        deleteLikedLotsCommand.Parameters.AddWithValue("@id", id);
                        deleteLikedLotsCommand.ExecuteNonQuery();
                    }
                    // Первый шаг: Удаляем связанные записи из таблицы Bids
                    string deleteBidsQuery = "DELETE FROM Bids WHERE LotId = @id";
                    using (MySqlCommand deleteBidsCommand = new MySqlCommand(deleteBidsQuery, connection))
                    {
                        deleteBidsCommand.Parameters.AddWithValue("@id", id);
                        deleteBidsCommand.ExecuteNonQuery();
                    }

                    // Второй шаг: Удаляем лот из таблицы Lots
                    string deleteLotQuery = "DELETE FROM Lots WHERE Id = @id";
                    using (MySqlCommand deleteLotCommand = new MySqlCommand(deleteLotQuery, connection))
                    {
                        deleteLotCommand.Parameters.AddWithValue("@id", id);
                        deleteLotCommand.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot deleted successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
        [HttpPost("UnactiveLot")]
        public IActionResult UnactiveLot(int id)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Утверждаем лот в базе данных
                    string query = "UPDATE Lots SET active = false, unactive = true, archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot approved successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ApproveLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
        [HttpPost("ArchiveLot")]
        public IActionResult ArchiveLot(int id)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Утверждаем лот в базе данных
                    string query = "UPDATE Lots SET active = false, unactive = false, archive = true, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot Archive successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ArchiveLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
        [HttpPost("isWaitingPaymentLot")]
        public IActionResult isWaitingPaymentLot(int id)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Утверждаем лот в базе данных
                    string query = "UPDATE Lots SET Active = false, Unactive = false, Archive = false, isWaitingDelivery = false, isWaitingPayment = true WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot approved successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ApproveLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
        [HttpPost("approveLot")]
        public IActionResult ApproveLot(int id)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Утверждаем лот в базе данных
                    string query = "UPDATE Lots SET approved = true, Active = true, Unactive = false, Archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot approved successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ApproveLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        [HttpPost("toggleLike")]
        public IActionResult ToggleLike([FromBody] LikesLot likesLot)
        {

            var UserId = ExtractUserIdFromToken(likesLot.Token);
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Проверяем, существует ли запись о лайке для данного пользователя и лота
                    string checkQuery = "SELECT COUNT(*) FROM LikedLots WHERE UserId = @userId AND LotId = @lotId";
                    using (MySqlCommand checkCommand = new MySqlCommand(checkQuery, connection))
                    {
                        checkCommand.Parameters.AddWithValue("@userId", UserId);
                        checkCommand.Parameters.AddWithValue("@lotId", likesLot.LotId);
                        int count = Convert.ToInt32(checkCommand.ExecuteScalar());

                        if (count > 0)
                        {
                            // Если запись о лайке уже существует, удаляем ее
                            string deleteQuery = "DELETE FROM LikedLots WHERE UserId = @userId AND LotId = @lotId";
                            using (MySqlCommand deleteCommand = new MySqlCommand(deleteQuery, connection))
                            {
                                deleteCommand.Parameters.AddWithValue("@userId", UserId);
                                deleteCommand.Parameters.AddWithValue("@lotId", likesLot.LotId);
                                deleteCommand.ExecuteNonQuery();
                            }

                            return Ok(new { message = "Lot unliked successfully" });
                        }
                        else
                        {
                            // Если запись о лайке не существует, добавляем ее
                            string insertQuery = "INSERT INTO LikedLots (UserId, LotId) VALUES (@userId, @lotId)";
                            using (MySqlCommand insertCommand = new MySqlCommand(insertQuery, connection))
                            {
                                insertCommand.Parameters.AddWithValue("@userId", UserId);
                                insertCommand.Parameters.AddWithValue("@lotId", likesLot.LotId);
                                insertCommand.ExecuteNonQuery();
                            }

                            return Ok(new { message = "Lot liked successfully" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ToggleLike method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }


        [HttpPost("SearchLots")]
        public IActionResult SearchLots(string searchString, string category, decimal? minPrice, decimal? maxPrice, string region, string city, bool? isNew, string sortBy, int page = 1, int pageSize = 10)
        {
            try
            {
                List<Lot> searchResults = new List<Lot>();
                int totalRecords = 0;
                int totalPages = 0;

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Начало запроса для выборки лотов
                    string query = "SELECT * FROM Lots WHERE Active = true AND ";

                    // Динамическое формирование условий запроса в зависимости от переданных параметров
                    List<string> conditions = new List<string>();

                    if (!string.IsNullOrWhiteSpace(searchString))
                    {
                        conditions.Add("(Title LIKE @SearchString OR ShortDescription LIKE @SearchString)");
                    }

                    if (!string.IsNullOrWhiteSpace(category))
                    {
                        conditions.Add("Category = @Category");
                    }

                    if (minPrice.HasValue)
                    {
                        conditions.Add("Price >= @MinPrice");
                    }

                    if (maxPrice.HasValue)
                    {
                        conditions.Add("Price <= @MaxPrice");
                    }

                    if (!string.IsNullOrWhiteSpace(region))
                    {
                        conditions.Add("Region = @Region");
                    }

                    if (!string.IsNullOrWhiteSpace(city))
                    {
                        conditions.Add("City = @City");
                    }

                    if (isNew.HasValue)
                    {
                        conditions.Add("IsNew = @IsNew");
                    }

                    // Объединяем все условия с помощью оператора AND
                    query += string.Join(" AND ", conditions);

                    // Получаем общее количество найденных лотов
                    string countQuery = $"SELECT COUNT(*) FROM ({query}) AS TotalRecords";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        // Добавляем параметры запроса
                        AddQueryParameters(countCommand, searchString, category, minPrice, maxPrice, region, city, isNew);

                        totalRecords = Convert.ToInt32(countCommand.ExecuteScalar());
                        totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);
                    }

                    // Добавляем условие сортировки
                    switch (sortBy)
                    {
                        case "name":
                            query += " ORDER BY Title";
                            break;
                        case "price":
                            query += " ORDER BY Price";
                            break;
                        case "expiration":
                            query += " ORDER BY TimeTillEnd";
                            break;
                        default:
                            break;
                    }

                    // Добавляем условие для пагинации
                    query += $" LIMIT @StartIndex, @PageSize";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        // Добавляем параметры запроса
                        AddQueryParameters(command, searchString, category, minPrice, maxPrice, region, city, isNew);

                        // Добавляем параметры для пагинации
                        int startIndex = (page - 1) * pageSize;
                        command.Parameters.AddWithValue("@StartIndex", startIndex);
                        command.Parameters.AddWithValue("@PageSize", pageSize);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                // Создаем объекты лотов из результатов запроса и добавляем их в список результатов
                                Lot lot = new Lot(reader);
                                searchResults.Add(lot);
                            }
                        }
                    }
                }

                return Ok(new { searchResults, totalRecords, totalPages, currentPage = page });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SearchLots method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        private void AddQueryParameters(MySqlCommand command, string searchString, string category, decimal? minPrice, decimal? maxPrice, string region, string city, bool? isNew)
        {
            if (!string.IsNullOrWhiteSpace(searchString))
            {
                command.Parameters.AddWithValue("@SearchString", "%" + searchString + "%");
            }
            if (!string.IsNullOrWhiteSpace(category))
            {
                command.Parameters.AddWithValue("@Category", category);
            }
            if (minPrice.HasValue)
            {
                command.Parameters.AddWithValue("@MinPrice", minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                command.Parameters.AddWithValue("@MaxPrice", maxPrice.Value);
            }
            if (!string.IsNullOrWhiteSpace(region))
            {
                command.Parameters.AddWithValue("@Region", region);
            }
            if (!string.IsNullOrWhiteSpace(city))
            {
                command.Parameters.AddWithValue("@City", city);
            }
            if (isNew.HasValue)
            {
                command.Parameters.AddWithValue("@IsNew", isNew.Value);
            }
        }


        [HttpPost("getUserLikedLots")]
        public IActionResult GetUserLikedLots([FromBody] getUserLikedLots model, int page = 1, int pageSize = 10)
        {

            var UserId = ExtractUserIdFromToken(model.Token);
            try
            {
                List<Lot> likedLots = new List<Lot>();

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос для получения общего количества лотов
                    string countQuery = "SELECT COUNT(*) FROM LikedLots LL JOIN Lots L ON LL.LotId = L.Id WHERE LL.UserId = @userId";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@userId", UserId);
                        int totalRecords = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Вычисляем количество страниц
                        int totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

                        // Проверяем, чтобы номер страницы был в допустимых пределах
                        if (page < 1)
                            page = 1;
                        else if (page > totalPages)
                            page = totalPages;

                        // Рассчитываем индекс начальной записи для страницы
                        int startIndex = (page - 1) * pageSize;

                        // Запрос для получения лотов с учетом пагинации
                        string query = "SELECT L.* FROM LikedLots LL JOIN Lots L ON LL.LotId = L.Id WHERE LL.UserId = @userId LIMIT @startIndex, @pageSize";
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@userId", UserId);
                            command.Parameters.AddWithValue("@startIndex", startIndex);
                            command.Parameters.AddWithValue("@pageSize", pageSize);

                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    Lot lot = new Lot(reader); // Создание объекта Lot из данных в результате запроса
                                    likedLots.Add(lot);
                                }
                            }
                        }

                        return Ok(new { likedLots, totalRecords, totalPages, currentPage = page });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserLikedLots method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }


        [HttpGet("getLotById/{id}")]
        public IActionResult GetLotById(int id)
        {
            try
            {
                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос к базе данных для получения лота по его идентификатору
                    // Увеличиваем значение Views на 1
                    string updateViewsQuery = "UPDATE Lots SET Views = Views + 1 WHERE Id = @id";
                    using (MySqlCommand updateCommand = new MySqlCommand(updateViewsQuery, connection))
                    {
                        updateCommand.Parameters.AddWithValue("@id", id);
                        updateCommand.ExecuteNonQuery();
                    }
                    string query = "SELECT * FROM Lots WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Создание объекта лота на основе данных из базы данных
                                Lot lot = new Lot(reader);

                               

                                // Возвращаем найденный лот
                                return Ok(lot);
                            }
                            else
                            {
                                // Если лот с указанным идентификатором не найден, возвращаем NotFound
                                return NotFound(new { message = "Lot not found" });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // В случае ошибки возвращаем статус 500 и сообщение об ошибке
                Console.WriteLine($"Error getting lot by id: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }


       


    }
    public class getUserLikedLots { 
    public string Token { get; set; }
    }
    public class LikesLot { 
    public string Token { get; set; }
    public int LotId { get; set; }
    }
    public class UpdateLotRequest
    {
        public int LotId { get; set; }
        public Dictionary<string, string> FieldsToUpdate { get; set; }
    }
    public class LotModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public decimal CurrentBid { get; set; }
        public string ShortDescription { get; set; }
        public int Category { get; set; }
        public string TimeTillEnd { get; set; }
        public string[] ImageURLs { get; set; }
        public int UserId { get; set; }
        public string Region { get; set; }
        public string City { get; set; }
        public bool IsNew { get; set; } // Новое свойство для флага "новый"
        public decimal MinPrice { get; set; } // Новое свойство для минимальной цены
        public decimal MinStepPrice { get; set; } // Новое свойство для минимального шага цены
    }

}
