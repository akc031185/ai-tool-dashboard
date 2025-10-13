import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add X-Robots-Tag header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Require admin authentication
    const admin = await requireAdmin(req, res);

    await dbConnect();

    const { id } = req.query;
    const { adminLocked } = req.body;

    // Validate ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    // Validate adminLocked
    if (typeof adminLocked !== 'boolean') {
      return res.status(400).json({
        message: 'Invalid adminLocked value. Must be a boolean.'
      });
    }

    // Find problem
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const oldLockState = problem.adminLocked || false;

    // Update lock state
    problem.adminLocked = adminLocked;

    // Add activity log entry
    if (!problem.activity) {
      problem.activity = [];
    }

    problem.activity.push({
      _id: new mongoose.Types.ObjectId(),
      at: new Date(),
      by: new mongoose.Types.ObjectId(admin.id),
      type: 'lock',
      note: adminLocked ? 'Problem locked by admin' : 'Problem unlocked by admin',
      meta: { adminLocked, previousState: oldLockState }
    });

    await problem.save();

    return res.status(200).json({
      success: true,
      problem: {
        _id: problem._id,
        adminLocked: problem.adminLocked,
        updatedAt: problem.updatedAt
      }
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Update lock error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update problem lock state',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
