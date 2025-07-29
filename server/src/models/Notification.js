import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ['info', 'alert', 'message'], default: 'info' },
});

export default mongoose.model('Notification', notificationSchema);