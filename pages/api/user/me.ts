import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add X-Robots-Tag header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  try {
    if (req.method === 'GET') {
      // Get current user
      const user = await User.findById((session.user as any).id).select(
        'name email username timezone createdAt updatedAt'
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          username: user.username,
          timezone: user.timezone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } else if (req.method === 'PATCH') {
      // Update user profile
      const { name, username, timezone } = req.body;

      const user = await User.findById((session.user as any).id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check username uniqueness if provided
      if (username && username !== user.username) {
        const existingUser = await User.findOne({
          username: { $regex: new RegExp(`^${username}$`, 'i') },
          _id: { $ne: user._id }
        });

        if (existingUser) {
          return res.status(400).json({ message: 'Username already taken' });
        }

        user.username = username;
      }

      // Update fields
      if (name !== undefined) user.name = name;
      if (timezone !== undefined) user.timezone = timezone;

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          name: user.name,
          email: user.email,
          username: user.username,
          timezone: user.timezone
        }
      });
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('User me API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
