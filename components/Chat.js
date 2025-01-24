import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Chat = () => {
  const [input, setInput] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();

  // Отслеживаем изменение высоты экрана при появлении клавиатуры
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = window.visualViewport.height;
      const newKeyboardHeight = windowHeight - viewportHeight;
      setKeyboardHeight(newKeyboardHeight);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  const handleSend = async () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_MESSAGE', payload: { text: input, sender: 'user' } });
      setInput('');

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.API_KEY}`,
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
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-b from-indigo-800 to-purple-800 text-white">
      <div className="container mx-auto shadow-lg rounded-lg bg-white h-[90vh] w-[90vw] max-w-4xl flex flex-col">
        {/* Шапка чата */}
        <div className="px-5 py-5 flex justify-between items-center bg-white border-b-2">
          <div className="font-semibold text-2xl">You_AI_Chat</div>
          <div className="h-12 w-12 p-2 bg-yellow-500 rounded-full text-white font-semibold flex items-center justify-center">
            YN
          </div>
        </div>

        {/* Контейнер для сообщений */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`py-3 px-4 max-w-[70%] ${
                  msg.sender === 'user'
                    ? 'bg-blue-400 rounded-bl-3xl rounded-tl-3xl rounded-tr-xl text-white'
                    : 'bg-gray-400 rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Поле ввода и кнопка отправки */}
        <div
          className="flex w-full p-5 transition-all duration-300"
          style={{ marginBottom: keyboardHeight }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 p-3 rounded-l-lg bg-gray-100 border border-1 border-zinc-300 border-opacity-30 text-gray-800 outline-none"
            placeholder="Введите сообщение..."
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-500 rounded-r-lg hover:bg-blue-600 text-white"
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;