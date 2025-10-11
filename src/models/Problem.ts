import mongoose from 'mongoose';

export interface IProblem extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  rawDescription: string;
  status: 'draft' | 'in-progress' | 'complete';
  triage?: {
    kind: 'AI' | 'Automation' | 'Hybrid';
    domains: string[];
  };
  followUps?: Array<{
    question: string;
    answer?: string;
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
    kind: {
      type: String,
      enum: ['AI', 'Automation', 'Hybrid']
    },
    domains: [String]
  },
  followUps: [{
    question: String,
    answer: String
  }],
  solutionOutline: String
}, {
  timestamps: true
});

// Index for efficient user queries
problemSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.Problem || mongoose.model<IProblem>('Problem', problemSchema);
