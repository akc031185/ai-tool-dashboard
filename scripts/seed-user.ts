// Dev-only script to seed a demo user
// Run with: npx ts-node scripts/seed-user.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akc031185:rZMyYd4r0svVIBVk@ai-tool-dashboard-clust.rgwyxrh.mongodb.net/investoraiclub?retryWrites=true&w=majority&appName=AI-Tool-Dashboard-Cluster';

// User schema (simplified version)
const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  passwordHash: String,
  name: String,
  role: { type: String, default: 'user' },
  loginCount: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedDemoUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user already exists
    const existingUser = await User.findOne({ username: 'demo' });

    if (existingUser) {
      console.log('⚠️  Demo user already exists');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash('Demo123!', 10);

    // Create demo user
    const demoUser = new User({
      username: 'demo',
      email: 'demo@example.com',
      passwordHash,
      name: 'Demo User',
      role: 'user',
    });

    await demoUser.save();

    console.log('✅ Demo user created successfully!');
    console.log('   Username: demo');
    console.log('   Email: demo@example.com');
    console.log('   Password: Demo123!');

    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding demo user:', error);
    process.exit(1);
  }
}

seedDemoUser();
