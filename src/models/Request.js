import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
}, { timestamps: true });

export default mongoose.models.Request || mongoose.model('Request', RequestSchema);
