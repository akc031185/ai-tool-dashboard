import { Resend } from 'resend';
import { APP_SHORT } from './appMeta';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Welcome to ${APP_SHORT}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Welcome to ${APP_SHORT}!</h1>
          <p>Hi ${name},</p>
          <p>Thank you for joining ${APP_SHORT}. We're excited to have you on board!</p>
          <p>To get started:</p>
          <ul>
            <li>Complete your profile</li>
            <li>Submit your first AI/Automation problem</li>
            <li>Track your project progress</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p style="margin-top: 30px;">
            <a href="${APP_URL}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The ${APP_SHORT} Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Reset Your Password - ${APP_SHORT}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your ${APP_SHORT} account.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <p style="margin-top: 30px;">
            <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #7c3aed;">${resetUrl}</a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The ${APP_SHORT} Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Password Changed - ${APP_SHORT}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Password Changed Successfully</h1>
          <p>Hi ${name},</p>
          <p>Your password for ${APP_SHORT} has been changed successfully.</p>
          <p>If you didn't make this change, please contact our support team immediately.</p>
          <p style="margin-top: 30px;">
            <a href="${APP_URL}/login" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Sign In</a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Best regards,<br>
            The ${APP_SHORT} Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending password changed email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return { success: false, error };
  }
}
