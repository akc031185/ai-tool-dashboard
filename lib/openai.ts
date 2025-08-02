// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Log for debugging
console.log('OpenAI client initialized:', !!openai);
console.log('API key present:', !!process.env.OPENAI_API_KEY);

export default openai;
