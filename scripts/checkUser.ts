import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';
import dbConnect from '../src/lib/dbConnect';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function checkUser() {
  try {
    await dbConnect();

    const email = 'akc031185@gmail.com';
    
    const user = await User.findOne({ email });

    if (user) {
      console.log('✅ User found in database:');
      console.log('');
      console.log('ID:', user._id.toString());
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Username:', user.username || '(not set)');
      console.log('Role:', user.role);
      console.log('Timezone:', user.timezone || '(not set)');
      console.log('Session Version:', user.sessionVersion);
      console.log('Login Count:', user.loginCount);
      console.log('Last Login:', user.lastLogin);
      console.log('Created At:', user.createdAt);
      console.log('');
    } else {
      console.log('❌ User not found in database');
      console.log('Email searched:', email);
    }

  } catch (error) {
    console.error('Error checking user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkUser();
