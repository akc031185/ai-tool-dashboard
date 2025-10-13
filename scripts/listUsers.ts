import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User';
import dbConnect from '../src/lib/dbConnect';

config({ path: resolve(__dirname, '../.env.local') });

async function listUsers() {
  try {
    await dbConnect();

    const users = await User.find({}).select('email name role createdAt');

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

listUsers();
