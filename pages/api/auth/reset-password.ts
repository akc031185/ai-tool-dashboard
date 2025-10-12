import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/src/lib/dbConnect';
import User from '@/src/models/User';
import bcrypt from 'bcryptjs';
import { sendPasswordChangedEmail } from '@/src/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add X-Robots-Tag header
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if password has at least 1 letter and 1 number
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        message: 'Password must contain at least 1 letter and 1 number'
      });
    }

    // Find user by reset token
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update user
    user.passwordHash = newPasswordHash;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.mustChangePassword = false;
    user.sessionVersion = (user.sessionVersion || 0) + 1; // Invalidate all sessions

    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Error sending password changed email:', emailError);
      // Continue even if email fails - password was changed successfully
    }

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
