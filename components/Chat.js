import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Chat = () => {
  const [input, setInput] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messages = useSelector((state) => state.chat.messages);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Обработчик изменения размера экрана
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const viewportHeight = window.visualViewport.height;
      const newKeyboardHeight = windowHeight - viewportHeight;
      setKeyboardHeight(newKeyboardHeight);
    };

    const viewport = window.visualViewport;
    if (viewport) {
      viewport.addEventListener('resize', handleResize);
      return () => viewport.removeEventListener('resize', handleResize);
    }
  }, []);

  // Автоматическая прокрутка к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, keyboardHeight]);


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

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';

      // Создаем новое сообщение бота
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { text: '', sender: 'bot' } 
      });

      const processChunk = async () => {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsLoading(false);
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Разделяем чанки по переносу строки
        const chunks = buffer.split('\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          const trimmedChunk = chunk.trim();
          if (!trimmedChunk) continue;

          try {
            const jsonStr = trimmedChunk.replace(/^data: /, '');
            const parsed = JSON.parse(jsonStr);
            
            if (parsed.content !== undefined) {
              assistantMessage += parsed.content;
              
              // Обновляем последнее сообщение
              dispatch({
                type: 'UPDATE_LAST_MESSAGE',
                payload: { 
                  text: assistantMessage, 
                  sender: 'bot' 
                }
              });

              // Даем время на рендеринг
              await new Promise(resolve => setTimeout(resolve, 10));
            }
          } catch (err) {
            console.error('Ошибка парсинга чанка:', err, 'Чанк:', trimmedChunk);
          }
        }

        processChunk();
      };

      processChunk();

    } catch (error) {
      console.error('Ошибка запроса:', error);
      setError(error.message);
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
      <div 
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ 
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 80}px` : '0'
        }}
      >
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
      <div 
        ref={inputRef}
        className="border-t px-4 py-3 bg-white fixed bottom-0 left-0 right-0"
        style={{ 
          transform: keyboardHeight > 0 ? `translateY(-${keyboardHeight}px)` : 'none',
          transition: 'transform 0.2s ease',
          paddingBottom: keyboardHeight > 0 ? 'env(safe-area-inset-bottom)' : '0'
        }}
      >
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