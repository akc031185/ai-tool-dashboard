import dbConnect from '@/lib/dbConnect';
import AiTool from '@/models/AiTool';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const newTool = new AiTool(req.body);
      await newTool.save();
      res.status(201).json({ success: true, message: 'AI Tool request saved' });
    } catch (error) {
      res.status(500).json({ success: false, error });
    }
  } else if (req.method === 'GET') {
    try {
      const tools = await AiTool.find().sort({ createdAt: -1 });
      res.status(200).json(tools);
    } catch (error) {
      res.status(500).json({ success: false, error });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
