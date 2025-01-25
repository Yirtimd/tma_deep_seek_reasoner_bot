import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Chat = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Функция отправки сообщения
  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError(null);
    dispatch({ type: 'ADD_MESSAGE', payload: { text: input, sender: 'user' } });
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка API');
      }

      const { content } = await response.json();
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { text: content, sender: 'bot' } 
      });

    } catch (error) {
      console.error('Ошибка при запросе к API:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Шапка чата */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="font-bold text-xl">You_AI_Chat</div>
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
          YN
        </div>
      </div>

      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-none">
              Печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="border-t px-4 py-3 bg-white fixed bottom-0 left-0 right-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 rounded-xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите сообщение..."
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;