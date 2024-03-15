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
        public LotsController() {
            _connString = Config.MySqlConnection;
            _smtpServer = Config.SmtpServer;
            _smtpPort = Config.SmtpPort;
            _smtpUsername = Config.SmtpUsername;
            _smtpPassword = Config.SmtpPassword;
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

        [HttpGet("getLotsByUser")]
        public IActionResult GetLotsByUser(string Token, string? searchQuery = null, int? category = null, decimal? minPrice = null, decimal? maxPrice = null, DateTime? timeTillEnd = null, bool active = false, bool archive = false, bool unactive = false, bool isWaitingPayment = false, bool isWaitingDelivery = false, int pageNumber = 1, int pageSize = 10)
        {
            int userId = (int)Convert.ToInt64(ExtractUserIdFromToken(Token));
            try
            {
                // Открываем соединение с базой данных
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Формируем условие для фильтрации по состоянию лотов
                    string condition = "";
                    string isApproved = "";
                    string lotState = "";
                    if (active)
                    {
                        condition += " AND Active = true";
                        lotState = "Active";
                        isApproved = "true";
                    }
                    if (archive)
                    {
                        condition += " AND Archive = true";
                        lotState += "Archive";
                        isApproved = "false";
                    }
                    if (unactive)
                    {
                        condition += " AND Unactive = true";
                        lotState += "Unactive";
                        isApproved = "false";
                    }
                    if (isWaitingPayment)
                    {
                        condition += " AND isWaitingPayment = true";
                    }
                    if (isWaitingDelivery)
                    {
                        condition += " AND isWaitingDelivery = true";
                    }

                    // Формируем условие для поиска по названию
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

                    // Формируем условие для выборки по цене
                    string priceCondition = "";
                    if (minPrice != null)
                    {
                        priceCondition += " AND Price >= @minPrice";
                    }
                    if (maxPrice != null)
                    {
                        priceCondition += " AND Price <= @maxPrice";
                    }

                    // Формируем условие для выборки по времени окончания торгов
                    string timeCondition = "";
                    if (timeTillEnd != null)
                    {
                        timeCondition += " AND TimeTillEnd <= @timeTillEnd";
                    }

                    // Запрос на получение общего количества лотов, созданных выбранным пользователем
                    string countQuery = $"SELECT COUNT(*) FROM Lots WHERE UserId = @userId{condition}{searchCondition}{categoryCondition}{priceCondition}{timeCondition}";
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
                        if (minPrice != null)
                        {
                            countCommand.Parameters.AddWithValue("@minPrice", minPrice);
                        }
                        if (maxPrice != null)
                        {
                            countCommand.Parameters.AddWithValue("@maxPrice", maxPrice);
                        }
                        if (timeTillEnd != null)
                        {
                            countCommand.Parameters.AddWithValue("@timeTillEnd", timeTillEnd);
                        }
                        int totalCount = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Строим запрос на выборку лотов, созданных пользователем, с учетом пагинации и фильтрации
                        string query = $"SELECT * FROM Lots WHERE UserId = @userId{condition}{searchCondition}{categoryCondition}{priceCondition}{timeCondition} ORDER BY Id DESC LIMIT @pageSize OFFSET @offset";

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
                            if (minPrice != null)
                            {
                                command.Parameters.AddWithValue("@minPrice", minPrice);
                            }
                            if (maxPrice != null)
                            {
                                command.Parameters.AddWithValue("@maxPrice", maxPrice);
                            }
                            if (timeTillEnd != null)
                            {
                                command.Parameters.AddWithValue("@timeTillEnd", timeTillEnd);
                            }
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

                            // Дополнительный запрос для подсчета количества лотов по каждой категории
                            string categoryCountQuery = $"SELECT Category, COUNT(*) as Count FROM Lots WHERE UserId = @userId AND {lotState} = true AND Approved = {isApproved} GROUP BY Category";
                            Dictionary<string, int> categoryCount = new Dictionary<string, int>(); // Изменено на string для ключа
                            using (MySqlCommand categoryCountCommand = new MySqlCommand(categoryCountQuery, connection))
                            {
                                categoryCountCommand.Parameters.AddWithValue("@userId", userId);
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



                            // Возвращаем список лотов, общее количество, номер страницы и количество лотов по каждой категории
                            return Ok(new { lots, totalCount, pageNumber, categoryCount });
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
                request.FieldsToUpdate.Add("Approved", "false");
                request.FieldsToUpdate.Add("Active", "false");
                request.FieldsToUpdate.Add("Unactive", "true");

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
        public IActionResult UnactiveLot(int id, [FromBody] EditStatusLot request)
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

                    string query = "UPDATE Lots SET active = false, AllowBids = false, unactive = true, archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
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
        public IActionResult ArchiveLot(int id, [FromBody] EditStatusLot request)
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

                    string query = "UPDATE Lots SET active = false, unactive = false, archive = true, AllowBids = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
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
        
        [HttpPost("SetAllowBids")]
        public IActionResult SetAllowBids(int id, [FromBody] EditStatusLot request)
        {
            try
            {
                string userId = ExtractUserIdFromToken(request.Token);

                // Проверяем, является ли пользователь администратором
                bool isAdmin = CheckUserIsAdmin(userId);

                // Проверяем, является ли пользователь владельцем лота
                bool isOwner = CheckUserIsOwnerOfLot(userId, id);

                // Если пользователь не является администратором и не владельцем лота, возвращаем ошибку
                if (!isAdmin && !isOwner)
                {
                    return BadRequest(new { message = "Only administrators or lot owners can perform this action" });
                }

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Проверяем, имеет ли лот статус approved = true
                    string checkApprovedQuery = "SELECT Approved FROM Lots WHERE id = @id";
                    bool isApproved;
                    using (MySqlCommand checkApprovedCommand = new MySqlCommand(checkApprovedQuery, connection))
                    {
                        checkApprovedCommand.Parameters.AddWithValue("@id", id);
                        isApproved = Convert.ToBoolean(checkApprovedCommand.ExecuteScalar());
                    }

                    // Если лот не имеет статус approved = true, возвращаем ошибку
                    if (!isApproved)
                    {
                        return BadRequest(new { message = "Lot is not approved" });
                    }

                    // Обновляем статус AllowBids = true
                    string query = "UPDATE Lots SET AllowBids = true WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "AllowBids set successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in SetAllowBids method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        [HttpPost("isWaitingPaymentLot")]
        public IActionResult isWaitingPaymentLot(int id, [FromBody] EditStatusLot request)
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
                        command.Parameters.AddWithValue("@id", id);
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
        public IActionResult SearchLots(string? searchString, string? category, decimal? minPrice, decimal? maxPrice, string? region, string? city, bool? isNew, string? sortBy, int page = 1, int pageSize = 10)
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
                    string query = "SELECT * FROM Lots WHERE Active = true AND Approved = true";

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

                    // Добавляем оператор WHERE и объединяем все условия с помощью оператора AND
                    if (conditions.Count > 0)
                    {
                        query += " AND " + string.Join(" AND ", conditions);
                    }


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
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

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
                                Lot lot = new Lot(reader);

                                User owner = new User
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

                                User maxBidsUser = null;
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

                                decimal maxBidPrice = 0;
                                if (!reader.IsDBNull(reader.GetOrdinal("MaxBidPrice")))
                                {
                                    maxBidPrice = Convert.ToDecimal(reader["MaxBidPrice"]);
                                }

                                return Ok(new { Lot = lot, Owner = owner, MaxBidsUser = maxBidsUser, MaxBidPrice = maxBidPrice });
                            }
                            else
                            {
                                return NotFound(new { message = "Lot not found" });
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting lot by id: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
            }
        }

        [HttpGet("getUserLots")]
        public IActionResult GetUserLots(int userId, string? searchQuery = null, int? category = null, decimal? minPrice = null, decimal? maxPrice = null, DateTime? timeTillEnd = null, bool active = false, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Формируем условие для поиска по названию
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

                    // Формируем условие для выборки по цене
                    string priceCondition = "";
                    if (minPrice != null)
                    {
                        priceCondition += " AND Price >= @minPrice";
                    }
                    if (maxPrice != null)
                    {
                        priceCondition += " AND Price <= @maxPrice";
                    }

                    // Формируем условие для выборки по времени окончания торгов
                    string timeCondition = "";
                    if (timeTillEnd != null)
                    {
                        timeCondition += " AND TimeTillEnd <= @timeTillEnd";
                    }

                    // Запрос для получения всех активных лотов пользователя, у которых установлены флаги Approve и Active в true
                    string query = $@"
                SELECT *
                FROM Lots
                WHERE UserId = @userId AND Approved = true AND Active = true
                {searchCondition}
                {categoryCondition}
                {priceCondition}
                {timeCondition}
                ORDER BY Id DESC
                LIMIT @pageSize
                OFFSET @offset";

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
                        if (minPrice != null)
                        {
                            command.Parameters.AddWithValue("@minPrice", minPrice);
                        }
                        if (maxPrice != null)
                        {
                            command.Parameters.AddWithValue("@maxPrice", maxPrice);
                        }
                        if (timeTillEnd != null)
                        {
                            command.Parameters.AddWithValue("@timeTillEnd", timeTillEnd);
                        }
                        command.Parameters.AddWithValue("@pageSize", pageSize);
                        command.Parameters.AddWithValue("@offset", (pageNumber - 1) * pageSize);

                        List<Lot> userLots = new List<Lot>();

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Lot lot = new Lot(reader);
                                userLots.Add(lot);
                            }
                        }

                        // Дополнительный запрос для подсчета количества лотов по каждой категории
                        string categoryCountQuery = $@"
                    SELECT Category, COUNT(*) as Count
                    FROM Lots
                    WHERE UserId = @userId AND Approved = true AND Active = true
                    GROUP BY Category";

                        Dictionary<string, int> categoryCount = new Dictionary<string, int>();

                        using (MySqlCommand categoryCountCommand = new MySqlCommand(categoryCountQuery, connection))
                        {
                            categoryCountCommand.Parameters.AddWithValue("@userId", userId);

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

                        return Ok(new { userLots, categoryCount });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user lots: {ex}");
                return StatusCode(500, new { message = "Internal Server Error" });
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

                    string query = "SELECT * FROM Lots WHERE Approved = false";

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
        [HttpPost("getLotsWaitingDelivery")] // Используйте HttpPost вместо HttpGet
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
        [HttpPost("ApproveLot")]
        public IActionResult ApproveLot(int id, [FromBody] EditStatusLot request)
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
                    string query = "UPDATE Lots SET Approved = true, active = true, AllowBids = true, unactive = false, archive = false, isWaitingDelivery = false, isWaitingPayment = false WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        Console.WriteLine("@id", id);
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
    public class getUserLikedLots { 
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

    public class Bidder : User
    {
        public decimal MaxBidPrice { get; set; }
    }
}
