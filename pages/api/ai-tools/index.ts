// pages/api/ai-tools/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import AiTool from '@/models/AiTool';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, error: 'Missing name or description' });
    }

    try {
      // Check if Claude API key is configured
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error('Claude API key not configured');
        return res.status(500).json({ success: false, error: 'Claude API key not configured' });
      }

      // Initialize Claude client
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const aiResponse = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        messages: [
          {
            role: 'user',
            content: `You are an AI categorizer for software tools. Return only a short one-line category for the given tool name and description.

Name: ${name}
Description: ${description}

Category:`
          }
        ],
      });

      const aiMessage = aiResponse.content[0]?.type === 'text' ? aiResponse.content[0].text : null;

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
      console.error('Claude categorization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      res.status(500).json({ success: false, error: 'Claude categorization failed', details: errorMessage });
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
