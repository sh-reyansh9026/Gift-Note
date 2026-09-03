import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ['1_month', '3_months', '1_year'],
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual field for status (computed, not stored)
subscriptionSchema.virtual('status').get(function() {
  const now = new Date();
  return this.endDate > now ? 'active' : 'expired';
});

// Ensure virtuals are included in JSON
subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Subscription', subscriptionSchema);
