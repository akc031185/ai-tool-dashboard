import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import User from '@/src/models/User';
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
    const { assigneeId } = req.body;

    // Validate ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    // Validate assigneeId if provided
    if (assigneeId !== null && assigneeId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
        return res.status(400).json({ message: 'Invalid assignee ID' });
      }

      // Check if user exists
      const assignee = await User.findById(assigneeId);
      if (!assignee) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }

    // Find problem
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const oldAssigneeId = problem.assigneeId;

    // Update assignee
    problem.assigneeId = assigneeId ? new mongoose.Types.ObjectId(assigneeId) : undefined;

    // Add activity log entry
    if (!problem.activity) {
      problem.activity = [];
    }

    let note = '';
    if (!assigneeId && oldAssigneeId) {
      note = 'Problem unassigned';
    } else if (assigneeId && !oldAssigneeId) {
      note = 'Problem assigned';
    } else if (assigneeId && oldAssigneeId) {
      note = 'Assignee changed';
    }

    problem.activity.push({
      _id: new mongoose.Types.ObjectId(),
      at: new Date(),
      by: new mongoose.Types.ObjectId(admin.id),
      type: 'assign',
      note,
      meta: {
        oldAssigneeId: oldAssigneeId?.toString(),
        newAssigneeId: assigneeId
      }
    });

    await problem.save();

    return res.status(200).json({
      success: true,
      problem: {
        _id: problem._id,
        assigneeId: problem.assigneeId,
        updatedAt: problem.updatedAt
      }
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Update assignee error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update problem assignee',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
