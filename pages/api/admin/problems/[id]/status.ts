import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { logEvent } from '@/src/lib/logEvent';
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
    const { status } = req.body;

    // Validate ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    // Validate status
    const validStatuses = ['draft', 'in-progress', 'complete'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid status. Must be one of: draft, in-progress, complete'
      });
    }

    // Find problem
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const oldStatus = problem.status;

    // Update status
    problem.status = status;

    // Add activity log entry
    if (!problem.activity) {
      problem.activity = [];
    }

    problem.activity.push({
      _id: new mongoose.Types.ObjectId(),
      at: new Date(),
      by: new mongoose.Types.ObjectId(admin.id),
      type: 'status.change',
      note: `Status changed from "${oldStatus}" to "${status}"`,
      meta: { oldStatus, newStatus: status }
    });

    await problem.save();

    // Log status.change event
    await logEvent({
      type: 'status.change',
      userId: admin.id,
      problemId: problem._id.toString(),
      meta: { oldStatus, newStatus: status }
    });

    return res.status(200).json({
      success: true,
      problem: {
        _id: problem._id,
        status: problem.status,
        updatedAt: problem.updatedAt
      }
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Update status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update problem status',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
