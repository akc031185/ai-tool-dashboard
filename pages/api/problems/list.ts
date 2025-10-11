import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    const problems = await Problem.find({ userId: (session.user as any).id })
      .select('_id rawDescription status triage followUps solutionOutline updatedAt')
      .sort({ updatedAt: -1 })
      .lean();

    res.status(200).json({ success: true, problems });
  } catch (error) {
    console.error('Problems list error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch problems' });
  }
}
