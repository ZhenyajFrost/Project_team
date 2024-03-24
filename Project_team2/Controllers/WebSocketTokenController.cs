using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;
using MySqlConnector;

public class WebSocketTokenController
{
    private readonly MySqlConnection _connection;

    public WebSocketTokenController(MySqlConnection connection)
    {
        _connection = connection;
    }

    public async Task<string> GenerateTokenAsync(string userId)
    {
        var token = Guid.NewGuid().ToString();

        return token;
    }

    public async Task<(bool IsValid, string UserId)> ValidateTokenAsync(string token)
    {
        string userId = null;
        var query = "SELECT userId, expiryDate FROM UsersWebTokens WHERE token = @token";

        _connection.Open();
        await using (var cmd = new MySqlCommand(query, _connection))
        {
            cmd.Parameters.AddWithValue("@token", token);
            await using (var reader = await cmd.ExecuteReaderAsync())
            {
                if (await reader.ReadAsync() && DateTime.Parse(reader["expiryDate"].ToString()) > DateTime.UtcNow)
                {
                    userId = reader["userId"].ToString();
                    _connection.Close();
                    return (true, userId);
                }
            }
        }
        _connection.Close();

        return (false, null);
    }


    public async Task CleanupExpiredTokensAsync()
    {
        var query = "DELETE FROM UsersWebTokens WHERE expiryDate <= @currentDate";
        await using (var cmd = new MySqlCommand(query, _connection))
        {
            cmd.Parameters.AddWithValue("@currentDate", DateTime.UtcNow);
            await cmd.ExecuteNonQueryAsync();
        }
    }
}
