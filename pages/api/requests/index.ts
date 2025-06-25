// pages/api/requests/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Request from '@/models/Request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const requests = await Request.find();
      res.status(200).json({ success: true, requests });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch requests' });
    }
  } else if (req.method === 'POST') {
    const { name, problemDescription, expectedOutput, businessImpact, category, summary, priority, status } = req.body;

    try {
      const newRequest = new Request({
        name,
        problemDescription,
        expectedOutput,
        businessImpact,
        category,
        summary,
        priority,
        status,
      });

      await newRequest.save();
      res.status(201).json({ success: true, request: newRequest });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to create request' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
