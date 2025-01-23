import { useEffect } from 'react';
import Chat from '../components/Chat';

export default function Home() {
  useEffect(() => {
    // Инициализация Telegram Web App
    const tg = window.Telegram.WebApp;
    tg.expand(); // Развернуть приложение на весь экран
    tg.setHeaderColor('#1F2937'); // Цвет заголовка (темный)
    tg.setBackgroundColor('#111827'); // Цвет фона (темный)
  }, []);

  return <Chat />;
}