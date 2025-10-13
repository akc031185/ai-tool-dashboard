import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '@/src/lib/authz';
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
    // Require authentication (problem owner or admin can answer)
    const user = await requireAuth(req, res);

    await dbConnect();

    const { id, rfiId } = req.query;
    const { answer } = req.body;

    // Validate problem ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    // Validate RFI ID
    if (!rfiId || typeof rfiId !== 'string' || !mongoose.Types.ObjectId.isValid(rfiId)) {
      return res.status(400).json({ message: 'Invalid RFI ID' });
    }

    // Validate answer
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    // Find problem
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user is problem owner or admin
    const isOwner = problem.userId.toString() === user.id;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Only the problem owner or admin can answer RFIs'
      });
    }

    // Find RFI
    const rfi = problem.rfis?.find((r: any) => r._id.toString() === rfiId);

    if (!rfi) {
      return res.status(404).json({ message: 'RFI not found' });
    }

    // Check if RFI is already closed
    if (rfi.status === 'closed') {
      return res.status(400).json({ message: 'Cannot answer a closed RFI' });
    }

    // Update RFI
    rfi.answer = answer.trim();
    rfi.answeredAt = new Date();
    rfi.status = 'answered';

    // Add activity log entry
    if (!problem.activity) {
      problem.activity = [];
    }

    problem.activity.push({
      _id: new mongoose.Types.ObjectId(),
      at: new Date(),
      by: new mongoose.Types.ObjectId(user.id),
      type: 'rfi.answer',
      note: 'RFI answered',
      meta: { rfiId: rfi._id.toString(), answer: answer.trim() }
    });

    await problem.save();

    return res.status(200).json({
      success: true,
      rfi: {
        _id: rfi._id,
        question: rfi.question,
        answer: rfi.answer,
        status: rfi.status,
        answeredAt: rfi.answeredAt
      }
    });
  } catch (error) {
    // Error already sent by requireAuth
    if (res.headersSent) {
      return;
    }

    console.error('Answer RFI error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to answer RFI',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
