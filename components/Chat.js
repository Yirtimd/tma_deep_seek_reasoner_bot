import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Chat = () => {
  const [input, setInput] = useState('');
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();

  const handleSend = async () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_MESSAGE', payload: { text: input, sender: 'user' } });
      setInput('');

      // Отправляем запрос к API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
        });

        const data = await response.json();
        dispatch({ type: 'ADD_MESSAGE', payload: { text: data.content, sender: 'bot' } });
      } catch (error) {
        console.error('Ошибка при запросе к API:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] mb-2 ${
              msg.sender === 'user' ? 'bg-blue-500 self-end' : 'bg-gray-700 self-start'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 p-2 rounded-l-lg bg-gray-800 text-white outline-none"
          placeholder="Введите сообщение..."
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-500 rounded-r-lg hover:bg-blue-600"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;