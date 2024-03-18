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

namespace Project2.Controllers
{
    [Route("api/bids")]
    [ApiController]
    public class BidsController : ControllerBase
    {
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

        private readonly string _connString;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _telegramBotToken;
        private readonly long _chatId;
        public BidsController()
        {
            _connString = Config.MySqlConnection;
            _smtpServer = Config.SmtpServer;
            _smtpPort = Config.SmtpPort;
            _smtpUsername = Config.SmtpUsername;
            _smtpPassword = Config.SmtpPassword;
            _telegramBotToken = Config.TelegramBotToken;
            _chatId = Config.ChatId;
        }
       
        public void SendEmail(string recipientEmail,string subject, string message)
        {
            using (SmtpClient smtpClient = new SmtpClient(_smtpServer, _smtpPort))
            {
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                smtpClient.EnableSsl = true;

                using (MailMessage mailMessage = new MailMessage())
                {
                    mailMessage.From = new MailAddress(_smtpUsername);
                    mailMessage.To.Add(recipientEmail);
                    mailMessage.Subject = subject;
                    mailMessage.Body = message;
                    mailMessage.IsBodyHtml = false;

                    smtpClient.Send(mailMessage);
                }
            }
        }

        [HttpPost("placeBid")]
        public IActionResult PlaceBid([FromBody] BidModel model)
        {
            var userId = ExtractUserIdFromToken(model.Token);

            try
            {
                // Get lot information
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
                                return BadRequest(new { message = "Lot not found" });
                            }
                        }
                    }
                }

                // Check if bidding is allowed for the lot
                if (!allowBids)
                {
                    return BadRequest(new { message = "Bidding is not allowed for this lot" });
                }

                // Get current maximum bid for the lot
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

                // Check if the bid amount is valid
                if (model.BidAmount < minPrice || (currentMaxBid > 0 && model.BidAmount <= currentMaxBid))
                {
                    return BadRequest(new { message = "The bid amount must be greater than the minimum price and higher than the current maximum bid" });
                }

                // Check if the bid amount is at least MinStepPrice higher than the current maximum bid
                if (model.BidAmount < currentMaxBid + minStepPrice)
                {
                    return BadRequest(new { message = "The bid amount must be at least the minimum step price higher than the current maximum bid" });
                }

                // Add bid to Bids table
                AddBidToDatabase(model.LotId, userId, model.BidAmount);

                // Send email notification if needed
                if (userIdWhoseBidWasOutbid != 0)
                {
                    string userEmail = GetUserEmail(userIdWhoseBidWasOutbid);
                    if (!string.IsNullOrEmpty(userEmail))
                    {
                        string subject = "Your bid has been outbid";
                        string message = $"Your bid has been outbid for lot ID: {model.LotId}.";
                        SendEmail(userEmail, subject, message);
                    }
                }

                return Ok(new { message = "Bid placed successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PlaceBid method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
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
                List<int> userBidsCount = new List<int>();
                List<Lot> userLots = new List<Lot>();
                List<decimal> maxBidAmounts = new List<decimal>();
                List<UserProfile> bidProfiles = new List<UserProfile>(); // Список профилей пользователей для каждой ставки

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    MySqlCommand command = new MySqlCommand();
                    command.Connection = connection;

                    string query = @"
    SELECT l.*, b.BidAmount, u.*
    FROM Lots l
    INNER JOIN (
        SELECT LotId, MAX(BidAmount) AS MaxBidAmount
        FROM Bids
        GROUP BY LotId
    ) max_bids ON l.Id = max_bids.LotId
    INNER JOIN Bids b ON max_bids.LotId = b.LotId AND max_bids.MaxBidAmount = b.BidAmount
    INNER JOIN Users u ON b.UserId = u.Id
    WHERE (l.Approved = true AND b.UserId = @UserId)
    OR (l.IsWaitingPayment = true AND l.WinnerUserId = @UserId)
    OR (l.IsWaitingDelivery = true AND l.WinnerUserId = @UserId)";
                    command.Parameters.AddWithValue("@UserId", userId);

                    // Добавляем фильтрацию
                    if (!string.IsNullOrWhiteSpace(model.SearchString))
                    {
                        query += " AND (l.Title LIKE @SearchString OR l.ShortDescription LIKE @SearchString)";
                        command.Parameters.AddWithValue("@SearchString", $"%{model.SearchString}%");
                    }

                    if (!string.IsNullOrWhiteSpace(model.Category))
                    {
                        query += " AND l.Category = @Category";
                        command.Parameters.AddWithValue("@Category", model.Category);
                    }

                    if (model.MinPrice.HasValue)
                    {
                        query += " AND l.Price >= @MinPrice";
                        command.Parameters.AddWithValue("@MinPrice", model.MinPrice);
                    }

                    if (model.MaxPrice.HasValue)
                    {
                        query += " AND l.Price <= @MaxPrice";
                        command.Parameters.AddWithValue("@MaxPrice", model.MaxPrice);
                    }

                    if (!string.IsNullOrWhiteSpace(model.Region))
                    {
                        query += " AND l.Region = @Region";
                        command.Parameters.AddWithValue("@Region", model.Region);
                    }

                    if (!string.IsNullOrWhiteSpace(model.City))
                    {
                        query += " AND l.City = @City";
                        command.Parameters.AddWithValue("@City", model.City);
                    }

                    if (model.IsNew.HasValue)
                    {
                        query += " AND l.IsNew = @IsNew";
                        command.Parameters.AddWithValue("@IsNew", model.IsNew);
                    }

                    if (model.TimeTillEnd.HasValue)
                    {
                        query += " AND l.TimeTillEnd <= @TimeTillEnd";
                        command.Parameters.AddWithValue("@TimeTillEnd", model.TimeTillEnd);
                    }

                    // Добавляем сортировку
                    if (!string.IsNullOrWhiteSpace(model.OrderBy) && model.Ascending.HasValue)
                    {
                        string sortOrder = model.Ascending.Value ? "ASC" : "DESC";
                        query += $" ORDER BY {model.OrderBy} {sortOrder}";
                    }

                    int offset = (page - 1) * pageSize;
                    if (offset < 0)
                    {
                        offset = 0; // Установка смещения в 0, если оно отрицательное
                    }
                    query += " LIMIT @Offset, @PageSize";
                    command.Parameters.AddWithValue("@Offset", offset);
                    command.Parameters.AddWithValue("@PageSize", pageSize);

                    command.CommandText = query;

                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            userLots.Add(new Lot(reader));
                            maxBidAmounts.Add(Convert.ToDecimal(reader["BidAmount"]));
                            bidProfiles.Add(new UserProfile(reader));
                        }
                    }

                    // Получаем общее количество записей (без учета пагинации)
                    command.CommandText = "SELECT COUNT(DISTINCT LotId) FROM Bids WHERE UserId = @UserId";
                    int totalRecords = Convert.ToInt32(command.ExecuteScalar());
                    int totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

                    // Проверяем валидность номера страницы
                    if (page < 1)
                    {
                        page = 1;
                    }
                    else if (page > totalPages)
                    {
                        page = totalPages;
                    }

                    // Возвращаем результат с пагинацией и общим количеством найденных лотов
                    return Ok(new { totalPages, totalRecords, userBids = userLots.Select((lot, index) => new LotWithMaxBid(lot, maxBidAmounts[index], bidProfiles[index])) });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserBids method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }





        [HttpPost("fastBuy")]
        public IActionResult FastBuy([FromBody] BidModel model)
        {
            string tok = model.Token;
            var userId = ExtractUserIdFromToken(tok);
            try
            {
                Console.WriteLine($"Received data - LotId: {model.LotId}, BidAmount: {model.BidAmount}");

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Начинаем транзакцию
                    using (MySqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Получаем информацию о лоте
                            string getLotInfoQuery = "SELECT Price, AllowBids, Active FROM Lots WHERE Id = @LotId";
                            using (MySqlCommand getLotInfoCommand = new MySqlCommand(getLotInfoQuery, connection, transaction))
                            {
                                getLotInfoCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                using (MySqlDataReader lotReader = getLotInfoCommand.ExecuteReader())
                                {
                                    if (lotReader.Read())
                                    {
                                        decimal price = Convert.ToDecimal(lotReader["Price"]);
                                        bool allowBids = Convert.ToBoolean(lotReader["AllowBids"]);
                                        bool active = Convert.ToBoolean(lotReader["Active"]);

                                        // Выводим цену в консоль для понимания
                                        Console.WriteLine($"Price of the item: {price}");

                                        // Проверяем, что лот активен
                                        if (!active)
                                        {
                                            return BadRequest(new { message = "Lot is not active" });
                                        }

                                        // Проверяем, что ставки не разрешены
                                        if (!allowBids)
                                        {
                                            // Продолжаем выполнение метода, так как это разрешено, когда Active = true и Allow Bids = false
                                            Console.WriteLine("Bidding is not allowed but continuing with the purchase process.");

                                            // Теперь мы можем проверить, равна ли ставка цене товара
                                            if (model.BidAmount != price)
                                            {
                                                return BadRequest(new { message = "Bid amount must be equal to the price of the item" });
                                            }
                                        }
                                        else
                                        {
                                            // Если ставки разрешены, возвращаем ошибку
                                            return BadRequest(new { message = "You cannot buy this item after the auction has started" });
                                        }
                                    }
                                    else
                                    {
                                        return BadRequest(new { message = "Lot not found" });
                                    }
                                }
                            }

                            // Добавляем ставку в таблицу Bids
                            string insertBidQuery = "INSERT INTO Bids (LotId, UserId, BidAmount, BidTime) VALUES (@LotId, @UserId, @BidAmount, NOW())";
                            using (MySqlCommand insertBidCommand = new MySqlCommand(insertBidQuery, connection, transaction))
                            {
                                insertBidCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                insertBidCommand.Parameters.AddWithValue("@UserId", userId);
                                insertBidCommand.Parameters.AddWithValue("@BidAmount", model.BidAmount);
                                insertBidCommand.ExecuteNonQuery();
                            }

                            // Обновляем лот
                            string updateLotQuery = "UPDATE Lots SET WinnerUserId = @WinnerUserId, Active = false, AllowBids = false, isWaitingPayment = true WHERE Id = @LotId";
                            using (MySqlCommand updateLotCommand = new MySqlCommand(updateLotQuery, connection, transaction))
                            {
                                updateLotCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                updateLotCommand.Parameters.AddWithValue("@WinnerUserId", userId);
                                updateLotCommand.ExecuteNonQuery();
                            }

                            // Фиксируем транзакцию
                            transaction.Commit();

                            return Ok(new { message = "Bid placed successfully and lot updated" });
                        }
                        catch (Exception ex)
                        {
                            // Откатываем транзакцию в случае ошибки
                            transaction.Rollback();
                            Console.WriteLine($"Error in FastBuy method: {ex.ToString()}");
                            return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FastBuy method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
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
        public string? SearchString { get; set; }
        public string? Category { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Region { get; set; }
        public string? City { get; set; }
        public bool? IsNew { get; set; }
        public DateTime? TimeTillEnd { get; set; }
        public string? OrderBy { get; set; }
        public bool? Ascending { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }


}