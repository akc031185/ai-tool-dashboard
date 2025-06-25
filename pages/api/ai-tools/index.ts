// pages/api/ai-tools/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import AiTool from '@/models/AiTool';
import openai from '@/lib/openai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, error: 'Missing name or description' });
    }

    try {
      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an AI categorizer for software tools. Return only a short one-line category for the given tool name and description.',
          },
          {
            role: 'user',
            content: `Name: ${name}\nDescription: ${description}`,
          },
        ],
      });

      const aiMessage = aiResponse.choices[0]?.message?.content;

      if (!aiMessage) {
        console.error('AI response missing content:', aiResponse);
        return res.status(500).json({ success: false, error: 'AI did not return a category' });
      }

      const suggestedCategory = aiMessage.trim();

      const newTool = new AiTool({
        name,
        description,
        category: suggestedCategory,
        progress: 'Draft', // 👈 New progress field
      });

      await newTool.save();

      res.status(201).json({ success: true, tool: newTool });
    } catch (error) {
      console.error('AI categorization error:', error);
      res.status(500).json({ success: false, error: 'AI categorization failed' });
    }
  } else if (req.method === 'GET') {
    try {
      const tools = await AiTool.find();
      res.status(200).json({ success: true, tools });
    } catch (error) {
      console.error('Database fetch error:', error);
      res.status(500).json({ success: false, error: 'Could not fetch tools' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
