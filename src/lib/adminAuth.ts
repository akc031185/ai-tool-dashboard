import { Session } from 'next-auth';

/**
 * Check if a user is an admin based on their email
 */
export function isAdmin(session: Session | null): boolean {
  if (!session?.user?.email) {
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS || '';
  const adminList = adminEmails.split(',').map(e => e.trim()).filter(Boolean);

  return adminList.includes(session.user.email);
}

/**
 * Get admin emails from environment
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || '';
  return adminEmails.split(',').map(e => e.trim()).filter(Boolean);
}
