import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import dbConnect from '../src/lib/dbConnect';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function createAdmin() {
  try {
    await dbConnect();

    const email = 'akc031185@gmail.com';
    const name = 'Abhishek Choudhary';
    const password = 'Admin@123'; // Temporary password - you should change this after first login

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      console.log('Current role:', existingUser.role);

      // Update to admin if not already
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('Updated user role to admin');
      }

      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new admin user
    const adminUser = new User({
      email,
      name,
      passwordHash,
      role: 'admin',
      mustChangePassword: true, // Force password change on first login
      workspace: {
        isActive: false
      },
      loginCount: 0,
      lastLogin: new Date()
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Name:', name);
    console.log('Temporary Password:', password);
    console.log('Role:', 'admin');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\nNote: Add this email to ADMIN_EMAILS in your .env.local:');
    console.log(`ADMIN_EMAILS=${email}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin();
