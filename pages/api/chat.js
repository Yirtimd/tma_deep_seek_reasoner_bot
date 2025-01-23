import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { messages } = req.body;

    try {
      const response = await openai.chat.completions.create({
        model: 'deepseek-reasoner',
        messages,
        max_tokens: 1000,
      });

      res.status(200).json(response.choices[0].message);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при запросе к API Deepseek' });
    }
  } else {
    res.status(405).json({ error: 'Метод не поддерживается' });
  }
}