import mongoose from 'mongoose';

export interface IEvent extends mongoose.Document {
  at: Date;
  userId?: mongoose.Types.ObjectId;
  problemId?: mongoose.Types.ObjectId;
  type: string;
  meta?: Record<string, any>;
}

const eventSchema = new mongoose.Schema<IEvent>({
  at: {
    type: Date,
    default: Date.now,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: false
});

// Compound indexes for common queries
eventSchema.index({ at: -1 });
eventSchema.index({ type: 1, at: -1 });
eventSchema.index({ userId: 1, at: -1 });
eventSchema.index({ problemId: 1, at: -1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
