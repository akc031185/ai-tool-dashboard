import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add X-Robots-Tag header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Require admin authentication
    const admin = await requireAdmin(req, res);

    await dbConnect();

    const { id, rfiId } = req.query;

    // Validate problem ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    // Validate RFI ID
    if (!rfiId || typeof rfiId !== 'string' || !mongoose.Types.ObjectId.isValid(rfiId)) {
      return res.status(400).json({ message: 'Invalid RFI ID' });
    }

    // Find problem
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Find RFI
    const rfi = problem.rfis?.find((r: any) => r._id.toString() === rfiId);

    if (!rfi) {
      return res.status(404).json({ message: 'RFI not found' });
    }

    // Check if RFI is already closed
    if (rfi.status === 'closed') {
      return res.status(400).json({ message: 'RFI is already closed' });
    }

    const previousStatus = rfi.status;

    // Update RFI status to closed
    rfi.status = 'closed';

    // Add activity log entry
    if (!problem.activity) {
      problem.activity = [];
    }

    problem.activity.push({
      _id: new mongoose.Types.ObjectId(),
      at: new Date(),
      by: new mongoose.Types.ObjectId(admin.id),
      type: 'rfi.close',
      note: 'RFI closed',
      meta: { rfiId: rfi._id.toString(), previousStatus }
    });

    await problem.save();

    return res.status(200).json({
      success: true,
      rfi: {
        _id: rfi._id,
        question: rfi.question,
        status: rfi.status,
        answer: rfi.answer,
        answeredAt: rfi.answeredAt
      }
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Close RFI error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to close RFI',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
