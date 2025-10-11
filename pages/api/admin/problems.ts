import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import Problem from '@/src/models/Problem';
import User from '@/src/models/User';
import { isAdmin } from '@/src/lib/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

  await dbConnect();

  try {
    // Parse query filters
    const {
      kind,
      domain,
      status,
      hasOutline,
      dateFrom,
      dateTo,
      limit = '50',
      skip = '0'
    } = req.query;

    // Build query
    const query: any = {};

    if (kind && kind !== 'all') {
      query['triage.kind'] = kind;
    }

    if (domain && domain !== 'all') {
      query['triage.domains.label'] = domain;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (hasOutline === 'yes') {
      query.solutionOutline = { $exists: true, $ne: null };
    } else if (hasOutline === 'no') {
      query.solutionOutline = { $exists: false };
    }

    if (dateFrom) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$gte = new Date(dateFrom as string);
    }

    if (dateTo) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = new Date(dateTo as string);
    }

    // Fetch problems with user data
    const problems = await Problem.find(query)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(skip as string))
      .lean();

    const total = await Problem.countDocuments(query);

    // Get unique domains for filter options
    const allProblems = await Problem.find({ 'triage.domains': { $exists: true } })
      .select('triage.domains')
      .lean();

    const domainsSet = new Set<string>();
    allProblems.forEach((p: any) => {
      p.triage?.domains?.forEach((d: any) => {
        if (d.label) domainsSet.add(d.label);
      });
    });

    const domains = Array.from(domainsSet).sort();

    res.status(200).json({
      success: true,
      problems,
      total,
      domains,
      pagination: {
        limit: parseInt(limit as string),
        skip: parseInt(skip as string),
        hasMore: parseInt(skip as string) + problems.length < total
      }
    });
  } catch (error) {
    console.error('Admin problems list error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch problems',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
