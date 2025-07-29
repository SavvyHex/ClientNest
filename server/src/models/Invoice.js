import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  issuedAt: { type: Date, default: Date.now },
  paidAt: Date,
  items: [{ description: String, amount: Number }],
});

export default mongoose.model('Invoice', invoiceSchema);