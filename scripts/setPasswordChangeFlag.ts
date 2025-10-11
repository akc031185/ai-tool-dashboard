import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';
import dbConnect from '../src/lib/dbConnect';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function setPasswordChangeFlag() {
  try {
    await dbConnect();

    const email = 'akc031185@gmail.com';
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      return;
    }

    console.log('Found user:', user.email);
    console.log('Current mustChangePassword:', user.mustChangePassword);

    user.mustChangePassword = true;
    await user.save();

    console.log('');
    console.log('✅ Updated user successfully!');
    console.log('mustChangePassword is now:', user.mustChangePassword);
    console.log('');
    console.log('The user will be forced to change password on next login.');

  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

setPasswordChangeFlag();
