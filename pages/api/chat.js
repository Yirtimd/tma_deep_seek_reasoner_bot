import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY, // Убедитесь, что ключ API задан в .env
  baseURL: 'https://api.deepseek.com',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const response = await openai.chat.completions.create({
        model: 'deepseek-reasoner',
        messages: req.body.messages,
        stream: true,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of response) {
        const content = chunk.choices[0]?.delta?.content || '';
        res.write(`data: ${JSON.stringify({ content })}\n`); // Важно: только \n
        await new Promise(resolve => setTimeout(resolve, 50)); // Имитация задержки
      }

      res.end();
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}