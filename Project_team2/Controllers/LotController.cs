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

namespace Project2.Controllers
{
    [Route("api/lots")]
    [ApiController]
    public class LotsController : ControllerBase
    {
        private readonly string _connString;
        public LotsController(){
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
        public IActionResult CreateLot([FromBody] LotModel model, string region, string city)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "INSERT INTO Lots (title, price, shortDescription, category, timeTillEnd, imageURLs, UserId, region, city) " +
                                   "VALUES (@title, @price, @shortDescription, @category, @timeTillEnd, @imageURLs, @userId, @region, @city)";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@title", model.Title);
                        command.Parameters.AddWithValue("@price", model.Price);
                        command.Parameters.AddWithValue("@shortDescription", model.ShortDescription);
                        command.Parameters.AddWithValue("@category", model.Category);
                        command.Parameters.AddWithValue("@timeTillEnd", model.TimeTillEnd);
                        command.Parameters.AddWithValue("@imageURLs", string.Join(",", model.ImageURLs));
                        command.Parameters.AddWithValue("@userId", model.UserId);
                        command.Parameters.AddWithValue("@region", region);
                        command.Parameters.AddWithValue("@city", city);

                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot created successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
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
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Вычисляем общее количество активных лотов
                    string countQuery = "SELECT COUNT(*) FROM Lots WHERE Active = true";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        int totalCount = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Вычисляем смещение для пагинации
                        int offset = (page - 1) * pageSize;

                        // Получаем указанное количество активных лотов из базы данных с учетом пагинации
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
                                    LotModel lot = new LotModel
                                    {
                                        Id = reader.GetInt32("id"),
                                        Title = reader.GetString("title"),
                                        Price = reader.GetDecimal("price"),
                                        CurrentBid = Convert.ToDecimal(reader["CurrentBid"]),
                                        ShortDescription = reader.GetString("shortDescription"),
                                        Category = reader.GetString("category"),
                                        TimeTillEnd = reader.GetDateTime("timeTillEnd").ToString(),
                                        // Прочитайте остальные поля из базы данных и добавьте их в модель лота
                                        ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                        UserId = reader["UserId"].ToString()
                                    };
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
                                        Category = reader["Category"].ToString(),
                                        TimeTillEnd = reader["TimeTillEnd"].ToString(),
                                        // Парсим строку ImageURLs в массив строк
                                        ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                        UserId = reader["UserId"].ToString()
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
        public IActionResult GetLotsByUser(string userId, bool active = false, bool archive = false, bool unactive = false, int pageNumber = 1, int pageSize = 10)
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

                    // Запрос на получение общего количества лотов, созданных выбранным пользователем
                    string countQuery = $"SELECT COUNT(*) FROM Lots WHERE UserId = @userId {condition}";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@userId", userId);
                        int totalCount = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Строим запрос на выборку лотов, созданных пользователем, с учетом пагинации и фильтрации
                        string query = $"SELECT * FROM Lots WHERE UserId = @userId {condition} " +
                                       "ORDER BY Id DESC LIMIT @pageSize OFFSET @offset";

                        // Вычисляем смещение (offset) на основе номера страницы и размера страницы
                        int offset = (pageNumber - 1) * pageSize;

                        // Выполняем запрос на выборку
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@userId", userId);
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
                                        Category = reader["Category"].ToString(),
                                        TimeTillEnd = reader["TimeTillEnd"].ToString(),
                                        // Парсим строку ImageURLs в массив строк
                                        ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                        UserId = reader["UserId"].ToString()
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

                    // Удаляем лот из базы данных
                    string query = "DELETE FROM Lots WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);
                        command.ExecuteNonQuery();
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

        [HttpPost("approveLot")]
        public IActionResult ApproveLot(int id)
        {
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Утверждаем лот в базе данных
                    string query = "UPDATE Lots SET approved = true, Unactive = false, Archive = false WHERE id = @id";
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
        [HttpPost("likeLot")]
        public IActionResult LikeLot(string Token, int lotId)
        {
            var UserId = ExtractUserIdFromToken(Token);
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "INSERT INTO LikedLots (UserId, LotId) VALUES (@userId, @lotId)";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@userId", UserId);
                        command.Parameters.AddWithValue("@lotId", lotId);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot liked successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in LikeLot method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

        [HttpPost("unlikeLot")]
        public IActionResult UnlikeLot(string Token, int lotId)
        {
            var UserId = ExtractUserIdFromToken(Token);
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "DELETE FROM LikedLots WHERE UserId = @userId AND LotId = @lotId";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@userId", UserId);
                        command.Parameters.AddWithValue("@lotId", lotId);
                        command.ExecuteNonQuery();
                    }

                    return Ok(new { message = "Lot unliked successfully" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UnlikeLot method: {ex.ToString()}");
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

                    // Запрос к базе данных для получения лота по его идентификатору
                    string query = "SELECT * FROM Lots WHERE id = @id";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@id", id);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                // Создание объекта лота на основе данных из базы данных
                                LotModel lot = new LotModel
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    Title = reader["Title"].ToString(),
                                    Price = Convert.ToDecimal(reader["Price"]),
                                    CurrentBid = Convert.ToDecimal(reader["CurrentBid"]),
                                    ShortDescription = reader["ShortDescription"].ToString(),
                                    Category = reader["Category"].ToString(),
                                    TimeTillEnd = reader["TimeTillEnd"].ToString(),
                                    ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                    UserId = reader["UserId"].ToString()
                                };

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

        [HttpPost("SearchLots")]
        public IActionResult SearchLots(string searchString, string category, decimal? minPrice, decimal? maxPrice, string region, string city, string sortBy, int page = 1, int pageSize = 10)
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

                    // Объединяем все условия с помощью оператора AND
                    query += string.Join(" AND ", conditions);

                    // Получаем общее количество найденных лотов
                    string countQuery = $"SELECT COUNT(*) FROM ({query}) AS TotalRecords";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        // Добавляем параметры запроса
                        AddQueryParameters(countCommand, searchString, category, minPrice, maxPrice, region, city);

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
                        AddQueryParameters(command, searchString, category, minPrice, maxPrice, region, city);

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

        private void AddQueryParameters(MySqlCommand command, string searchString, string category, decimal? minPrice, decimal? maxPrice, string region, string city)
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
        }

        [HttpPost("getUserLikedLots")]
        public IActionResult GetUserLikedLots(string Token, int page = 1, int pageSize = 10)
        {
            var UserId = ExtractUserIdFromToken(Token);
            try
            {
                List<LotModel> likedLots = new List<LotModel>();

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
                                    LotModel lot = new LotModel
                                    {
                                        Id = Convert.ToInt32(reader["Id"]),
                                        Title = reader["Title"].ToString(),
                                        Price = Convert.ToDecimal(reader["Price"]),
                                        CurrentBid = Convert.ToDecimal(reader["CurrentBid"]),
                                        ShortDescription = reader["ShortDescription"].ToString(),
                                        Category = reader["Category"].ToString(),
                                        TimeTillEnd = reader["TimeTillEnd"].ToString(),
                                        ImageURLs = reader["ImageURLs"].ToString().Split(','),
                                        UserId = reader["UserId"].ToString()
                                    };
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
        public string Category { get; set; }
        public string TimeTillEnd { get; set; }
        public string[] ImageURLs { get; set; }
        public string UserId { get; set; }
        public string Region { get; set; } // Новое свойство для региона
        public string City { get; set; }   // Новое свойство для города
    }

}
