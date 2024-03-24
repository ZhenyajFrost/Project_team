import { useState, useEffect } from 'react';
import { WS_BASE_URL } from './apiConstant';

const useBidUpdatesWebSocket = (token) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const url = `${WS_BASE_URL}/connect?token=${token}`;
      const newSocket = new WebSocket(url);

      newSocket.onopen = () => {
        console.log('WebSocket connected');
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received bid update:', data);
        // Здесь вы можете обработать полученные данные и обновить ваш интерфейс
      };

      newSocket.onclose = () => {
        console.log('WebSocket disconnected');
        // Здесь можно добавить логику для автоматического переподключения, если соединение разорвано
      };

      setSocket(newSocket);
    };

    if (!socket) {
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
        console.log('WebSocket disconnected');
      }
    };
  }, [socket, token]);

  return socket;
};

export default useBidUpdatesWebSocket;