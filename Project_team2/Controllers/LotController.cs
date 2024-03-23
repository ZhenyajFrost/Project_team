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
using System.Net.Mail;
using System.Net;

namespace Project2.Controllers
{
    [Route("api/lots")]
    [ApiController]
    public class LotsController : ControllerBase
    {
        private readonly ILogger<LotSchedulingService> _logger;
        private readonly string _connString;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly long _chatId;
        public LotsController()
        {
            _connString = Config.MySqlConnection;
            _smtpServer = Config.SmtpServer;
            _smtpPort = Config.SmtpPort;
            _smtpUsername = Config.SmtpUsername;
            _smtpPassword = Config.SmtpPassword;
            _chatId = Config.ChatId;
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
            using (MySqlConnection connection = new MySqlConnection(_connString))
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

                        string query = "SELECT * FROM Lots WHERE Active = true AND Approved = true LIMIT @pageSize OFFSET @offset";
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@pageSize", pageSize);
                            command.Parameters.AddWithValue("@offset", offset);

                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                List<Lot> lots = new List<Lot>();
                                while (reader.Read())
                                {
                                    Lot lot = new Lot(reader);

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
                            List<Lot> lots = new List<Lot>();

                            // Читаем результаты выборки
                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    // Создаем объект LotModel для каждой строки результата
                                    Lot lot = new Lot(reader);

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

        [HttpPost("getLotsByUser")]
        public IActionResult GetLotsByUser([FromBody] GetLotsByUserRequest request)
        {
            int userId = (int)Convert.ToInt64(ExtractUserIdFromToken(request.Token));
            int totalCount = 0;
            int pageNumber = request.PageNumber;

            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string condition = "";
                    if (request.Active)
                    {
                        condition += " AND Active = true";
                    }
                    if (request.Archive)
                    {
                        condition += " AND Archive = true";
                    }
                    if (request.Unactive)
                    {
                        condition += " AND Unactive = true";
                    }
                    if (request.IsWaitingPayment)
                    {
                        condition += " AND IsWaitingPayment = true";
                    }
                    if (request.IsWaitingDelivery)
                    {
                        condition += " AND IsWaitingDelivery = true";
                    }

                    string searchCondition = !string.IsNullOrEmpty(request.SearchQuery) ? " AND Title LIKE @SearchQuery" : "";
                    string categoryCondition = request.Category.HasValue ? " AND Category = @Category" : "";
                    string priceCondition = "";
                    if (request.MinPrice.HasValue)
                    {
                        priceCondition += " AND Price >= @MinPrice";
                    }
                    if (request.MaxPrice.HasValue)
                    {
                        priceCondition += " AND Price <= @MaxPrice";
                    }
                    string timeCondition = request.TimeTillEnd.HasValue ? " AND TimeTillEnd <= @TimeTillEnd" : "";
                    string regionCondition = !string.IsNullOrEmpty(request.Region) ? " AND Region = @Region" : "";
                    string cityCondition = !string.IsNullOrEmpty(request.City) ? " AND City = @City" : "";

                    string orderByClause = "";
                    if (!string.IsNullOrEmpty(request.OrderBy))
                    {
                        orderByClause = $"ORDER BY {request.OrderBy} {(request.Ascending.HasValue && request.Ascending.Value ? "ASC" : "DESC")}";
                    }

                    string query = $@"
                SELECT *
                FROM Lots
                WHERE UserId = @UserId {condition} {searchCondition} {categoryCondition} {priceCondition} {timeCondition} {regionCondition} {cityCondition}
                {orderByClause}
                LIMIT @PageSize OFFSET @Offset";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);
                        command.Parameters.AddWithValue("@PageSize", request.PageSize);
                        command.Parameters.AddWithValue("@Offset", (request.PageNumber - 1) * request.PageSize);

                        if (!string.IsNullOrEmpty(request.SearchQuery))
                        {
                            command.Parameters.AddWithValue("@SearchQuery", $"%{request.SearchQuery}%");
                        }
                        if (request.Category.HasValue)
                        {
                            command.Parameters.AddWithValue("@Category", request.Category);
                        }
                        if (request.MinPrice.HasValue)
                        {
                            command.Parameters.AddWithValue("@MinPrice", request.MinPrice);
                        }
                        if (request.MaxPrice.HasValue)
                        {
                            command.Parameters.AddWithValue("@MaxPrice", request.MaxPrice);
                        }
                        if (request.TimeTillEnd.HasValue)
                        {
                            command.Parameters.AddWithValue("@TimeTillEnd", request.TimeTillEnd);
                        }
                        if (!string.IsNullOrEmpty(request.Region))
                        {
                            command.Parameters.AddWithValue("@Region", request.Region);
                        }
                        if (!string.IsNullOrEmpty(request.City))
                        {
                            command.Parameters.AddWithValue("@City", request.City);
                        }

                        List<Lot> lots = new List<Lot>();

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                lots.Add(lot);
                            }
                        }

                        // Дополнительный запрос для подсчета общего количества лотов
                        string totalCountQuery = $@"
                    SELECT COUNT(*) as TotalCount
                    FROM Lots
                    WHERE UserId = @UserId {condition} {searchCondition} {categoryCondition} {priceCondition} {timeCondition} {regionCondition} {cityCondition}";

                        using (MySqlCommand totalCountCommand = new MySqlCommand(totalCountQuery, connection))
                        {
                            totalCountCommand.Parameters.AddWithValue("@UserId", userId);

                            if (!string.IsNullOrEmpty(request.SearchQuery))
                            {
                                totalCountCommand.Parameters.AddWithValue("@SearchQuery", $"%{request.SearchQuery}%");
                            }
                            if (request.Category.HasValue)
                            {
                                totalCountCommand.Parameters.AddWithValue("@Category", request.Category);
                            }
                            if (request.MinPrice.HasValue)
                            {
                                totalCountCommand.Parameters.AddWithValue("@MinPrice", request.MinPrice);
                            }
                            if (request.MaxPrice.HasValue)
                            {
                                totalCountCommand.Parameters.AddWithValue("@MaxPrice", request.MaxPrice);
                            }
                            if (request.TimeTillEnd.HasValue)
                            {
                                totalCountCommand.Parameters.AddWithValue("@TimeTillEnd", request.TimeTillEnd);
                            }
                            if (!string.IsNullOrEmpty(request.Region))
                            {
                                totalCountCommand.Parameters.AddWithValue("@Region", request.Region);
                            }
                            if (!string.IsNullOrEmpty(request.City))
                            {
                                totalCountCommand.Parameters.AddWithValue("@City", request.City);
                            }

                            totalCount = Convert.ToInt32(totalCountCommand.ExecuteScalar());
                        }

                        Dictionary<string, int> categoryCount = GetCategoryCount(userId, condition, connection);

                        return Ok(new { lots, totalCount, pageNumber, categoryCount });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting lots by user: {ex}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }


        private Dictionary<string, int> GetCategoryCount(int userId, string condition, MySqlConnection connection)
        {
            Dictionary<string, int> categoryCount = new Dictionary<string, int>();

            string categoryCountQuery = $@"
        SELECT Category, COUNT(*) as Count
        FROM Lots
        WHERE UserId = @UserId {condition}
        GROUP BY Category";

            using (MySqlCommand categoryCountCommand = new MySqlCommand(categoryCountQuery, connection))
            {
                categoryCountCommand.Parameters.AddWithValue("@UserId", userId);

                using (MySqlDataReader categoryCountReader = categoryCountCommand.ExecuteReader())
                {
                    while (categoryCountReader.Read())
                    {
                        string categoryValue = categoryCountReader.GetString("Category");
                        int count = categoryCountReader.GetInt32("Count");
                        categoryCount.Add(categoryValue, count);
                    }
                }
            }

            return categoryCount;
        }

        [HttpPost("updateLot")]
        public IActionResult UpdateLot([FromBody] UpdateLotRequest request)
        {
            try
            {
                // Проверяем, существует ли токен в запросе
                if (string.IsNullOrEmpty(request.Token))
                {
                    return BadRequest(new { message = "Token is required" });
                }

                // Извлекаем идентификатор пользователя из токена
                string userId = ExtractUserIdFromToken(request.Token);
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "Invalid token" });
                }

                // Проверяем, является ли пользователь администратором
                bool isAdmin = CheckUserIsAdmin(userId);
                if (!isAdmin)
                {
                    // Проверяем, является ли пользователь владельцем лота
                    bool isOwner = CheckUserIsOwnerOfLot(userId, request.LotId);
                    if (!isOwner)
                    {
                        return BadRequest(new { message = "User is not authorized to update this lot" });
                    }
                }

                // Получаем информацию о лоте из базы данных
                Lot lot;
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "SELECT * FROM Lots WHERE Id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (!reader.Read())
                            {
                                return NotFound(new { message = "Lot not found" });
                            }
                            lot = new Lot(reader);
                        }
                    }
                }

                // Проверяем статусы лота
                if (lot.IsWaitingPayment || lot.AllowBids || lot.IsWaitingDelivery)
                {
                    return BadRequest(new { message = "Lot cannot be updated because it has a pending status" });
                }

                // Добавляем поля Approved и Active в запрос на обновление лота

                request.FieldsToUpdate.Add("Approved", "0"); // Используем числовое представление логического значения false
                request.FieldsToUpdate.Add("Active", "0"); // Аналогично для поля Active
                request.FieldsToUpdate.Add("Unactive", "1"); // Если нужно, аналогично для Unactive
                request.FieldsToUpdate.Add("Archive", "0");
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

                    // Проверяем, нужно ли обновлять список изображений
                    bool updateImages = request.ImageURLs != null && request.ImageURLs.Any();

                    // Добавляем каждое поле из запроса к запросу на обновление
                    foreach (var field in request.FieldsToUpdate)
                    {
                        query += $"{field.Key} = '{field.Value}', ";
                    }

                    // Если нужно обновлять список изображений, добавляем его в запрос
                    if (updateImages)
                    {
                        query += "ImageURLs = @ImageURLs, ";
                    }

                    // Удаляем последнюю запятую и пробел из запроса
                    query = query.TrimEnd(',', ' ');

                    // Добавляем условие WHERE для выбора лота по идентификатору
                    query += $" WHERE id = {request.LotId}";

                    // Выполняем запрос на обновление
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        // Если нужно обновлять список изображений, добавляем параметр
                        if (updateImages)
                        {
                            command.Parameters.AddWithValue("@ImageURLs", string.Join(",", request.ImageURLs));
                        }

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


        private bool CheckUserIsAdmin(string userId)
        {
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                connection.Open();

                string query = $"SELECT IsAdmin FROM Users WHERE Id = {userId}";

                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    object result = command.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        return Convert.ToBoolean(result);
                    }
                }
            }

            return false;
        }

        private bool CheckUserIsOwnerOfLot(string userId, int lotId)
        {
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                connection.Open();

                string query = $"SELECT COUNT(*) FROM Lots WHERE Id = {lotId} AND UserID = {userId}";

                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    int count = Convert.ToInt32(command.ExecuteScalar());
                    return count > 0;
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

        private void SendEmailToUser(string userId, string explanation)
        {
            // Получить email пользователя из базы данных по его userId
            string userEmail = GetUserEmailById(userId); // Предполагается, что такой метод существует

            // Отправить письмо пользователю с объяснением
            string subject = "Your lot has been denied";
            string body = $"Dear User,\n\nYour lot has been denied for the following reason:\n\n{explanation}\n\nRegards,\nThe Admin";
            SendEmail(userEmail, subject, body);
        }
        private string GetUserEmailById(string userId)
        {
            string userEmail = null;

            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "SELECT Email FROM Users WHERE Id = @userId";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@userId", userId);
                        userEmail = command.ExecuteScalar()?.ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserEmailById method: {ex.ToString()}");
                // Здесь нужно обработать ошибку, например, записать в лог или вернуть пустую строку
            }

            return userEmail;
        }
        [HttpPost("denyLot")]
        public IActionResult DenyLot([FromBody] DenyLotRequest request)
        {
            try
            {
                string adminUserId = ExtractUserIdFromToken(request.Token);

                // Проверяем, является ли пользователь администратором
                bool isAdmin = CheckUserIsAdmin(adminUserId);

                // Если пользователь не является администратором, возвращаем ошибку
                if (!isAdmin)
                {
                    return BadRequest(new { message = "Only administrators can perform this action" });
                }

                // Получаем идентификатор пользователя по идентификатору лота
                string userId;
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string getUserIdQuery = "SELECT UserID FROM Lots WHERE Id = @lotId";
                    using (MySqlCommand getUserIdCommand = new MySqlCommand(getUserIdQuery, connection))
                    {
                        getUserIdCommand.Parameters.AddWithValue("@lotId", request.LotId);
                        userId = getUserIdCommand.ExecuteScalar()?.ToString();
                    }
                }

                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "Lot not found or user does not exist" });
                }

                // Отправляем письмо пользователю с объяснением
                string userEmail = GetUserEmailById(userId);
                if (string.IsNullOrEmpty(userEmail))
                {
                    return BadRequest(new { message = "User email not found" });
                }

                SendEmail(userEmail, "Your lot has been denied", request.Explanation);

                // Обновляем статус лота в базе данных
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "UPDATE Lots SET unactive = true, active = false, approved = false, archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot denied successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DenyLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }


        [HttpPost("deleteLot")]
        public IActionResult DeleteLot([FromBody] DeleteLot request)
        {
            try
            {
                string userId = ExtractUserIdFromToken(request.Token);
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "Invalid token" });
                }

                if (!CheckUserIsAdmin(userId))
                {
                    if (!CheckUserIsOwnerOfLot(userId, request.LotId))
                    {
                        return BadRequest(new { message = "User is not authorized to delete this lot" });
                    }
                }
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();
                    string checkBidsQuery = "SELECT COUNT(*) FROM Bids WHERE LotId = @id";
                    using (MySqlCommand checkBidsCommand = new MySqlCommand(checkBidsQuery, connection)) // заменяем _connString на connection
                    {
                        checkBidsCommand.Parameters.AddWithValue("@id", request.LotId);
                        int bidsCount = Convert.ToInt32(checkBidsCommand.ExecuteScalar());
                        if (bidsCount > 0)
                        {
                            return BadRequest(new { message = "Нельзя удалить лот на котором уже есть ставки" });
                        }
                    }
                }

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string deleteLikedLotsQuery = "DELETE FROM LikedLots WHERE LotId = @id";
                    using (MySqlCommand deleteLikedLotsCommand = new MySqlCommand(deleteLikedLotsQuery, connection))
                    {
                        deleteLikedLotsCommand.Parameters.AddWithValue("@id", request.LotId);
                        deleteLikedLotsCommand.ExecuteNonQuery();
                    }

                    string deleteBidsQuery = "DELETE FROM Bids WHERE LotId = @id";
                    using (MySqlCommand deleteBidsCommand = new MySqlCommand(deleteBidsQuery, connection))
                    {
                        deleteBidsCommand.Parameters.AddWithValue("@id", request.LotId);
                        deleteBidsCommand.ExecuteNonQuery();
                    }

                    string deleteLotQuery = "DELETE FROM Lots WHERE Id = @id";
                    using (MySqlCommand deleteLotCommand = new MySqlCommand(deleteLotQuery, connection))
                    {
                        deleteLotCommand.Parameters.AddWithValue("@id", request.LotId);
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
        public IActionResult UnactiveLot( [FromBody] EditStatusLot request)
        {
            try
            {
                if (!CheckUserIsAdmin(ExtractUserIdFromToken(request.Token)))
                {
                    return BadRequest(new { message = "Only administrators can perform this action" });
                }
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();
                    string checkBidsQuery = "SELECT COUNT(*) FROM Bids WHERE LotId = @id";
                    using (MySqlCommand checkBidsCommand = new MySqlCommand(checkBidsQuery, connection)) // заменяем _connString на connection
                    {
                        checkBidsCommand.Parameters.AddWithValue("@id", request.LotId);
                        int bidsCount = Convert.ToInt32(checkBidsCommand.ExecuteScalar());
                        if (bidsCount > 0)
                        {
                            return BadRequest(new { message = "Нельзя удалить лот на котором уже есть ставки" });
                        }
                    }
                }
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "UPDATE Lots SET approved = false, active = false, AllowBids = false, unactive = true, archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot unactive successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UnactiveLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        [HttpPost("ArchiveLot")]
        public IActionResult ArchiveLot( [FromBody] EditStatusLot request)
        {
            try
            {
                if (!CheckUserIsAdmin(ExtractUserIdFromToken(request.Token)))
                {
                    return BadRequest(new { message = "Only administrators can perform this action" });
                }
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();
                    string checkBidsQuery = "SELECT COUNT(*) FROM Bids WHERE LotId = @id";
                    using (MySqlCommand checkBidsCommand = new MySqlCommand(checkBidsQuery, connection)) // заменяем _connString на connection
                    {
                        checkBidsCommand.Parameters.AddWithValue("@id", request.LotId);
                        int bidsCount = Convert.ToInt32(checkBidsCommand.ExecuteScalar());
                        if (bidsCount > 0)
                        {
                            return BadRequest(new { message = "Нельзя удалить лот на котором уже есть ставки" });
                        }
                    }
                }
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "UPDATE Lots SET active = false, unactive = false, archive = true, AllowBids = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot archived successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ArchiveLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
       

        [HttpPost("isWaitingPaymentLot")]
        public IActionResult isWaitingPaymentLot([FromBody] EditStatusLot request)
        {
            try
            {
                if (!CheckUserIsAdmin(ExtractUserIdFromToken(request.Token)))
                {
                    return BadRequest(new { message = "Only administrators can perform this action" });
                }

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "UPDATE Lots SET Active = false, Unactive = false, AllowBids = false, Archive = false, isWaitingDelivery = false, isWaitingPayment = true WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot set as waiting payment successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in isWaitingPaymentLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

    

[HttpPost("reportLot")]
    public async Task<IActionResult> ReportLot([FromBody] ReportLotModel model)
    {
        try
        {
            // Получаем информацию о лоте
            Lot lot;
            UserProfile user;
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                await connection.OpenAsync();

                string lotQuery = "SELECT * FROM Lots WHERE Id = @LotId";
                using (MySqlCommand lotCommand = new MySqlCommand(lotQuery, connection))
                {
                    lotCommand.Parameters.AddWithValue("@LotId", model.LotId);
                    using (MySqlDataReader lotReader = await lotCommand.ExecuteReaderAsync())
                    {
                        if (lotReader.Read())
                        {
                            lot = new Lot(lotReader);
                        }
                        else
                        {
                            return BadRequest(new { message = "Lot not found" });
                        }
                    }
                }

                // Получаем информацию о пользователе, отправившем жалобу
                string userQuery = "SELECT * FROM Users WHERE Token = @Token";
                using (MySqlCommand userCommand = new MySqlCommand(userQuery, connection))
                {
                    userCommand.Parameters.AddWithValue("@Token", model.Token);
                    using (MySqlDataReader userReader = await userCommand.ExecuteReaderAsync())
                    {
                        if (userReader.Read())
                        {
                            user = new UserProfile(userReader);
                        }
                        else
                        {
                            return BadRequest(new { message = "User not found" });
                        }
                    }
                }
            }

            // Формируем сообщение для Telegram
            string lotUrl = $"https://localhost:44424/lot/{lot.Id}";
            string message = $"Reported Lot:\nLot ID: {lot.Id}\nLot Title: {lot.Title}\nReport Text: {model.ReportText}\nUser ID: {user.Id}\nUser Name: {user.FirstName} {user.LastName}\nUser Email: {user.Email}\nLot URL: {lotUrl}";

            // Отправляем уведомление в Telegram
            await NotifyTelegramChat(message);

            return Ok(new { message = "Report sent successfully" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in ReportLot method: {ex}");
            return StatusCode(500, new { message = "Internal Server Error. Please try again later." });
        }
    }


    private async Task NotifyTelegramChat(string message)
        {
            try
            {
                using (HttpClient client = new HttpClient())
                {
                    string apiUrl = $"https://api.telegram.org/bot6693790489:AAHzRPq9DZzY_mfRoyqYZm6_Z0q9nkCHqIk/sendMessage?chat_id={_chatId}&text={message}";
                    await client.GetStringAsync(apiUrl);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending notification to Telegram chat: {ex}");
            }
        }


        [HttpPost("paymentResult")]
        public IActionResult IsWaitingDelivery([FromBody] DeliveryStatusModel request)
        {
            try
            {
                var userId = ExtractUserIdFromToken(request.Token); // Получаем идентификатор пользователя из токена
                int ownerId;
                int winnerId;

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Получаем идентификатор владельца лота и победителя лота из базы данных
                    string ownerQuery = "SELECT UserID FROM Lots WHERE Id = @id";
                    string winnerQuery = "SELECT WinnerUserId FROM Lots WHERE Id = @id";

                    using (MySqlCommand ownerCommand = new MySqlCommand(ownerQuery, connection))
                    {
                        ownerCommand.Parameters.AddWithValue("@id", request.LotId);
                        ownerId = Convert.ToInt32(ownerCommand.ExecuteScalar());
                    }

                    using (MySqlCommand winnerCommand = new MySqlCommand(winnerQuery, connection))
                    {
                        winnerCommand.Parameters.AddWithValue("@id", request.LotId);
                        winnerId = Convert.ToInt32(winnerCommand.ExecuteScalar());
                    }

                    // Проверяем, соответствует ли пользователь владельцу лота
                    if (!userId.ToString().Equals(winnerId.ToString()))
                    {
                        return BadRequest(new { message = "User does not have permission to perform this action" });
                    }

                    // Устанавливаем статус лота
                    string updateQuery = "UPDATE Lots SET Active = false, Unactive = false, AllowBids = false, Archive = true, isWaitingPayment = false, isWaitingDelivery = true WHERE Id = @id";
                    using (MySqlCommand command = new MySqlCommand(updateQuery, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        command.ExecuteNonQuery();
                    }
                }

                // Отправить письмо владельцу лота
                SendEmailToUser(ownerId, "Ваш товар куплен, отправьте его", "Текст вашего сообщения для владельца лота");

                // Формирование сообщения для отправки победителю лота
                string deliveryInfo = $"Город: {request.Delivery.City}\n" +
                                        $"Район: {request.Delivery.Area}\n" +
                                        $"Регион: {request.Delivery.Region}\n" +
                                        $"Индекс: {request.Delivery.Index}\n" +
                                        $"Служба доставки: {request.Delivery.DeliveryService}\n"+
                                        $"Страница лот: https://localhost:44424/lot/{request.LotId}";

                // Отправить письмо победителю лота с информацией о доставке
                SendEmailToUser(winnerId, "Ожидайте получения товара", $"Мы отправили письмо владельцу, товар отправят вам в ближайшее время.\n\nИнформация о доставке:\n{deliveryInfo}");

                return Ok(new { message = "Lot set as waiting delivery successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in IsWaitingDelivery method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }


        private void SendEmailToUser(int userId, string subject, string body)
        {
            // Получение адреса электронной почты пользователя по его идентификатору
            string userEmail = GetUserEmailById(userId);

            // Отправка письма
            SendEmail(userEmail, subject, body);
        }

        private string GetUserEmailById(int userId)
        {
            // Логика для получения адреса электронной почты пользователя по его идентификатору из базы данных
            string userEmail = ""; // Получите адрес электронной почты из базы данных на основе userId

            // Пример реализации:
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                connection.Open();

                string query = "SELECT Email FROM Users WHERE UserId = @userId";
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);
                    userEmail = (string)command.ExecuteScalar();
                }
            }

            return userEmail;
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
        public IActionResult SearchLots([FromBody] SearchLotsRequest request)
        {
            try
            {
                List<Lot> searchResults = new List<Lot>();
                int totalRecords = 0;
                int totalPages = 0;

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    MySqlCommand command = new MySqlCommand();
                    command.Connection = connection;

                    // Создаем основной запрос для выборки лотов
                    string query = "SELECT * FROM Lots WHERE Active = true AND Approved = true";

                    // Добавляем фильтры, если они заданы в запросе
                    if (!string.IsNullOrWhiteSpace(request.SearchString))
                    {
                        query += " AND (Title LIKE @SearchString OR ShortDescription LIKE @SearchString)";
                        command.Parameters.AddWithValue("@SearchString", $"%{request.SearchString}%");
                    }

                    if (!string.IsNullOrWhiteSpace(request.Category))
                    {
                        query += " AND Category = @Category";
                        command.Parameters.AddWithValue("@Category", request.Category);
                    }

                    if (request.MinPrice.HasValue)
                    {
                        query += " AND Price >= @MinPrice";
                        command.Parameters.AddWithValue("@MinPrice", request.MinPrice);
                    }

                    if (request.MaxPrice.HasValue)
                    {
                        query += " AND Price <= @MaxPrice";
                        command.Parameters.AddWithValue("@MaxPrice", request.MaxPrice);
                    }

                    if (!string.IsNullOrWhiteSpace(request.Region))
                    {
                        query += " AND Region = @Region";
                        command.Parameters.AddWithValue("@Region", request.Region);
                    }

                    if (!string.IsNullOrWhiteSpace(request.City))
                    {
                        query += " AND City = @City";
                        command.Parameters.AddWithValue("@City", request.City);
                    }

                    if (request.IsNew.HasValue)
                    {
                        query += " AND IsNew = @IsNew";
                        command.Parameters.AddWithValue("@IsNew", request.IsNew);
                    }

                    if (request.TimeTillEnd.HasValue)
                    {
                        query += " AND TimeTillEnd <= @TimeTillEnd";
                        command.Parameters.AddWithValue("@TimeTillEnd", request.TimeTillEnd);
                    }


                    // Создаем запрос для подсчета общего количества записей с учетом фильтров
                    string countQuery = $"SELECT COUNT(*) FROM ({query}) AS TotalRecords";

                    // Применяем LIMIT и OFFSET для пагинации
                    int offset = (request.Page - 1) * request.PageSize;
                    query += $" ORDER BY {request.OrderBy ?? "Id"} {(request.Ascending ?? true ? "ASC" : "DESC")} LIMIT {request.PageSize} OFFSET {offset}";

                    // Устанавливаем команды и параметры
                    command.CommandText = query;

                    // Выполняем основной запрос
                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            Lot lot = new Lot(reader);
                            searchResults.Add(lot);
                        }
                    }

                    // Получаем общее количество записей с учетом фильтров
                    command.CommandText = countQuery;
                    totalRecords = Convert.ToInt32(command.ExecuteScalar());

                    // Вычисляем количество страниц
                    totalPages = (int)Math.Ceiling((double)totalRecords / request.PageSize);
                }

                return Ok(new { searchResults, totalRecords, totalPages, currentPage = request.Page });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SearchLots method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }





        [HttpPost("getUserLikedLots")]
        public async Task<IActionResult> GetUserLikedLots([FromBody] GetUserLikedLotsRequest model, int page = 1, int pageSize = 10)
        {
            try
            {
                var userId = ExtractUserIdFromToken(model.Token);

                var likedLots = new List<Lot>();
                var totalRecords = 0;
                var totalPages = 0;

                // Query to count total liked lots
                using (var connection = new MySqlConnection(_connString))
                {
                    await connection.OpenAsync();

                    // Query to count total liked lots
                    string countQuery = "SELECT COUNT(*) FROM LikedLots WHERE UserId = @userId";
                    using (var countCommand = new MySqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@userId", userId);
                        totalRecords = Convert.ToInt32(await countCommand.ExecuteScalarAsync());
                    }

                    // Calculate total pages
                    totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

                    // Validate page number
                    if (page < 1)
                        page = 1;
                    else if (page > totalPages && totalPages > 0)
                        page = totalPages;

                    // Calculate starting index for pagination
                    int startIndex = (page - 1) * pageSize;

                    // Query to fetch paginated liked lot IDs
                    string query = "SELECT LotId FROM LikedLots WHERE UserId = @userId LIMIT @startIndex, @pageSize";
                    using (var command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@userId", userId);
                        command.Parameters.AddWithValue("@startIndex", startIndex);
                        command.Parameters.AddWithValue("@pageSize", pageSize);

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            var likedLotIds = new List<int>();
                            while (await reader.ReadAsync())
                            {
                                likedLotIds.Add(reader.GetInt32(0));
                            }

                            // Close the reader before executing the next query
                            await reader.CloseAsync();

                            // Query to fetch full information of liked lots from Lots table
                            if (likedLotIds.Count > 0)
                            {
                                string lotQuery = $"SELECT * FROM Lots WHERE Id IN ({string.Join(",", likedLotIds)})";
                                using (var lotCommand = new MySqlCommand(lotQuery, connection))
                                {
                                    using (var lotReader = await lotCommand.ExecuteReaderAsync())
                                    {
                                        while (await lotReader.ReadAsync())
                                        {
                                            Lot lot = new Lot(lotReader); // Assuming Lot constructor is provided
                                            likedLots.Add(lot);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                return Ok(new { likedLots, totalRecords, totalPages, currentPage = page });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserLikedLots method: {ex}");
                return StatusCode(500, new { message = "Internal Server Error. Please try again later." });
            }
        }


        private bool IsAdmin(string userId)
        {
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                connection.Open();

                string query = "SELECT isAdmin FROM Users WHERE Id = @userId";
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);

                    object result = command.ExecuteScalar();
                    if (result != null && result != DBNull.Value)
                    {
                        return Convert.ToBoolean(result);
                    }
                }
            }

            return false;
        }


        [HttpPost("getLotById/{id}")]
        public IActionResult GetLotById([FromBody] string Token, int id)
        {
            var userId = ExtractUserIdFromToken(Token);
            try
            {
                Lot lot = null;
                User owner = null;
                User maxBidsUser = null;
                decimal maxBidPrice = 0;

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // SQL query to fetch the lot details
                    string query = @"
            SELECT 
                l.*, 
                u1.LastLogin AS OwnersLastLogin, 
                u1.RegistrationTime AS OwnersRegistrationTime, 
                u1.Avatar AS OwnersAvatar, 
                u1.Id AS OwnersUserId,
                u1.FirstName AS OwnersFirstName,
                u1.LastName AS OwnersLastName,
                u1.Login AS OwnersLogin,
                u1.Email AS OwnersEmail,
                u2.LastLogin AS MaxBidsLastLogin, 
                u2.RegistrationTime AS MaxBidsRegistrationTime, 
                u2.Avatar AS MaxBidsAvatar, 
                u2.Id AS MaxBidsUserId,
                u2.FirstName AS MaxBidsFirstName,
                u2.LastName AS MaxBidsLastName,
                u2.Login AS MaxBidsLogin,
                u2.Email AS MaxBidsEmail,
                b.MaxPrice AS MaxBidPrice
            FROM 
                Lots l
            LEFT JOIN Users u1 ON l.UserId = u1.Id
            LEFT JOIN 
                (
                    SELECT 
                        LotId, 
                        MAX(BidAmount) AS MaxPrice 
                    FROM 
                        Bids 
                    GROUP BY 
                        LotId
                ) b ON l.Id = b.LotId
            LEFT JOIN 
                Bids b2 ON l.Id = b2.LotId AND b.MaxPrice = b2.BidAmount
            LEFT JOIN 
                Users u2 ON b2.UserId = u2.Id
            WHERE 
                l.Id = @id";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Check if the lot is archived or inactive
                                bool isArchived = Convert.ToBoolean(reader["Archive"]);
                                bool isInactive = Convert.ToBoolean(reader["Unactive"]);

                                // Check if the user is the owner of the lot
                                if (isArchived || isInactive)
                                {
                                    if (!(userId == reader["UserId"].ToString() || IsAdmin(reader["UserId"].ToString())))
                                    {
                                        return NotFound(new { message = "Lot not found" });
                                    }
                                }

                                // Populate Lot object
                                lot = new Lot(reader);

                                // Populate Owner object
                                owner = new User
                                {
                                    LastLogin = reader["OwnersLastLogin"].ToString(),
                                    RegistrationTime = reader["OwnersRegistrationTime"].ToString(),
                                    Avatar = reader["OwnersAvatar"].ToString(),
                                    Id = reader["OwnersUserId"].ToString(),
                                    FirstName = reader["OwnersFirstName"].ToString(),
                                    LastName = reader["OwnersLastName"].ToString(),
                                    Login = reader["OwnersLogin"].ToString(),
                                    Email = reader["OwnersEmail"].ToString()
                                };

                                // Populate MaxBidsUser object if available
                                if (!reader.IsDBNull(reader.GetOrdinal("MaxBidsLastLogin")))
                                {
                                    maxBidsUser = new User
                                    {
                                        LastLogin = reader["MaxBidsLastLogin"].ToString(),
                                        RegistrationTime = reader["MaxBidsRegistrationTime"].ToString(),
                                        Avatar = reader["MaxBidsAvatar"].ToString(),
                                        Id = reader["MaxBidsUserId"].ToString(),
                                        FirstName = reader["MaxBidsFirstName"].ToString(),
                                        LastName = reader["MaxBidsLastName"].ToString(),
                                        Login = reader["MaxBidsLogin"].ToString(),
                                        Email = reader["MaxBidsEmail"].ToString()
                                    };
                                }

                                // Get the MaxBidPrice
                                if (!reader.IsDBNull(reader.GetOrdinal("MaxBidPrice")))
                                {
                                    maxBidPrice = Convert.ToDecimal(reader["MaxBidPrice"]);
                                }
                            }
                            else
                            {
                                return NotFound(new { message = "Lot not found" });
                            }
                        }
                    }
                }

                // Increment the Views for the lot
                using (MySqlConnection updateConnection = new MySqlConnection(_connString))
                {
                    updateConnection.Open();

                    string updateViewsQuery = @"
            UPDATE Lots 
            SET Views = Views + 1 
            WHERE Id = @id";

                    using (MySqlCommand updateCommand = new MySqlCommand(updateViewsQuery, updateConnection))
                    {
                        updateCommand.Parameters.AddWithValue("@id", id);
                        updateCommand.ExecuteNonQuery();
                    }
                }

                // Return the lot details along with updated Views
                return Ok(new { Lot = lot, Owner = owner, MaxBidsUser = maxBidsUser, MaxBidPrice = maxBidPrice });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting lot by id: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }






        [HttpPost("getUnapprovedLots")]
        public IActionResult GetUnapprovedLots(string token)
        {
            try
            {
                // Извлекаем идентификатор пользователя из токена
                string userId = ExtractUserIdFromToken(token);

                // Проверяем, является ли пользователь администратором
                bool isAdmin = CheckUserIsAdmin(userId);

                // Если пользователь не является администратором, возвращаем ошибку
                if (!isAdmin)
                {
                    return BadRequest(new { message = "Only administrators can perform this action" });
                }

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "SELECT * FROM Lots WHERE Approved = false AND Archive = false";

                    List<Lot> unapprovedLots = new List<Lot>();

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                unapprovedLots.Add(lot);
                            }
                        }
                    }

                    return Ok(unapprovedLots);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting unapproved lots: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }
        
        [HttpGet("getLotsWaitingPayment")]
        public IActionResult GetLotsWaitingPayment([FromBody] string Token)
        {
            try
            {
                // Извлечение userId из токена
                string userId = ExtractUserIdFromToken(Token);

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос к базе данных для получения лотов со статусом "isWaitingPayment" для конкретного пользователя
                    string query = @"
                SELECT 
                    l.* 
                FROM 
                    Lots l
                WHERE 
                    l.Status = 'isWaitingPayment' AND l.UserId = @UserId";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);

                        List<Lot> lots = new List<Lot>();

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                lots.Add(lot);
                            }
                        }

                        return Ok(lots);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting lots waiting payment: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }
        [HttpPost("getLotsWaitingDelivery")] 
        public IActionResult GetLotsWaitingDelivery([FromBody] string token) // Измените имя параметра на token
        {
            try
            {
                // Извлечение userId из токена
                string userId = ExtractUserIdFromToken(token);

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос к базе данных для получения лотов со статусом "isWaitingDelivery" для конкретного пользователя
                    string query = @"
                SELECT 
                    l.* 
                FROM 
                    Lots l
                WHERE 
                    l.Status = 'isWaitingDelivery' AND l.UserId = @UserId";

                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@UserId", userId);

                        List<Lot> lots = new List<Lot>();

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                lots.Add(lot);
                            }
                        }

                        return Ok(lots);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting lots waiting delivery: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }
        [HttpGet("getUserLots")]
        public IActionResult GetUserLots(int userId, [FromQuery] GetUserLotsRequest request)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string searchCondition = !string.IsNullOrEmpty(request.SearchQuery) ? " AND Title LIKE @SearchQuery" : "";
                    string categoryCondition = request.Category.HasValue ? " AND Category = @Category" : "";
                    string priceCondition = "";
                    if (request.MinPrice.HasValue)
                    {
                        priceCondition += " AND Price >= @MinPrice";
                    }
                    if (request.MaxPrice.HasValue)
                    {
                        priceCondition += " AND Price <= @MaxPrice";
                    }
                    string timeCondition = request.TimeTillEnd.HasValue ? " AND TimeTillEnd <= @TimeTillEnd" : "";
                    string regionCondition = !string.IsNullOrEmpty(request.Region) ? " AND Region = @Region" : "";
                    string cityCondition = !string.IsNullOrEmpty(request.City) ? " AND City = @City" : "";

                    // Дополнительный запрос для подсчета общего количества лотов
                    string totalCountQuery = $@"
            SELECT COUNT(*) as TotalCount
            FROM Lots
            WHERE UserId = @UserId {searchCondition} {categoryCondition} {priceCondition} {timeCondition} {regionCondition} {cityCondition}";

                    using (MySqlCommand totalCountCommand = new MySqlCommand(totalCountQuery, connection))
                    {
                        totalCountCommand.Parameters.AddWithValue("@UserId", userId);

                        if (!string.IsNullOrEmpty(request.SearchQuery))
                        {
                            totalCountCommand.Parameters.AddWithValue("@SearchQuery", $"%{request.SearchQuery}%");
                        }
                        if (request.Category.HasValue)
                        {
                            totalCountCommand.Parameters.AddWithValue("@Category", request.Category);
                        }
                        if (request.MinPrice.HasValue)
                        {
                            totalCountCommand.Parameters.AddWithValue("@MinPrice", request.MinPrice);
                        }
                        if (request.MaxPrice.HasValue)
                        {
                            totalCountCommand.Parameters.AddWithValue("@MaxPrice", request.MaxPrice);
                        }
                        if (request.TimeTillEnd.HasValue)
                        {
                            totalCountCommand.Parameters.AddWithValue("@TimeTillEnd", request.TimeTillEnd);
                        }
                        if (!string.IsNullOrEmpty(request.Region))
                        {
                            totalCountCommand.Parameters.AddWithValue("@Region", request.Region);
                        }
                        if (!string.IsNullOrEmpty(request.City))
                        {
                            totalCountCommand.Parameters.AddWithValue("@City", request.City);
                        }

                        int totalLotCount = Convert.ToInt32(totalCountCommand.ExecuteScalar());

                        // Теперь выполните ваш исходный запрос для получения пагинированных лотов пользователя
                        string query = $@"
                SELECT *
                FROM Lots
                WHERE UserId = @UserId AND Approved = true AND Active = true
                {searchCondition}
                {categoryCondition}
                {priceCondition}
                {timeCondition}
                {regionCondition}
                {cityCondition}
                ORDER BY {request.OrderBy ?? "Id"} {(request.Ascending.HasValue && request.Ascending.Value ? "ASC" : "DESC")}
                LIMIT @PageSize
                OFFSET @Offset";

                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@UserId", userId);
                            command.Parameters.AddWithValue("@PageSize", request.PageSize);
                            command.Parameters.AddWithValue("@Offset", (request.PageNumber - 1) * request.PageSize);

                            if (!string.IsNullOrEmpty(request.SearchQuery))
                            {
                                command.Parameters.AddWithValue("@SearchQuery", $"%{request.SearchQuery}%");
                            }
                            if (request.Category.HasValue)
                            {
                                command.Parameters.AddWithValue("@Category", request.Category);
                            }
                            if (request.MinPrice.HasValue)
                            {
                                command.Parameters.AddWithValue("@MinPrice", request.MinPrice);
                            }
                            if (request.MaxPrice.HasValue)
                            {
                                command.Parameters.AddWithValue("@MaxPrice", request.MaxPrice);
                            }
                            if (request.TimeTillEnd.HasValue)
                            {
                                command.Parameters.AddWithValue("@TimeTillEnd", request.TimeTillEnd);
                            }
                            if (!string.IsNullOrEmpty(request.Region))
                            {
                                command.Parameters.AddWithValue("@Region", request.Region);
                            }
                            if (!string.IsNullOrEmpty(request.City))
                            {
                                command.Parameters.AddWithValue("@City", request.City);
                            }

                            List<Lot> userLots = new List<Lot>();

                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    Lot lot = new Lot(reader); // Предполагается, что у вас есть конструктор Lot, принимающий MySqlDataReader
                                    userLots.Add(lot);
                                }
                            }

                            Dictionary<string, int> categoryCount = GetCategoryCount(userId, connection); // Получаем количество лотов по категориям

                            return Ok(new { userLots, categoryCount, totalLotCount });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user lots: {ex}");
                return StatusCode(500, new { message = "Internal Server Error" });
            }
        }

        private Dictionary<string, int> GetCategoryCount(int userId, MySqlConnection connection)
        {
            Dictionary<string, int> categoryCount = new Dictionary<string, int>();

            string categoryCountQuery = @"
    SELECT Category, COUNT(*) as Count
    FROM Lots
    WHERE UserId = @UserId AND Approved = true AND Active = true
    GROUP BY Category";

            using (MySqlCommand categoryCountCommand = new MySqlCommand(categoryCountQuery, connection))
            {
                categoryCountCommand.Parameters.AddWithValue("@UserId", userId);

                using (MySqlDataReader categoryCountReader = categoryCountCommand.ExecuteReader())
                {
                    while (categoryCountReader.Read())
                    {
                        string categoryValue = categoryCountReader.GetString("Category");
                        int count = categoryCountReader.GetInt32("Count");
                        categoryCount.Add(categoryValue, count);
                    }
                }
            }

            return categoryCount;
        }



        [HttpPost("ApproveLot")]
        public IActionResult ApproveLot([FromBody] EditStatusLot request)
        {
            try
            {
                // Проверяем, является ли пользователь администратором
                if (!CheckUserIsAdmin(ExtractUserIdFromToken(request.Token)))
                {
                    return BadRequest(new { message = "Only administrators can perform this action" });
                }

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Обновляем состояние лота в базе данных
                    string query = "UPDATE Lots SET Approved = true, Active = true, AllowBids = true, unactive = false, archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", request.LotId);
                        Console.WriteLine("@id", request.LotId);
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


    }
    public class ReportLotModel
    {
        public int LotId { get; set; }
        public string ReportText { get; set; }
        public string Token { get; set; }
    }

    public class DenyLotRequest
    {
        public string Token { get; set; }
        public int LotId { get; set; }
        public string Explanation { get; set; }
    }
    public class EditStatusLot
    { 
    
        public string Token { get; set; }
        public int LotId { get; set; }  

    }
    public class GetUserLikedLotsRequest
    {
        public string Token { get; set; }
    }
    public class LikesLot { 
    public string Token { get; set; }
    public int LotId { get; set; }
    }
    public class DeleteLot
    {
        public string Token { get; set; }
        public int LotId { get; set; }
    }
    public class UpdateLotRequest
    {
        public string Token { get; set; }
        public int LotId { get; set; }
        public Dictionary<string, string> FieldsToUpdate { get; set; }
        public List<string> ImageURLs { get; set; } = new List<string>();
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
    public class User
    {
        public string LastLogin { get; set; }
        public string RegistrationTime { get; set; }
        public string Avatar { get; set; }
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Login { get; set; }
        public string Email { get; set; }
    }
    public class GetLotsByUserRequest
    {
        public string Token { get; set; }
        public string? SearchQuery { get; set; }
        public int? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public DateTime? TimeTillEnd { get; set; }
        public bool Active { get; set; } = false;
        public bool Archive { get; set; } = false;
        public bool Unactive { get; set; } = false;
        public bool IsWaitingPayment { get; set; } = false;
        public bool IsWaitingDelivery { get; set; } = false;
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? OrderBy { get; set; }
        public bool? Ascending { get; set; }
        public string? Region { get; set; }
        public string? City { get; set; }
    }
    public class GetUserLotsRequest
    {
        public string? SearchQuery { get; set; }
        public int? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public DateTime? TimeTillEnd { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? OrderBy { get; set; }
        public bool? Ascending { get; set; }
        public string? Region { get; set; }
        public string? City { get; set; }
    }
    public class SearchLotsRequest
    {
        public string? SearchString { get; set; }
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Region { get; set; }
        public string? City { get; set; }
        public bool? IsNew { get; set; }
        public DateTime? TimeTillEnd { get; set; }
        public string? OrderBy { get; set; } // Добавлено
        public bool? Ascending { get; set; } // Добавлено
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
    public class Bidder : User
    {
        public decimal MaxBidPrice { get; set; }
    }
    public class DeliveryStatusModel
    {
        public int LotId { get; set; }
        public string Payment { get; set; }
        public string Token { get; set; }
        public DeliveryInfo Delivery { get; set; }
    }

    public class DeliveryInfo
    {
        public string City { get; set; }
        public string Area { get; set; }
        public string Region { get; set; }
        public string Index { get; set; }
        public string DeliveryService { get; set; }
    }

}
