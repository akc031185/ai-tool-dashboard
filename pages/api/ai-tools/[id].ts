import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import AiTool from '@/models/AiTool';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid tool ID' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const tool = await AiTool.findById(id);
      if (!tool) {
        return res.status(404).json({ success: false, error: 'Tool not found' });
      }
      res.status(200).json({ success: true, tool });
    } catch (error) {
      console.error('Database fetch error:', error);
      res.status(500).json({ success: false, error: 'Could not fetch tool' });
    }
  } else if (req.method === 'DELETE') {
    // For now, allow deletion without auth check
    // TODO: Add proper authentication check

    try {
      const deletedTool = await AiTool.findByIdAndDelete(id);
      if (!deletedTool) {
        return res.status(404).json({ success: false, error: 'Tool not found' });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Tool deleted successfully',
        tool: deletedTool 
      });
    } catch (error) {
      console.error('Database delete error:', error);
      res.status(500).json({ success: false, error: 'Could not delete tool' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}