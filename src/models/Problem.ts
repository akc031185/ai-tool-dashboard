import mongoose from 'mongoose';

export interface IProblem extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  rawDescription: string;
  status: 'draft' | 'in-progress' | 'complete';
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
  solutionOutline: String
}, {
  timestamps: true
});

// Index for efficient user queries
problemSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', problemSchema);
