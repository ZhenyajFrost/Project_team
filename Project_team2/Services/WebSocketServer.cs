using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

public class WebSocketServer
{
    private readonly ILogger<WebSocketServer> _logger;
    private static readonly ConcurrentDictionary<string, WebSocket> _sockets = new ConcurrentDictionary<string, WebSocket>();

    public WebSocketServer(ILogger<WebSocketServer> logger)
    {
        _logger = logger;
    }

    public async Task HandleWebSocketAsync(HttpContext context, string userToken)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
            _sockets.TryAdd(userToken, webSocket);
            System.Console.WriteLine($"WebSocket connection established. ID: {userToken}");
            _logger.LogInformation($"WebSocket connection established. ID: {userToken}");

            try
            {
                await Echo(context, webSocket, userToken);
            }
            finally
            {
                _sockets.TryRemove(userToken, out var _);
                _logger.LogInformation($"WebSocket connection closed. ID: {userToken}");
                System.Console.WriteLine($"WebSocket connection closed. ID: {userToken}");

            }
        }
        else
        {
            context.Response.StatusCode = 400;
        }
    }

    private async Task Echo(HttpContext context, WebSocket webSocket, string connectionId)
    {
        var buffer = new byte[1024 * 4];
        WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

        while (!result.CloseStatus.HasValue)
        {
            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            _logger.LogInformation($"Received message: \"{message}\" from ID: {connectionId}");

            var serverMsg = Encoding.UTF8.GetBytes($"Server: Hello. You said: \"{message}\"");
            await webSocket.SendAsync(new ArraySegment<byte>(serverMsg, 0, serverMsg.Length), result.MessageType, result.EndOfMessage, CancellationToken.None);

            result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
        }

        await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
    }
}
