import mongoose from 'mongoose';

export interface IDailyAnalytics extends mongoose.Document {
  date: Date;
  events: {
    type: string;
    count: number;
  }[];
  llmUsage: {
    route: string;
    model: string;
    totalCalls: number;
    totalTokensIn: number;
    totalTokensOut: number;
    totalMs: number;
    avgMs: number;
  }[];
  problems: {
    created: number;
    submitted: number;
    inProgress: number;
    completed: number;
  };
  topDomains: {
    domain: string;
    count: number;
  }[];
}

const dailyAnalyticsSchema = new mongoose.Schema<IDailyAnalytics>({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  events: [{
    type: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  }],
  llmUsage: [{
    route: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    totalCalls: {
      type: Number,
      required: true
    },
    totalTokensIn: {
      type: Number,
      required: true
    },
    totalTokensOut: {
      type: Number,
      required: true
    },
    totalMs: {
      type: Number,
      required: true
    },
    avgMs: {
      type: Number,
      required: true
    }
  }],
  problems: {
    created: {
      type: Number,
      default: 0
    },
    submitted: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    }
  },
  topDomains: [{
    domain: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for efficient date queries
dailyAnalyticsSchema.index({ date: -1 });

export default mongoose.models.DailyAnalytics || mongoose.model<IDailyAnalytics>('DailyAnalytics', dailyAnalyticsSchema);
