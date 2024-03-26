import React, { useEffect, useState } from 'react';
import { WS_BASE_URL } from '../API/apiConstant'; // Убедитесь, что импорт правильный

const WebSocketComponent = ({ token, lotId }) => {
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    // Если токен или ID лота не предоставлены, не создавать WebSocket соединение
    if (!token || !lotId) return;

    // Создание нового WebSocket соединения
    const ws = new WebSocket(`${WS_BASE_URL}/connect?token=${token}&lotId=${lotId}`);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      setWebSocket(ws);
    };

    ws.onmessage = (event) => {
      if (event) {
        console.log("Received message:", event.data);
      }
      // Обработка сообщений от сервера
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
      setWebSocket(null);
    };

    // Функция очистки, которая будет вызвана при размонтировании компонента
    return () => {
      ws.close();
      console.log("WebSocket connection closed");
    };
  }, [token, lotId]); // Пересоздание WebSocket при изменении токена или ID лота

  // Функция для отправки сообщения через WebSocket
  const sendMessage = (message) => {
    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(message);
    }
  };

  // Пример интерфейса для отправки сообщения (можно адаптировать под ваши нужды)
  return (
    <div>
    </div>
  );

};

export default WebSocketComponent;