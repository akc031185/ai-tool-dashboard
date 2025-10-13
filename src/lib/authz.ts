import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import dbConnect from './dbConnect';
import User from '../models/User';

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];

export interface SessionUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

/**
 * Get the current session user from NextAuth
 * Returns null if not authenticated
 */
export async function getSessionUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionUser | null> {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;

  return {
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    name: user.name
  };
}

/**
 * Require that the user is authenticated as an admin
 * Throws 401 if not authenticated, 403 if not admin
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionUser> {
  const sessionUser = await getSessionUser(req, res);

  if (!sessionUser) {
    res.status(401).json({ message: 'Authentication required' });
    throw new Error('Unauthorized');
  }

  // Check if user is admin by role or email
  const isAdminByRole = sessionUser.role === 'admin';
  const isAdminByEmail = ADMIN_EMAILS.includes(sessionUser.email);

  if (!isAdminByRole && !isAdminByEmail) {
    res.status(403).json({ message: 'Admin access required' });
    throw new Error('Forbidden');
  }

  return sessionUser;
}

/**
 * Require that the user is authenticated
 * Throws 401 if not authenticated
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<SessionUser> {
  const sessionUser = await getSessionUser(req, res);

  if (!sessionUser) {
    res.status(401).json({ message: 'Authentication required' });
    throw new Error('Unauthorized');
  }

  return sessionUser;
}

/**
 * Check if a user is an admin (without throwing errors)
 */
export async function isAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<boolean> {
  try {
    await requireAdmin(req, res);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user from database by ID
 */
export async function getUserById(userId: string) {
  await dbConnect();
  return await User.findById(userId).select('-passwordHash');
}
