    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;
    using MySqlConnector;
    using System;
    using System.Threading.Tasks;
    using Project_team2;
    using Newtonsoft.Json;
    using System.Net.WebSockets;
    using System.Text;
    using Project_team2.Controllers;
    using System.Net.WebSockets;
    using System.Text;
    using System.Threading;
[ApiController]
[Route("api/ws")]
    public class WebSocketController : ControllerBase
    {
        private readonly WebSocketServer _webSocketServer;
        private readonly string _connectionString;
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
    public WebSocketController(WebSocketServer webSocketServer, IConfiguration configuration)
        {
            _webSocketServer = webSocketServer;
            _connectionString = Config.MySqlConnection; // Убедитесь, что строка подключения указана в appsettings.json
        }
 
   

    [HttpGet("connect")]
        public async Task<IActionResult> Connect(string token)
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                var userToken = await ValidateTokenAsync(token);
                if (!userToken.isValid)
                {
                    return Unauthorized("Invalid or missing token.");
                }

                // Delegating WebSocket connection management
                await _webSocketServer.HandleWebSocketAsync(HttpContext, userToken.Token);

                return new EmptyResult();
            }
            else
            {
                return BadRequest("A WebSocket request is expected.");
            }
        }
    
    public async Task<IActionResult> SendBidUpdate(int lotId, WebSocket webSocket)
    {
        try
        {
            // Получаем данные о самой большой BidAmount для указанного лота
            string query = @"
        SELECT UserId, MAX(BidAmount) AS MaxBidAmount
        FROM Bids
        WHERE LotId = @lotId
        GROUP BY UserId";

            using (MySqlConnection connection = new MySqlConnection(_connectionString))
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

            return Ok();
        }
        catch (Exception ex)
        {
            // Обработка ошибок отправки данных клиенту
            // Например, логирование ошибки или возврат соответствующего статуса кода
            return StatusCode(500, new { message = $"Internal Server Error: {ex.Message}" });
        }
    }


    private async Task<UserProfile> GetUserProfileAsync(string userId)
    {
        // Запрос для получения профиля пользователя по его идентификатору
        string query = @"
        SELECT * FROM Users WHERE Id = @userId";

        using (MySqlConnection connection = new MySqlConnection(_connectionString))
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

    private async Task<UserTokenModel> ValidateTokenAsync(string token)
        {
            await using var connection = new MySqlConnection(_connectionString);
            await connection.OpenAsync();
            string query = "SELECT userId, expiryDate FROM UsersWebTokens WHERE token = @token";
            await using (var cmd = new MySqlCommand(query, connection))
            {
                cmd.Parameters.AddWithValue("@token", token);
                await using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync() && DateTime.Parse(reader["expiryDate"].ToString()) > DateTime.UtcNow)
                    {
                        return new UserTokenModel
                        {
                            UserId = reader["userId"].ToString(),
                            Token = token,
                            isValid = true
                        };
                    }
                }
            }
            return new UserTokenModel
            {
                UserId = null,
                Token = null,
                isValid = false
            };
        }


        public class UserTokenModel
        {
            public string UserId { get; set; }
            public string Token { get; set; }
            public bool isValid { get; set; }
        }
    }
