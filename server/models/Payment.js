import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ['1_month', '3_months', '1_year'],
  },
  paymentMethod: {
    type: String,
    default: 'UPI',
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  subscriptionStartDate: {
    type: Date,
    required: true,
  },
  subscriptionEndDate: {
    type: Date,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: 'verified',
    enum: ['pending', 'verified', 'rejected'],
  },
  notes: {
    type: String,
    default: '',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Payment', paymentSchema);
