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
            string tok = model.Token;
            var userId = ExtractUserIdFromToken(tok);
            try
            {
                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Начинаем транзакцию
                    using (MySqlTransaction transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            // Получаем текущую максимальную ставку для лота
                            decimal currentMaxBid = 0;
                            string getMaxBidQuery = "SELECT MAX(BidAmount) FROM Bids WHERE LotId = @LotId";
                            using (MySqlCommand getMaxBidCommand = new MySqlCommand(getMaxBidQuery, connection, transaction))
                            {
                                getMaxBidCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                object maxBidObj = getMaxBidCommand.ExecuteScalar();
                                if (maxBidObj != null && maxBidObj != DBNull.Value)
                                {
                                    currentMaxBid = Convert.ToDecimal(maxBidObj);
                                }
                            }

                            // Проверяем, является ли новая ставка выше текущей максимальной
                            if (model.BidAmount > currentMaxBid)
                            {
                                // Обновляем максимальную ставку в таблице Lots
                                string updateLotQuery = "UPDATE Lots SET Price = @Price WHERE Id = @LotId";
                                using (MySqlCommand updateLotCommand = new MySqlCommand(updateLotQuery, connection, transaction))
                                {
                                    updateLotCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                    updateLotCommand.Parameters.AddWithValue("@Price", model.BidAmount);
                                    updateLotCommand.ExecuteNonQuery();
                                }

                                if (currentMaxBid > 0)
                                {
                                    string getPreviousMaxBidderQuery = "SELECT UserId FROM Bids WHERE LotId = @LotId AND BidAmount = @MaxBid";

                                    using (MySqlCommand getPreviousMaxBidderCommand = new MySqlCommand(getPreviousMaxBidderQuery, connection, transaction))
                                    {
                                        getPreviousMaxBidderCommand.Parameters.AddWithValue("@LotId", model.LotId);
                                        getPreviousMaxBidderCommand.Parameters.AddWithValue("@MaxBid", currentMaxBid);
                                        object previousMaxBidderObj = getPreviousMaxBidderCommand.ExecuteScalar();
                                        if (previousMaxBidderObj != null && previousMaxBidderObj != DBNull.Value)
                                        {
                                            int previousMaxBidderUserId = Convert.ToInt32(previousMaxBidderObj);
                                            string getUserEmailQuery = "SELECT Email, NotificationsHelp FROM Users WHERE Id = @UserId";

                                            using (MySqlCommand getUserEmailCommand = new MySqlCommand(getUserEmailQuery, connection, transaction))
                                            {
                                                getUserEmailCommand.Parameters.AddWithValue("@UserId", previousMaxBidderUserId);
                                                using (MySqlDataReader reader = getUserEmailCommand.ExecuteReader())
                                                {
                                                    if (reader.Read())
                                                    {
                                                        string previousMaxBidderEmail = reader["Email"].ToString();
                                                        bool notificationsHelp = Convert.ToBoolean(reader["NotificationsHelp"]);

                                                        // Если у пользователя стоит флаг NotificationsHelp, отправляем письмо
                                                        if (notificationsHelp)
                                                        {
                                                            // Здесь ваш код для отправки электронной почты
                                                            // Например, вызов метода SendEmail
                                                            SendEmail(previousMaxBidderEmail, "Ваша ставка перебита", $"Your bid for lot {model.LotId} has been surpassed.");
                                                        }
                                                    }
                                                }
                                            }
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

                                // Фиксируем транзакцию
                                transaction.Commit();

                                return Ok(new { message = "Bid placed successfully" });
                            }
                            else
                            {
                                return BadRequest(new { message = "New bid must be higher than current max bid" });
                            }
                        }
                        catch (Exception ex)
                        {
                            // Откатываем транзакцию в случае ошибки
                            transaction.Rollback();
                            Console.WriteLine($"Error in PlaceBid method: {ex.ToString()}");
                            return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in PlaceBid method: {ex.ToString()}");
                return StatusCode(500, new { message = $"Internal Server Error. Exception: {ex.Message}" });
            }
        }
        [HttpGet("getUserBids/{userId}")]
        public IActionResult GetUserBids(int userId, int page = 1, int pageSize = 10)
        {
            try
            {
                List<int> uniqueLotIds = new List<int>();

                using (MySqlConnection connection = new MySqlConnection(_connString))
                {
                    connection.Open();

                    // Запрос на получение уникальных идентификаторов лотов, на которые делал ставки указанный пользователь
                    string countQuery = "SELECT COUNT(DISTINCT LotId) FROM Bids WHERE UserId = @UserId";
                    using (MySqlCommand countCommand = new MySqlCommand(countQuery, connection))
                    {
                        countCommand.Parameters.AddWithValue("@UserId", userId);
                        int totalRecords = Convert.ToInt32(countCommand.ExecuteScalar());

                        // Вычисляем общее количество страниц
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

                        // Запрос на получение уникальных идентификаторов лотов с учетом пагинации
                        string query = "SELECT DISTINCT LotId FROM Bids WHERE UserId = @UserId LIMIT @Offset, @PageSize";
                        int offset = (page - 1) * pageSize;
                        using (MySqlCommand command = new MySqlCommand(query, connection))
                        {
                            command.Parameters.AddWithValue("@UserId", userId);
                            command.Parameters.AddWithValue("@Offset", offset);
                            command.Parameters.AddWithValue("@PageSize", pageSize);
                            using (MySqlDataReader reader = command.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    uniqueLotIds.Add(Convert.ToInt32(reader["LotId"]));
                                }
                            }
                        }

                        List<Lot> userBids = new List<Lot>();

                        // Запрос на получение информации о лотах на основе полученных уникальных идентификаторов
                        foreach (int lotId in uniqueLotIds)
                        {
                            string lotQuery = "SELECT * FROM Lots WHERE Id = @LotId";
                            using (MySqlCommand lotCommand = new MySqlCommand(lotQuery, connection))
                            {
                                lotCommand.Parameters.AddWithValue("@LotId", lotId);
                                using (MySqlDataReader lotReader = lotCommand.ExecuteReader())
                                {
                                    if (lotReader.Read())
                                    {
                                        Lot lot = new Lot(lotReader);
                                        userBids.Add(lot);
                                    }
                                }
                            }
                        }

                        // Возвращаем результат с пагинацией и общим количеством найденных лотов
                        return Ok(new { totalPages, totalRecords, userBids });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetUserBids method: {ex.ToString()}");
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
                    string query = "SELECT * FROM Bids WHERE LotId = @LotId ORDER BY BidTime DESC LIMIT 5";
                    using (MySqlCommand command = new MySqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@LotId", lotId);
                        using (MySqlDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                BidHistoryModel bid = new BidHistoryModel
                                {

                                    LotId = Convert.ToInt32(reader["LotId"]),
                                    UserId = Convert.ToInt32(reader["UserId"]),
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
        public DateTime BidTime { get; set; }
        public string Token { get; set; } // Добавлено поле Token для хранения токена
    }
    public class BidHistoryModel
    {

        public int LotId { get; set; }
        public int UserId { get; set; }
        public decimal BidAmount { get; set; }
        public DateTime BidTime { get; set; }
        
    }
}