import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { logEvent } from '@/src/lib/logEvent';
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

    const { id } = req.query;
    const { question, dueAt, priority } = req.body;

    // Validate problem ID
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid problem ID' });
    }

    // Validate question
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Validate priority if provided
    const validPriorities = ['low', 'normal', 'high'];
    const rfiPriority = priority || 'normal';
    if (!validPriorities.includes(rfiPriority)) {
      return res.status(400).json({
        message: 'Invalid priority. Must be one of: low, normal, high'
      });
    }

    // Validate dueAt if provided
    let dueDateObj;
    if (dueAt) {
      dueDateObj = new Date(dueAt);
      if (isNaN(dueDateObj.getTime())) {
        return res.status(400).json({ message: 'Invalid due date format' });
      }
    }

    // Find problem
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Initialize rfis array if not exists
    if (!problem.rfis) {
      problem.rfis = [];
    }

    // Create new RFI
    const newRfi = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      createdBy: new mongoose.Types.ObjectId(admin.id),
      question: question.trim(),
      priority: rfiPriority,
      status: 'open' as const,
      ...(dueDateObj && { dueAt: dueDateObj })
    };

    problem.rfis.push(newRfi);

    // Add activity log entry
    if (!problem.activity) {
      problem.activity = [];
    }

    problem.activity.push({
      _id: new mongoose.Types.ObjectId(),
      at: new Date(),
      by: new mongoose.Types.ObjectId(admin.id),
      type: 'rfi.create',
      note: 'RFI created',
      meta: { rfiId: newRfi._id.toString(), question: question.trim(), priority: rfiPriority }
    });

    await problem.save();

    // Log rfi.create event
    await logEvent({
      type: 'rfi.create',
      userId: admin.id,
      problemId: problem._id.toString(),
      meta: { rfiId: newRfi._id.toString(), priority: rfiPriority, hasDueDate: !!dueDateObj }
    });

    return res.status(201).json({
      success: true,
      rfi: {
        _id: newRfi._id,
        question: newRfi.question,
        priority: newRfi.priority,
        status: newRfi.status,
        createdAt: newRfi.createdAt,
        ...(dueDateObj && { dueAt: dueDateObj })
      }
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Create RFI error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create RFI',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
