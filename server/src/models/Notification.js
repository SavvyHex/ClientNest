import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { type: String, default: 'info' }, // e.g. 'admin-request'
  message: String,
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

export default mongoose.model('Notification', notificationSchema);