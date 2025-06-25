import mongoose from 'mongoose';

const AiToolSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  progress: {
    type: String,
    default: 'Draft',  // <--- NEW Progress field
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AiTool || mongoose.model('AiTool', AiToolSchema);
