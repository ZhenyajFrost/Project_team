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

    // Метод для добавления соединения для определенного лота
    private readonly ILotConnectionController _lotConnectionController;

    public WebSocketController(WebSocketServer webSocketServer, IConfiguration configuration, ILotConnectionController lotConnectionController)
    {
        _webSocketServer = webSocketServer;
        _connectionString = Config.MySqlConnection; // Убедитесь, что строка подключения указана в appsettings.json
        _lotConnectionController = lotConnectionController;
    }


    [HttpGet("connect")]
    public async Task<IActionResult> Connect(string token, int lotId)
    {
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            var userToken = await ValidateTokenAsync(token);
            if (!userToken.isValid)
            {
                return Unauthorized("Invalid or missing token.");
            }

            var webSocket = await _webSocketServer.HandleWebSocketAsync(HttpContext, token, lotId);
            if (webSocket != null)
            {
                _lotConnectionController.AddConnectionForLot(lotId, webSocket);// Добавляем соединение для этого лота
                var message = Encoding.UTF8.GetBytes("Hello from server out");
                await webSocket.SendAsync(new ArraySegment<byte>(message), WebSocketMessageType.Text, true, CancellationToken.None);
            }
            else
            {
                Console.WriteLine("Socket is null");
            }


            // Выполнить дополнительные действия при подключении, если это необходимо

            return new EmptyResult();
        }
        else
        {
            return BadRequest("A WebSocket request is expected.");
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
