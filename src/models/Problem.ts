import mongoose from 'mongoose';

export interface IProblem extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  rawDescription: string;
  status: 'draft' | 'in-progress' | 'complete';
  assigneeId?: mongoose.Types.ObjectId;
  adminLocked?: boolean;
  triage?: {
    kind: string[];
    kind_scores: { AI: number; Automation: number; Hybrid: number };
    domains: Array<{ label: string; score: number }>;
    subdomains: Array<{ label: string; score: number }>;
    other_tags: string[];
    needs_more_info: boolean;
    missing_info: string[];
    risk_flags: string[];
    notes: string;
  };
  followUps?: Array<{
    id: string;
    question: string;
    answer?: string;
    required?: boolean;
  }>;
  solutionOutline?: string;
  rfis?: Array<{
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
    question: string;
    answer?: string;
    answeredAt?: Date;
    dueAt?: Date;
    priority?: 'low' | 'normal' | 'high';
    status: 'open' | 'answered' | 'closed';
  }>;
  activity?: Array<{
    _id: mongoose.Types.ObjectId;
    at: Date;
    by: mongoose.Types.ObjectId;
    type: string;
    note?: string;
    meta?: Record<string, any>;
  }>;
  audits?: Array<{
    at: Date;
    byUserId: mongoose.Types.ObjectId;
    action: string;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new mongoose.Schema<IProblem>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rawDescription: {
    type: String,
    required: [true, 'Problem description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'complete'],
    default: 'draft'
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  adminLocked: {
    type: Boolean,
    default: false
  },
  triage: {
    kind: [String],
    kind_scores: {
      AI: Number,
      Automation: Number,
      Hybrid: Number
    },
    domains: [{
      label: String,
      score: Number
    }],
    subdomains: [{
      label: String,
      score: Number
    }],
    other_tags: [String],
    needs_more_info: Boolean,
    missing_info: [String],
    risk_flags: [String],
    notes: String
  },
  followUps: [{
    id: String,
    question: String,
    answer: String,
    required: Boolean
  }],
  solutionOutline: String,
  rfis: [{
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: String,
    answeredAt: Date,
    dueAt: Date,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open'
    }
  }],
  activity: [{
    at: {
      type: Date,
      default: Date.now
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      required: true
    },
    note: String,
    meta: mongoose.Schema.Types.Mixed
  }],
  audits: [{
    at: {
      type: Date,
      default: Date.now
    },
    byUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    details: String
  }]
}, {
  timestamps: true
});

// Index for efficient user queries
problemSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', problemSchema);
