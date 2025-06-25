import mongoose from 'mongoose';

const AiToolSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    toolName: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.AiTool || mongoose.model('AiTool', AiToolSchema);
