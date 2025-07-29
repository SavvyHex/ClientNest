import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: String,
  url: String,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // optional
  uploadedAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['page', 'invoice', 'other'], default: 'other' },
});

export default mongoose.model('File', fileSchema);