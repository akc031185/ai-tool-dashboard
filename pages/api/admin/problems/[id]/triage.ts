import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import { isAdmin } from '@/src/lib/adminAuth';
import mongoose from 'mongoose';
import { TriageSchema } from '@/src/lib/schemas';
import { ZodError } from 'zod';

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

    const { triage } = req.body;

    if (!triage) {
      return res.status(400).json({ message: 'Triage data is required' });
    }

    // Validate triage data
    let validatedTriage;
    try {
      validatedTriage = TriageSchema.parse(triage);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid triage data',
          errors: error.errors
        });
      }
      throw error;
    }

    // Update triage
    problem.triage = validatedTriage;

    // Add audit log
    if (!problem.audits) {
      problem.audits = [];
    }

    problem.audits.push({
      at: new Date(),
      byUserId: new mongoose.Types.ObjectId((session.user as any).id),
      action: 'admin_triage_edit',
      details: `Updated triage: kind=${validatedTriage.kind.join(',')}, domains=${validatedTriage.domains.map(d => d.label).join(',')}`
    });

    await problem.save();

    res.status(200).json({
      success: true,
      message: 'Triage updated successfully',
      triage: problem.triage
    });
  } catch (error) {
    console.error('Admin triage edit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update triage',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
