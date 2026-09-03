import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import GiftMessage from '../models/GiftMessage.js';
import { auth } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import dotenv from 'dotenv';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Configure multer with memory storage (no local disk storage)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const allowedAudioTypes = /mp3|wav|m4a/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) || 
                    allowedAudioTypes.test(path.extname(file.originalname).toLowerCase());
    
    const allowedImageMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    const allowedAudioMimeTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/m4a',
      'audio/x-m4a'
    ];
    const isImage = allowedImageMimeTypes.includes(file.mimetype);
    const isAudio = allowedAudioMimeTypes.includes(file.mimetype);

    if (extname && (isImage || isAudio)) {
      // Additional size validation
      if (isImage && file.size > 5 * 1024 * 1024) {
        return cb(new Error('Image file must be under 5MB'));
      }
      if (isAudio && file.size > 10 * 1024 * 1024) {
        return cb(new Error('Audio file must be under 10MB'));
      }
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only images (jpg/png/webp/gif) and audio files (mp3/wav/m4a) are allowed.'));
  },
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (file, folder, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(file.buffer);
  });
};

// Generate unique slug
const generateUniqueSlug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// Create gift message
router.post('/', auth, requireActiveSubscription, upload.fields([{ name: 'photo' }, { name: 'audio' }]), async (req, res) => {
  try {
    const { recipientName, senderName, message } = req.body;
    const photoFile = req.files['photo'] ? req.files['photo'][0] : null;
    const audioFile = req.files['audio'] ? req.files['audio'][0] : null;

    let photoUrl = '';
    let audioUrl = '';

    // Upload photo to Cloudinary if provided
    if (photoFile) {
      try {
        const photoResult = await uploadToCloudinary(
          photoFile,
          `giftnote/${req.user._id}/photos`,
          'image'
        );
        photoUrl = photoResult.secure_url;
      } catch (error) {
        console.error('Cloudinary photo upload error:', error);
        return res.status(500).json({ 
          message: 'Failed to upload photo to Cloudinary', 
          error: error.message 
        });
      }
    }

    // Upload audio to Cloudinary if provided
    if (audioFile) {
      try {
        const audioResult = await uploadToCloudinary(
          audioFile,
          `giftnote/${req.user._id}/audio`,
          'video' // Cloudinary treats audio as video resource type
        );
        audioUrl = audioResult.secure_url;
      } catch (error) {
        console.error('Cloudinary audio upload error:', error); 
        return res.status(500).json({ 
          message: 'Failed to upload audio to Cloudinary', 
          error: error.message 
        });
      }
    }

    const uniqueSlug = generateUniqueSlug();

    // Generate QR code URL (this would be your frontend URL in production)
    const giftUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/gift/${uniqueSlug}`;
    const qrCodeDataUrl = await QRCode.toDataURL(giftUrl);

    const giftMessage = new GiftMessage({
      sellerId: req.user._id,
      recipientName,
      senderName,
      message,
      photoUrl,
      audioUrl,
      uniqueSlug,
      qrCodeUrl: qrCodeDataUrl,
    });

    await giftMessage.save();

    res.status(201).json(giftMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all gift messages for logged-in seller
router.get('/', auth, requireActiveSubscription, async (req, res) => {
  try {
    const giftMessages = await GiftMessage.find({ sellerId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(giftMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get gift message by slug (public endpoint)
router.get('/:slug', async (req, res) => {
  try {
    const giftMessage = await GiftMessage.findOne({ uniqueSlug: req.params.slug })
      .populate('sellerId', 'businessName logo instagramLink');
    
    if (!giftMessage) {
      return res.status(404).json({ message: 'Gift message not found' });
    }

    res.json(giftMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete gift message (seller only)
router.delete('/:id', auth, requireActiveSubscription, async (req, res) => {
  try {
    const giftMessage = await GiftMessage.findOne({ _id: req.params.id, sellerId: req.user._id });
    
    if (!giftMessage) {
      return res.status(404).json({ message: 'Gift message not found' });
    }

    await GiftMessage.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gift message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
