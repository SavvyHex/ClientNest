import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: String,
  dueDate: Date,
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  freelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  milestones: [milestoneSchema],
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);