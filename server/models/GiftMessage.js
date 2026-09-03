import mongoose from 'mongoose';

const giftMessageSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  recipientName: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  audioUrl: {
    type: String,
    default: '',
  },
  qrCodeUrl: {
    type: String,
    required: true,
  },
  uniqueSlug: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('GiftMessage', giftMessageSchema);
