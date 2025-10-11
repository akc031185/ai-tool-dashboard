// Quick script to check if demo user exists
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://akc031185:rZMyYd4r0svVIBVk@ai-tool-dashboard-clust.rgwyxrh.mongodb.net/investoraiclub?retryWrites=true&w=majority&appName=AI-Tool-Dashboard-Cluster';

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  passwordHash: String,
  name: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const demoUser = await User.findOne({ username: 'demo' });

    if (demoUser) {
      console.log('✅ Demo user found:');
      console.log('   ID:', demoUser._id);
      console.log('   Username:', demoUser.username);
      console.log('   Email:', demoUser.email);
      console.log('   Name:', demoUser.name);
      console.log('   Has passwordHash:', !!demoUser.passwordHash);
    } else {
      console.log('❌ Demo user NOT found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
