import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables first
config({ path: resolve(__dirname, '../.env.local') });

// Verify API key is loaded
if (!process.env.RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in environment variables');
  console.error('Make sure .env.local has RESEND_API_KEY set');
  process.exit(1);
}

console.log('✓ RESEND_API_KEY loaded:', process.env.RESEND_API_KEY.substring(0, 10) + '...');

async function testEmails() {
  // Import Resend dynamically after env is loaded
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  console.log('\n🧪 Testing Email Configuration...\n');

  const testEmail = 'akc031185@gmail.com';
  const testName = 'Abhishek Choudhary';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@investoraiclub.com';
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  const appShort = 'InvestorAIClub';

  try {
    // Test 1: Welcome Email
    console.log('📧 Test 1: Sending Welcome Email...');
    const welcomeResult = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: `Welcome to ${appShort}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Welcome to ${appShort}!</h1>
          <p>Hi ${testName},</p>
          <p>Thank you for joining ${appShort}. We're excited to have you on board!</p>
          <p>This is a test email to verify the email configuration.</p>
        </div>
      `,
    });

    if (welcomeResult.data) {
      console.log('✅ Welcome email sent successfully!');
      console.log('   Email ID:', welcomeResult.data.id);
    } else {
      console.log('❌ Welcome email failed:', welcomeResult.error);
    }

    console.log('\n---\n');

    // Test 2: Password Reset Email
    console.log('📧 Test 2: Sending Password Reset Email...');
    const testToken = 'test-token-12345';
    const resetUrl = `${appUrl}/reset-password?token=${testToken}`;

    const resetResult = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: `Reset Your Password - ${appShort}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Reset Your Password</h1>
          <p>Hi ${testName},</p>
          <p>This is a test password reset email.</p>
          <p style="margin-top: 30px;">
            <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
          </p>
        </div>
      `,
    });

    if (resetResult.data) {
      console.log('✅ Password reset email sent successfully!');
      console.log('   Email ID:', resetResult.data.id);
    } else {
      console.log('❌ Password reset email failed:', resetResult.error);
    }

    console.log('\n---\n');

    // Test 3: Password Changed Email
    console.log('📧 Test 3: Sending Password Changed Email...');
    const changedResult = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: `Password Changed - ${appShort}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7c3aed;">Password Changed Successfully</h1>
          <p>Hi ${testName},</p>
          <p>This is a test email confirming your password was changed.</p>
        </div>
      `,
    });

    if (changedResult.data) {
      console.log('✅ Password changed email sent successfully!');
      console.log('   Email ID:', changedResult.data.id);
    } else {
      console.log('❌ Password changed email failed:', changedResult.error);
    }

    console.log('\n✅ All email tests completed!');
    console.log(`📬 Check ${testEmail} for the test emails.`);

  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmails();
