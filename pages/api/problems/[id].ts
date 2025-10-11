import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set X-Robots-Tag for all responses
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'GET' && req.method !== 'PATCH' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid problem ID' });
  }

  await dbConnect();

  try {
    // Find problem and check ownership
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (problem.userId.toString() !== (session.user as any).id) {
      return res.status(403).json({ message: 'Forbidden: Not your problem' });
    }

    // Handle GET request - return problem details
    if (req.method === 'GET') {
      const problemData = await Problem.findById(id)
        .select('_id rawDescription status triage followUps solutionOutline createdAt updatedAt')
        .lean();

      return res.status(200).json({ success: true, problem: problemData });
    }

    // Handle PATCH request - update problem
    if (req.method === 'PATCH') {
      const { status } = req.body;

      if (status && !['draft', 'in-progress', 'complete'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      if (status) {
        problem.status = status;
      }

      await problem.save();

      // Return updated fields
      const updated = await Problem.findById(id)
        .select('_id rawDescription status triage followUps solutionOutline updatedAt')
        .lean();

      return res.status(200).json({ success: true, problem: updated });
    }

    // Handle DELETE request - delete problem
    if (req.method === 'DELETE') {
      await Problem.findByIdAndDelete(id);
      return res.status(200).json({ ok: true, message: 'Problem deleted successfully' });
    }
  } catch (error) {
    console.error('Problem operation error:', error);
    res.status(500).json({ success: false, error: 'Failed to process problem request' });
  }
}
