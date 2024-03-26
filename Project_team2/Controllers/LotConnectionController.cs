using System.Net.WebSockets;
using System.Text;

namespace Project_team2.Controllers
{
    public interface ILotConnectionController
    {
        void AddConnectionForLot(int lotId, WebSocket webSocket);
        Task SendBidUpdate(int lotId, string jsonData);
        Task SendDataToClientAsync(WebSocket webSocket, string jsonData);

    }

    public class LotConnectionController : ILotConnectionController
    {
        private readonly Dictionary<int, List<WebSocket>> _lotConnections = new();

        public void AddConnectionForLot(int lotId, WebSocket webSocket)
        {
            if (!_lotConnections.ContainsKey(lotId))
            {
                _lotConnections[lotId] = new List<WebSocket>();
            }

            _lotConnections[lotId].Add(webSocket);
        }

        public async Task SendBidUpdate(int lotId, string jsonData)
        {
            if (_lotConnections.ContainsKey(lotId))
            {
                foreach (var webSocket in _lotConnections[lotId])
                {
                    await SendDataToClientAsync(webSocket, jsonData);
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
                Console.WriteLine($"send: {data}");
                await webSocket.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Text, true, CancellationToken.None);
            }
            else
            {
                // Обработка случая, когда соединение с клиентом закрыто или недоступно
                // Например, удаление отключенного клиента из списка подключенных 
                // или другие действия, соответствующие вашим требованиям
            }
        }
    }

}
