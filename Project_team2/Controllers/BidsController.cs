using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Newtonsoft.Json.Linq;
using Project_team2;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Net;
using System.Xml.Linq;
using System.Reflection;
using Org.BouncyCastle.Asn1.Ocsp;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using System.Security.Cryptography;
using System.Text;
using Project_team2.Controllers;
using System.Configuration;
using Newtonsoft.Json;
using System.Net.WebSockets;

namespace Project2.Controllers
{
    [Route("api/bids")]
    [ApiController]
    public class BidsController : ControllerBase
    {
        private readonly string _connString;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _telegramBotToken;
        private readonly long _chatId;
        private readonly WebSocketServer _webSocketServer;
        private readonly IConfiguration _configuration;

        // Удаляем поле _webSocketController, так как оно не используется в контроллере
        private readonly Dictionary<int, List<WebSocket>> _lotConnections;

        // Изменяем конструктор для удаления неиспользуемых параметров
        public BidsController(WebSocketServer webSocketServer, IConfiguration configuration, Dictionary<int, List<WebSocket>> lotConnections)
        {
            _connString = Config.MySqlConnection;
            _smtpServer = Config.SmtpServer;
            _smtpPort = Config.SmtpPort;
            _smtpUsername = Config.SmtpUsername;
            _smtpPassword = Config.SmtpPassword;
            _telegramBotToken = Config.TelegramBotToken;
            _chatId = Config.ChatId;
            _webSocketServer = webSocketServer;
            _configuration = configuration;
            _lotConnections = lotConnections;
        }

        // Добавляем пространство имен IConfiguration
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
        [HttpPost("placeBid")]
        public async Task<IActionResult> PlaceBid([FromBody] BidModel model, [FromServices] WebSocketController webSocketController)
        {
            var userId = ExtractUserIdFromToken(model.Token);

            try
            {
                // Получаем информацию о лоте
                decimal minPrice;
                decimal minStepPrice;
                bool allowBids;
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    using (MySqlCommand getLotInfoCommand = connection.CreateCommand())
                    {
                        getLotInfoCommand.CommandText = "SELECT MinPrice, MinStepPrice, AllowBids FROM Lots WHERE Id = @LotId";
                        getLotInfoCommand.Parameters.AddWithValue("@LotId", model.LotId);

                        using (MySqlDataReader reader = getLotInfoCommand.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                minPrice = Convert.ToDecimal(reader["MinPrice"]);
                                minStepPrice = Convert.ToDecimal(reader["MinStepPrice"]);
                                allowBids = Convert.ToBoolean(reader["AllowBids"]);
                            }
                            else
                            {
                                return BadRequest(new { message = "Лот не найден" });
                            }
                        }
                    }
                }

                // Проверяем, разрешены ли ставки для данного лота
                if (!allowBids)
                {
                    return BadRequest(new { message = "Ставки запрещены для этого лота" });
                }

                // Получаем текущую максимальную ставку для лота
                decimal currentMaxBid = 0;
                int userIdWhoseBidWasOutbid = 0;
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    using (MySqlCommand getCurrentMaxBidCommand = connection.CreateCommand())
                    {
                        getCurrentMaxBidCommand.CommandText = "SELECT MAX(BidAmount), UserId FROM Bids WHERE LotId = @LotId GROUP BY UserId ORDER BY MAX(BidAmount) DESC LIMIT 1";
                        getCurrentMaxBidCommand.Parameters.AddWithValue("@LotId", model.LotId);

                        using (MySqlDataReader reader = getCurrentMaxBidCommand.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                currentMaxBid = Convert.ToDecimal(reader["MAX(BidAmount)"]);
                                userIdWhoseBidWasOutbid = reader.GetInt32("UserId");
                            }
                        }
                    }
                }

                // Проверяем, является ли сумма ставки допустимой
                if (model.BidAmount < minPrice || (currentMaxBid > 0 && model.BidAmount <= currentMaxBid))
                {
                    return BadRequest(new { message = "Сумма ставки должна быть больше минимальной цены и выше текущей максимальной ставки" });
                }

                // Проверяем, является ли сумма ставки хотя бы на MinStepPrice выше текущей максимальной ставки
                if (model.BidAmount < currentMaxBid + minStepPrice)
                {
                    return BadRequest(new { message = "Сумма ставки должна быть хотя бы на минимальную цену шага выше текущей максимальной ставки" });
                }

                // Добавляем ставку в таблицу Bids
                AddBidToDatabase(model.LotId, userId, model.BidAmount);
                string lotTitle = "";
                string lotDescription = "";
                string imageUrl = "";
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string getLotDetailsQuery = "SELECT Title, ShortDescription, ImageUrls FROM Lots WHERE Id = @LotId";
                    using (MySqlCommand getLotDetailsCommand = new MySqlCommand(getLotDetailsQuery, connection))
                    {
                        getLotDetailsCommand.Parameters.AddWithValue("@LotId", model.LotId);

                        using (MySqlDataReader lotDetailsReader = getLotDetailsCommand.ExecuteReader())
                        {
                            if (lotDetailsReader.Read())
                            {
                                lotTitle = lotDetailsReader.GetString("Title");
                                lotDescription = lotDetailsReader.GetString("ShortDescription");

                                // Получаем первый URL изображения из списка, разделенного запятыми
                                string imageUrlString = lotDetailsReader.GetString("ImageUrls");
                                string[] imageUrlArray = imageUrlString.Split(',');
                                if (imageUrlArray.Length > 0)
                                {
                                    imageUrl = imageUrlArray[0];
                                }
                            }
                        }
                    }
                }

                // Отправляем электронное уведомление, если необходимо
                if (userIdWhoseBidWasOutbid != 0)
                {
                    string userEmail = GetUserEmail(userIdWhoseBidWasOutbid);
                    if (!string.IsNullOrEmpty(userEmail))
                    {
                        // Читаем содержимое HTML-шаблона
                        string htmlTemplate = await System.IO.File.ReadAllTextAsync("Pages/Sending.html");

                        // Заменяем заполнители данными из базы данных
                        htmlTemplate = htmlTemplate.Replace("{{Zagolovok}}", "Ваша ставка была перебита");
                        htmlTemplate = htmlTemplate.Replace("{{lotId}}", model.LotId.ToString());
                        htmlTemplate = htmlTemplate.Replace("{{newBidAmount}}", model.BidAmount.ToString());
                        htmlTemplate = htmlTemplate.Replace("{{title}}", lotTitle);
                        htmlTemplate = htmlTemplate.Replace("{{Description}}", lotDescription);
                        htmlTemplate = htmlTemplate.Replace("{{URL_Lots}}", $"https://localhost:44424/lot/{model.LotId}");
                        htmlTemplate = htmlTemplate.Replace("{{image_url}}", imageUrl);
                        await SendEmailAsync(userEmail, "Ваша ставка была перебита", htmlTemplate);
                    }
                }
                UserProfile userProfile = await GetUserProfileAsync(userId);
                // Создание данных JSON для отправки
                var bidUpdateData = new
                {
                    UserId = userProfile.Id,
                    FirstName = userProfile.FirstName,
                    LastName = userProfile.LastName,
                    MaxBidAmount = model.BidAmount
                    // Добавьте другие необходимые данные из профиля пользователя
                };
                // Преобразование объекта в строку JSON
                string jsonData = JsonConvert.SerializeObject(bidUpdateData);

                // Вызов метода SendBidUpdate с передачей данных JSON
                await webSocketController.SendBidUpdate(model.LotId, jsonData);

                return Ok(new { message = "Ставка успешно размещена" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка в методе PlaceBid: {ex.ToString()}");
                return StatusCode(500, new { message = $"Внутренняя ошибка сервера. Исключение: {ex.Message}" });
            }
        }

        public async Task SendBidUpdate(int lotId)
        {
            if (_lotConnections.ContainsKey(lotId))
            {
                foreach (var webSocket in _lotConnections[lotId])
                {
                    // Получаем данные о самой большой BidAmount для указанного лота
                    string query = @"
            SELECT UserId, MAX(BidAmount) AS MaxBidAmount
            FROM Bids
            WHERE LotId = @lotId
            GROUP BY UserId";

                    using (MySqlConnection connection = new MySqlConnection(_connString))
                    {
                        await connection.OpenAsync();
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@lotId", lotId);
                            using (MySqlDataReader reader = await command.ExecuteReaderAsync())
                            {
                                while (reader.Read())
                                {
                                    // Получаем профиль пользователя по UserId
                                    string userId = reader["UserId"].ToString();
                                    decimal maxBidAmount = Convert.ToDecimal(reader["MaxBidAmount"]);

                                    UserProfile userProfile = await GetUserProfileAsync(userId);

                                    // Создаем объект, содержащий данные о самой большой BidAmount и профиле пользователя
                                    var bidUpdateData = new
                                    {
                                        UserId = userProfile.Id,
                                        FirstName = userProfile.FirstName,
                                        LastName = userProfile.LastName,
                                        MaxBidAmount = maxBidAmount
                                        // Добавьте другие необходимые данные из профиля пользователя
                                    };

                                    // Преобразуем объект в строку JSON
                                    string jsonData = JsonConvert.SerializeObject(bidUpdateData);

                                    // Отправляем обновление клиенту через WebSocket
                                    await SendDataToClientAsync(webSocket, jsonData);
                                }
                            }
                        }
                    }
                }
            }
        }

        public async Task SendDataToClientAsync(WebSocket webSocket, string jsonData)
        {
            if (webSocket != null && webSocket.State == WebSocketState.Open)
            {
                // Преобразуйте строку JSON в массив байт
                byte[] data = Encoding.UTF8.GetBytes(jsonData);

                // Отправьте данные клиенту через WebSocket
                await webSocket.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, CancellationToken.None);
            }
            else
            {
                // Обработка случая, когда соединение с клиентом закрыто или недоступно
                // Например, удаление отключенного клиента из списка подключенных 
                // или другие действия, соответствующие вашим требованиям
            }
        }
        private async Task<UserProfile> GetUserProfileAsync(string userId)
        {
            // Запрос для получения профиля пользователя по его идентификатору
            string query = @"
        SELECT * FROM Users WHERE Id = @userId";

            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                await connection.OpenAsync();
                using (MySqlCommand command = new MySqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@userId", userId);
                    using (MySqlDataReader reader = await command.ExecuteReaderAsync())
                    {
                        if (reader.Read())
                        {
                            // Создаем объект UserProfile из данных в reader и возвращаем его
                            return new UserProfile(reader);
                        }
                    }
                }
            }

            // Если пользователь не найден, возвращаем null
            return null;
        }
        private string GetUserEmail(int userId)
        {
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                connection.Open();

                using (MySqlCommand getUserEmailCommand = connection.CreateCommand())
                {
                    getUserEmailCommand.CommandText = "SELECT Email FROM Users WHERE Id = @UserId";
                    getUserEmailCommand.Parameters.AddWithValue("@UserId", userId);

                    object userEmailObj = getUserEmailCommand.ExecuteScalar();
                    return userEmailObj != null ? userEmailObj.ToString() : null;
                }
            }
        }

        private void AddBidToDatabase(int lotId, string userId, decimal bidAmount)
        {
            using (MySqlConnection connection = new MySqlConnection(_connString))
            {
                connection.Open();

                using (MySqlCommand insertBidCommand = connection.CreateCommand())
                {
                    insertBidCommand.CommandText = "INSERT INTO Bids (LotId, UserId, BidAmount, BidTime) VALUES (@LotId, @UserId, @BidAmount, NOW())";
                    insertBidCommand.Parameters.AddWithValue("@LotId", lotId);
                    insertBidCommand.Parameters.AddWithValue("@UserId", userId);
                    insertBidCommand.Parameters.AddWithValue("@BidAmount", bidAmount);
                    insertBidCommand.ExecuteNonQuery();
                }
            }
        }



        [HttpPost("getUserBids")]
        public IActionResult GetUserBids([FromBody] UserBidsRequestModel model)
        {
            var userId = ExtractUserIdFromToken(model.Token);
            int page = model.Page;
            int pageSize = model.PageSize;

            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    StringBuilder baseQueryBuilder = new StringBuilder();
                    baseQueryBuilder.Append(@"FROM Lots l
            INNER JOIN (
                SELECT LotId, MAX(BidAmount) AS MaxBidAmount FROM Bids GROUP BY LotId
            ) max_bids ON l.Id = max_bids.LotId
            INNER JOIN Bids b ON max_bids.LotId = b.LotId AND max_bids.MaxBidAmount = b.BidAmount
            INNER JOIN Users u ON b.UserId = u.Id WHERE 1=1");

                    MySqlCommand countCommand = new MySqlCommand
                    {
                        Connection = connection,
                        CommandText = $"SELECT COUNT(DISTINCT l.Id) {baseQueryBuilder.ToString()}"
                    };

                    MySqlCommand dataCommand = new MySqlCommand
                    {
                        Connection = connection
                    };

                    if (model.MaxPrice.HasValue)
                    {
                        baseQueryBuilder.Append(" AND l.price <= @MaxPrice");

                        countCommand.Parameters.AddWithValue("@MaxPrice", model.MaxPrice);
                        dataCommand.Parameters.AddWithValue("@MaxPrice", model.MaxPrice);

                    }

                    if (!string.IsNullOrWhiteSpace(model.SearchQuery))
                    {
                        baseQueryBuilder.Append(" AND (l.Title LIKE @SearchQuery OR l.ShortDescription LIKE @SearchQuery)");
                        countCommand.Parameters.AddWithValue("@SearchQuery", $"%{model.SearchQuery}%");
                        dataCommand.Parameters.AddWithValue("@SearchQuery", $"%{model.SearchQuery}%");
                    }

                    if (!string.IsNullOrWhiteSpace(model.Category))
                    {
                        baseQueryBuilder.Append(" AND l.Category = @Category");
                        countCommand.Parameters.AddWithValue("@Category", model.Category);
                        dataCommand.Parameters.AddWithValue("@Category", model.Category);
                    }

                    if (model.MinPrice.HasValue)
                    {
                        baseQueryBuilder.Append(" AND l.Price >= @MinPrice");
                        countCommand.Parameters.AddWithValue("@MinPrice", model.MinPrice);
                        dataCommand.Parameters.AddWithValue("@MinPrice", model.MinPrice);
                    }

                    if (!string.IsNullOrWhiteSpace(model.Region))
                    {
                        baseQueryBuilder.Append(" AND l.Region = @Region");
                        countCommand.Parameters.AddWithValue("@Region", model.Region);
                        dataCommand.Parameters.AddWithValue("@Region", model.Region);
                    }

                    if (!string.IsNullOrWhiteSpace(model.City))
                    {
                        baseQueryBuilder.Append(" AND l.City = @City");
                        countCommand.Parameters.AddWithValue("@City", model.City);
                        dataCommand.Parameters.AddWithValue("@City", model.City);
                    }

                    if (model.IsNew.HasValue)
                    {
                        baseQueryBuilder.Append(" AND l.IsNew = @IsNew");
                        countCommand.Parameters.AddWithValue("@IsNew", model.IsNew);
                        dataCommand.Parameters.AddWithValue("@IsNew", model.IsNew);
                    }

                    if (model.TimeTillEnd.HasValue)
                    {
                        baseQueryBuilder.Append(" AND l.TimeTillEnd <= @TimeTillEnd");
                        countCommand.Parameters.AddWithValue("@TimeTillEnd", model.TimeTillEnd);
                        dataCommand.Parameters.AddWithValue("@TimeTillEnd", model.TimeTillEnd);
                    }

                    long totalRecords = (long)countCommand.ExecuteScalar();

                    StringBuilder dataQueryBuilder = new StringBuilder();
                    dataQueryBuilder.Append("SELECT l.*, b.BidAmount, u.* ");
                    dataQueryBuilder.Append(baseQueryBuilder.ToString());


                    dataQueryBuilder.Append(" LIMIT @Offset, @PageSize");
                    dataCommand.CommandText = dataQueryBuilder.ToString();
                    dataCommand.Parameters.AddWithValue("@Offset", (page - 1) * pageSize);
                    dataCommand.Parameters.AddWithValue("@PageSize", pageSize);

                    if (!string.IsNullOrWhiteSpace(model.OrderBy) && model.Ascending.HasValue)
                    {
                        string sortOrder = model.Ascending.Value ? "ASC" : "DESC";
                        dataQueryBuilder.Append($" ORDER BY {model.OrderBy} {sortOrder}");
                    }

                    using (MySqlDataReader reader = dataCommand.ExecuteReader())
                    {
                        List<LotWithMaxBid> userBids = new List<LotWithMaxBid>();

                        while (reader.Read())
                        {
                            Lot lot = new Lot(reader);
                            decimal bidAmount = Convert.ToDecimal(reader["BidAmount"]);
                            UserProfile userProfile = new UserProfile(reader);

                            userBids.Add(new LotWithMaxBid(lot, bidAmount, userProfile));
                        }

                        return Ok(new
                        {
                            totalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                            totalRecords = totalRecords,
                            userBids = userBids
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserBids method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }






        [HttpPost("fastBuy")]
        public async Task<IActionResult> FastBuy([FromBody] BidModel model)
        {
            string tok = model.Token;
            var userId = ExtractUserIdFromToken(tok);
            try
            {
                Console.WriteLine($"Received data - LotId: {model.LotId}, BidAmount: {model.BidAmount}");

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    await connection.OpenAsync();
                    // Проверяем наличие ставок для данного лота
                    string checkBidsQuery = "SELECT COUNT(*) FROM Bids WHERE LotId = @LotId";
                    using (MySqlCommand checkBidsCommand = new MySqlCommand(checkBidsQuery, connection))
                    {
                        checkBidsCommand.Parameters.AddWithValue("@LotId", model.LotId);
                        int bidCount = Convert.ToInt32(await checkBidsCommand.ExecuteScalarAsync());

                        // Если есть хотя бы одна ставка, возвращаем ошибку
                        if (bidCount > 0)
                        {
                            return BadRequest(new { message = "Bids already exist for this lot" });
                        }
                    }
                    // Начинаем транзакцию
                    using (MySqlTransaction transaction = await connection.BeginTransactionAsync())
                    {
                        try
                        {
                            // Получаем информацию о лоте
                            decimal price;
                            bool allowBids;
                            bool active;
                            int ownerId;

                            // Execute the first command to get lot information
                            using (MySqlConnection connectionForLotInfo = new MySqlConnection(_connString))
                            {
                                await connectionForLotInfo.OpenAsync();
                                using (MySqlCommand getLotInfoCommand = connectionForLotInfo.CreateCommand())
                                {
                                    getLotInfoCommand.CommandText = "SELECT Price, AllowBids, Active, UserId AS OwnerId FROM Lots WHERE Id = @LotId";
                                    getLotInfoCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                    using (MySqlDataReader lotReader = await getLotInfoCommand.ExecuteReaderAsync())
                                    {
                                        if (lotReader.Read())
                                        {
                                            price = Convert.ToDecimal(lotReader["Price"]);
                                            allowBids = Convert.ToBoolean(lotReader["AllowBids"]);
                                            active = Convert.ToBoolean(lotReader["Active"]);
                                            ownerId = Convert.ToInt32(lotReader["OwnerId"]);

                                            // Выводим цену в консоль для понимания
                                            Console.WriteLine($"Price of the item: {price}");
                                        }
                                        else
                                        {
                                            return BadRequest(new { message = "Lot not found" });
                                        }
                                    }
                                }
                            }

                            // Проверяем, что лот активен
                            if (!active)
                            {
                                return BadRequest(new { message = "Lot is not active" });
                            }



                            // Добавляем ставку в таблицу Bids
                            using (MySqlConnection connectionForInsertBid = new MySqlConnection(_connString))
                            {
                                await connectionForInsertBid.OpenAsync();
                                using (MySqlCommand insertBidCommand = connectionForInsertBid.CreateCommand())
                                {
                                    insertBidCommand.CommandText = "INSERT INTO Bids (LotId, UserId, BidAmount, BidTime) VALUES (@LotId, @UserId, @BidAmount, NOW())";
                                    insertBidCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                    insertBidCommand.Parameters.AddWithValue("@UserId", userId);
                                    insertBidCommand.Parameters.AddWithValue("@BidAmount", model.BidAmount);
                                    await insertBidCommand.ExecuteNonQueryAsync();
                                }
                            }

                            // Обновляем лот
                            using (MySqlConnection connectionForUpdateLot = new MySqlConnection(_connString))
                            {
                                await connectionForUpdateLot.OpenAsync();
                                using (MySqlCommand updateLotCommand = connectionForUpdateLot.CreateCommand())
                                {
                                    updateLotCommand.CommandText = "UPDATE Lots SET WinnerUserId = @WinnerUserId, Active = false, AllowBids = false, Unactive = true, isWaitingPayment = true WHERE Id = @LotId";
                                    updateLotCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                    updateLotCommand.Parameters.AddWithValue("@WinnerUserId", userId);
                                    await updateLotCommand.ExecuteNonQueryAsync();
                                }
                            }

                            // Фиксируем транзакцию
                            await transaction.CommitAsync();

                            // Отправляем письмо владельцу лота
                            string ownerEmail = GetOwnerEmail(ownerId); // Метод для получения электронного адреса владельца лота
                            if (!string.IsNullOrEmpty(ownerEmail))
                            {
                                string subject = "Your item has been purchased!";
                                string body = $"Ваш лот https://localhost:44424/lot/10 успешно купили по указанной цене без аукциона. " +
                                    $"Ожидайте оповещения об оплате и готовьтесь к отправке товара." +
                                    $"С уважением, администрация Exestick.";
                                await SendEmailAsync(ownerEmail, subject, body);
                            }

                            return Ok(new { message = "Bid placed successfully and lot updated" });
                        }
                        catch (Exception ex)
                        {
                            // Откатываем транзакцию в случае ошибки
                            await transaction.RollbackAsync();
                            Console.WriteLine($"Error in FastBuy method: {ex}");
                            return StatusCode(500, new { message = "Internal Server Error. Please try again later." });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FastBuy method: {ex}");
                return StatusCode(500, new { message = "Internal Server Error. Please try again later." });
            }
        }


        private string GetOwnerEmail(int ownerId)
        {
            string ownerEmail = null;

            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    string query = "SELECT Email FROM Users WHERE UserId = @OwnerId";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@OwnerId", ownerId);

                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                ownerEmail = reader.GetString("Email");
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching owner email: {ex.Message}");
                // Обработайте исключение в соответствии с вашими потребностями
            }

            return ownerEmail;
        }


        [HttpGet("getRecentBids/{lotId}")]
        public IActionResult GetRecentBids(int lotId)
        {
            try
            {
                List<BidHistoryModel> recentBids = new List<BidHistoryModel>();

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос на получение 5 последних ставок для указанного лота
                    string query = "SELECT b.*, u.* FROM Bids b " +
                                   "INNER JOIN Users u ON b.UserId = u.Id " +
                                   "WHERE b.LotId = @LotId ORDER BY b.BidTime DESC LIMIT 5";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@LotId", lotId);
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                UserProfile userProfile = new UserProfile(reader);
                                BidHistoryModel bid = new BidHistoryModel
                                {
                                    LotId = Convert.ToInt32(reader["LotId"]),
                                    UserId = userProfile, // Здесь сохраняем профиль пользователя вместо идентификатора
                                    BidAmount = Convert.ToDecimal(reader["BidAmount"]),
                                    BidTime = Convert.ToDateTime(reader["BidTime"])
                                };
                                recentBids.Add(bid);
                            }
                        }
                    }
                }

                return Ok(recentBids);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetRecentBids method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }

    }

    public class BidModel
    {

        public int LotId { get; set; }

        public decimal BidAmount { get; set; }

        public string Token { get; set; } // Добавлено поле Token для хранения токена
    }
    public class BidHistoryModel
    {

        public int LotId { get; set; }
        public UserProfile UserId { get; set; } // Изменили тип с int на UserProfile
        public decimal BidAmount { get; set; }
        public DateTime BidTime { get; set; }

    }
    public class LotWithMaxBid
    {
        public Lot Lot { get; set; }
        public decimal MaxBidAmount { get; set; }
        public UserProfile BidProfile { get; set; } // Добавлено свойство для профиля пользователя

        public LotWithMaxBid(Lot lot, decimal maxBidAmount, UserProfile bidProfile) // Добавлен третий параметр для профиля пользователя
        {
            Lot = lot;
            MaxBidAmount = maxBidAmount;
            BidProfile = bidProfile; // Инициализируем свойство с профилем пользователя
        }
    }
    public class UserBidsRequestModel
    {
        public string Token { get; set; }
        public string? SearchQuery { get; set; }
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Region { get; set; }
        public string? City { get; set; }
        public bool? IsNew { get; set; }
        public DateTime? TimeTillEnd { get; set; }
        public string? OrderBy { get; set; }
        public bool? Ascending { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 4;
    }


}