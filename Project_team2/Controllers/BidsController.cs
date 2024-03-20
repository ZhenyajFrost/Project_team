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
        public async Task<IActionResult> PlaceBid([FromBody] BidModel model)
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

                                // Get first image URL from comma-separated list
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

                // Send email notification if needed
                if (userIdWhoseBidWasOutbid != 0)
                {
                    string userEmail = GetUserEmail(userIdWhoseBidWasOutbid);
                    if (!string.IsNullOrEmpty(userEmail))
                    {
                        // Read HTML template content
                        string htmlTemplate = await System.IO.File.ReadAllTextAsync("Pages/Sending.html");

                        // Replace placeholders with data from the database
                        htmlTemplate = htmlTemplate.Replace("{{Zagolovok}}", "Ваша ставка была перебита");
                        htmlTemplate = htmlTemplate.Replace("{{lotId}}", model.LotId.ToString());
                        htmlTemplate = htmlTemplate.Replace("{{newBidAmount}}", model.BidAmount.ToString());
                        htmlTemplate = htmlTemplate.Replace("{{title}}", lotTitle);
                        htmlTemplate = htmlTemplate.Replace("{{Description}}", lotDescription);
                        htmlTemplate = htmlTemplate.Replace("{{URL_Lots}}", $"https://localhost:44424/lot/{model.LotId}");
                        htmlTemplate = htmlTemplate.Replace("{{image_url}}", imageUrl); // Замена заполнителя для изображения
                        await SendEmailAsync(userEmail, "Ваша ставка была перебита", htmlTemplate);
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
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    MySqlCommand command = new MySqlCommand();
                    command.Connection = connection;

                    StringBuilder queryBuilder = new StringBuilder();
                    queryBuilder.Append(@"SELECT 
                l.*, 
                b.BidAmount, 
                u.*
            FROM 
                Lots l
            INNER JOIN (
                SELECT 
                    LotId, 
                    MAX(BidAmount) AS MaxBidAmount
                FROM 
                    Bids
                GROUP BY 
                    LotId
            ) max_bids ON l.Id = max_bids.LotId
            INNER JOIN Bids b ON max_bids.LotId = b.LotId AND max_bids.MaxBidAmount = b.BidAmount
            INNER JOIN Users u ON b.UserId = u.Id
            WHERE 
                l.Price <= @MaxPrice");

                    command.Parameters.AddWithValue("@MaxPrice", model.MaxPrice);

                    // Добавляем остальные фильтры
                    if (!string.IsNullOrWhiteSpace(model.SearchString))
                    {
                        queryBuilder.Append(" AND (l.Title LIKE @SearchString OR l.ShortDescription LIKE @SearchString)");
                        command.Parameters.AddWithValue("@SearchString", $"%{model.SearchString}%");
                    }

                    if (!string.IsNullOrWhiteSpace(model.Category))
                    {
                        queryBuilder.Append(" AND l.Category = @Category");
                        command.Parameters.AddWithValue("@Category", model.Category);
                    }

                    if (model.MinPrice.HasValue)
                    {
                        queryBuilder.Append(" AND l.Price >= @MinPrice");
                        command.Parameters.AddWithValue("@MinPrice", model.MinPrice);
                    }

                    if (!string.IsNullOrWhiteSpace(model.Region))
                    {
                        queryBuilder.Append(" AND l.Region = @Region");
                        command.Parameters.AddWithValue("@Region", model.Region);
                    }

                    if (!string.IsNullOrWhiteSpace(model.City))
                    {
                        queryBuilder.Append(" AND l.City = @City");
                        command.Parameters.AddWithValue("@City", model.City);
                    }

                    if (model.IsNew.HasValue)
                    {
                        queryBuilder.Append(" AND l.IsNew = @IsNew");
                        command.Parameters.AddWithValue("@IsNew", model.IsNew);
                    }

                    if (model.TimeTillEnd.HasValue)
                    {
                        queryBuilder.Append(" AND l.TimeTillEnd <= @TimeTillEnd");
                        command.Parameters.AddWithValue("@TimeTillEnd", model.TimeTillEnd);
                    }

                    // Добавляем сортировку
                    if (!string.IsNullOrWhiteSpace(model.OrderBy) && model.Ascending.HasValue)
                    {
                        string sortOrder = model.Ascending.Value ? "ASC" : "DESC";
                        queryBuilder.Append($" ORDER BY {model.OrderBy} {sortOrder}");
                    }

                    queryBuilder.Append(" LIMIT @Offset, @PageSize");
                    command.Parameters.AddWithValue("@Offset", (page - 1) * pageSize);
                    command.Parameters.AddWithValue("@PageSize", pageSize);

                    command.CommandText = queryBuilder.ToString();

                    using (MySqlDataReader reader = command.ExecuteReader())
                    {
                        List<LotWithMaxBid> userBids = new List<LotWithMaxBid>();

                        while (reader.Read())
                        {
                            Lot lot = new Lot(reader);
                            decimal bidAmount = Convert.ToDecimal(reader["BidAmount"]);
                            UserProfile userProfile = new UserProfile(reader);

                            userBids.Add(new LotWithMaxBid(lot, bidAmount, userProfile));
                        }

                        // Возвращаем результат с пагинацией и общим количеством найденных лотов
                        return Ok(new
                        {
                            totalPages = (int)Math.Ceiling((double)userBids.Count / pageSize),
                            totalRecords = userBids.Count,
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
                                    updateLotCommand.CommandText = "UPDATE Lots SET WinnerUserId = @WinnerUserId, Active = false, AllowBids = false, isWaitingPayment = true WHERE Id = @LotId";
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