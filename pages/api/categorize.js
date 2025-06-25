// /pages/api/categorize.js

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { problemDescription, expectedOutput, businessImpact } = req.body;

  if (!problemDescription || !expectedOutput || !businessImpact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `
You are an AI assistant helping real estate investors categorize and summarize internal tool requests.

Given the following tool request:

Problem Description: ${problemDescription}

Expected Output: ${expectedOutput}

Business Impact: ${businessImpact}

1. Generate a short Category for this tool (Example categories: Lead Generation, Underwriting, Marketing Automation, CRM, Deal Analysis, Follow-up, etc.)

2. Generate a concise one-sentence Summary that captures the tool's purpose.

Respond in JSON format like this:

{
  "category": "...",
  "summary": "..."
}
    `;

    const response = await openai.createChatCompletion({
      model: 'gpt-4o',  // Or 'gpt-4' or 'gpt-3.5-turbo'
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const aiReply = response.data.choices[0].message.content;

    // Safely parse AI's JSON response
    const parsed = JSON.parse(aiReply);

    res.status(200).json({
      success: true,
      category: parsed.category,
      summary: parsed.summary,
    });

  } catch (error) {
    console.error('ChatGPT API error:', error);
    res.status(500).json({ error: 'Failed to generate category and summary.' });
  }
}
