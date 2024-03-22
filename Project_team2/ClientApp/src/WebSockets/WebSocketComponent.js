import React, { useState, useEffect } from 'react';
import { WS_BASE_URL } from '../API/apiConstant';
import { getLocalStorage } from '../utils/localStorage';

function WebSocketComponent() {
  const [webSocket, setWebSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const webSocketToken = getLocalStorage('webSocketToken')

  // Устанавливаем соединение при монтировании компонента
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/connect?token=${webSocketToken}`);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      // При получении сообщения от сервера добавляем его в состояние
      setMessages(prevMessages => [...prevMessages, event.data]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setWebSocket(ws);

    // Закрываем соединение при размонтировании компонента
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (webSocket && input.trim() && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(input);
      setInput(''); // Очищаем поле ввода после отправки
    } else {
      console.log('WebSocket is not connected.');
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default WebSocketComponent;