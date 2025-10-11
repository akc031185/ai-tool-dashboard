import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { isAdmin } from '@/src/lib/adminAuth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Check admin access
  if (!isAdmin(session)) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid problem ID' });
  }

  await dbConnect();

  try {
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const { status, action } = req.body;

    if (!status && !action) {
      return res.status(400).json({ message: 'Status or action is required' });
    }

    const oldStatus = problem.status;

    // Handle special actions
    if (action === 'lock') {
      // Lock: set to in-progress if ready
      if (!problem.triage) {
        return res.status(400).json({ message: 'Cannot lock: Problem not triaged' });
      }

      const requiredQuestions = problem.followUps?.filter((f: any) => f.required) || [];
      const answeredRequired = requiredQuestions.filter((f: any) => f.answer && f.answer.trim().length > 0);

      if (answeredRequired.length < requiredQuestions.length) {
        return res.status(400).json({
          message: 'Cannot lock: Not all required questions answered',
          answered: answeredRequired.length,
          total: requiredQuestions.length
        });
      }

      problem.status = 'in-progress';

      // Add audit log
      if (!problem.audits) {
        problem.audits = [];
      }

      problem.audits.push({
        at: new Date(),
        byUserId: new mongoose.Types.ObjectId((session.user as any).id),
        action: 'admin_lock',
        details: `Locked problem (${oldStatus} → in-progress)`
      });

    } else if (action === 'finalize') {
      // Finalize: set to complete
      problem.status = 'complete';

      // Add audit log
      if (!problem.audits) {
        problem.audits = [];
      }

      problem.audits.push({
        at: new Date(),
        byUserId: new mongoose.Types.ObjectId((session.user as any).id),
        action: 'admin_finalize',
        details: `Finalized problem (${oldStatus} → complete)`
      });

    } else if (status) {
      // Direct status update
      if (!['draft', 'in-progress', 'complete'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }

      problem.status = status;

      // Add audit log
      if (!problem.audits) {
        problem.audits = [];
      }

      problem.audits.push({
        at: new Date(),
        byUserId: new mongoose.Types.ObjectId((session.user as any).id),
        action: 'admin_status_change',
        details: `Changed status: ${oldStatus} → ${status}`
      });
    }

    await problem.save();

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      oldStatus,
      newStatus: problem.status
    });
  } catch (error) {
    console.error('Admin status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update status',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
