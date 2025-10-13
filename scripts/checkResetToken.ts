import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';
import dbConnect from '../src/lib/dbConnect';

config({ path: resolve(__dirname, '../.env.local') });

async function checkResetToken() {
  try {
    await dbConnect();

    const email = 'akc031185@gmail.com';
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', user.email);
    console.log('Name:', user.name);
    console.log('Reset Token:', user.resetToken || '(not set)');
    console.log('Reset Token Expiry:', user.resetTokenExpiry || '(not set)');

    if (user.resetTokenExpiry) {
      const now = new Date();
      const isExpired = user.resetTokenExpiry < now;
      console.log('Token Expired:', isExpired ? 'YES ❌' : 'NO ✅');
      console.log('Current Time:', now.toISOString());
      console.log('Expiry Time:', user.resetTokenExpiry.toISOString());
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkResetToken();
