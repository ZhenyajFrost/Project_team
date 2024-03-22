using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MySqlConnector;
using System;
using System.Threading.Tasks;
using Project_team2;
using Project_team2.Controllers;

[ApiController]
[Route("api/ws")]
public class WebSocketController : ControllerBase
{
    private readonly WebSocketServer _webSocketServer;
    private readonly string _connectionString;

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
