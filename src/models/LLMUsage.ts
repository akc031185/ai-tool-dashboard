import mongoose from 'mongoose';

export interface ILLMUsage {
  at: Date;
  userId?: mongoose.Types.ObjectId;
  problemId?: mongoose.Types.ObjectId;
  route: string;
  model: string;
  ms: number;
  tokensIn?: number;
  tokensOut?: number;
}

const llmUsageSchema = new mongoose.Schema<ILLMUsage>({
  at: {
    type: Date,
    default: Date.now,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  },
  route: {
    type: String,
    required: true,
    index: true
  },
  model: {
    type: String,
    required: true,
    index: true
  },
  ms: {
    type: Number,
    required: true
  },
  tokensIn: {
    type: Number
  },
  tokensOut: {
    type: Number
  }
}, {
  timestamps: false
});

// Compound indexes for common queries
llmUsageSchema.index({ at: -1 });
llmUsageSchema.index({ route: 1, at: -1 });
llmUsageSchema.index({ model: 1, at: -1 });
llmUsageSchema.index({ userId: 1, at: -1 });

export default mongoose.models.LLMUsage || mongoose.model<ILLMUsage>('LLMUsage', llmUsageSchema);
