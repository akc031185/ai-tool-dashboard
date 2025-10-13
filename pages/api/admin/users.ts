import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '@/src/lib/authz';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add X-Robots-Tag header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Require admin authentication
    await requireAdmin(req, res);

    await dbConnect();

    // Fetch all users with basic info (no passwords)
    const users = await User.find({})
      .select('_id email name role createdAt')
      .sort({ email: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    // Error already sent by requireAdmin
    if (res.headersSent) {
      return;
    }

    console.error('Fetch users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
