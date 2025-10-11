import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  workspace: {
    n8nWorkflowId?: string;
    n8nWorkflowUrl?: string;
    aiAgentId?: string;
    aiAgentName?: string;
    isActive: boolean;
  };
  loginCount: number;
  lastLogin: Date;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  workspace: {
    n8nWorkflowId: String,
    n8nWorkflowUrl: String,
    aiAgentId: String,
    aiAgentName: String,
    isActive: {
      type: Boolean,
      default: false
    }
  },
  loginCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);