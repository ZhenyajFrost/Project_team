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

    public async Task<WebSocket> HandleWebSocketAsync(HttpContext context, string userToken)
    {
        if (context.WebSockets.IsWebSocketRequest)
        {
            WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
            _sockets.TryAdd(userToken, webSocket);
            _logger.LogInformation($"WebSocket connection established. ID: {userToken}");

            // Optionally, send a welcome message or perform some initialization here
            var welcomeMessage = Encoding.UTF8.GetBytes("Hello from server in");
            await webSocket.SendAsync(new ArraySegment<byte>(welcomeMessage), WebSocketMessageType.Text, true, CancellationToken.None);

            return webSocket;
        }
        else
        {
            context.Response.StatusCode = 400;
            return null; // Or throw an exception, depending on your error handling strategy
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
