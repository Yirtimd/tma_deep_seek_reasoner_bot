import { useEffect } from 'react';
import Chat from '../components/Chat';

export default function Home() {
  useEffect(() => {
    // Проверяем, доступен ли Telegram Web App API
    if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand(); // Развернуть приложение на весь экран
      tg.setHeaderColor('#1F2937'); // Цвет заголовка (темный)
      tg.setBackgroundColor('#111827'); // Цвет фона (темный)
    } else {
      console.warn('Telegram Web App API недоступен. Запустите приложение внутри Telegram.');
    }
  }, []);

  return <Chat />;
}