// pages/api/generate-description.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { prompt, toolName } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  try {
    // Check if Claude API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Claude API key not configured');
      return res.status(500).json({ success: false, error: 'AI service not configured' });
    }

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are an expert AI tool designer. Based on the following brief idea, create a detailed, professional description for an AI tool request.

Tool Name: ${toolName || 'AI Tool'}
Brief Idea: ${prompt}

Generate a comprehensive description that includes:
1. What the tool does
2. The problem it solves
3. Key features and benefits
4. Potential use cases
5. Why it would be valuable

Write in a professional, clear, and compelling manner. Keep it between 100-150 words.

Description:`
        }
      ],
    });

    const generatedDescription = response.content[0]?.type === 'text' ? response.content[0].text : null;

    if (!generatedDescription) {
      return res.status(500).json({ success: false, error: 'Failed to generate description' });
    }

    res.status(200).json({ 
      success: true, 
      description: generatedDescription.trim() 
    });

  } catch (error) {
    console.error('Description generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate description', 
      details: errorMessage 
    });
  }
}