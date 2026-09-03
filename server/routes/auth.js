import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';
import { auth } from '../middleware/auth.js';
import passport from '../config/passport.js';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { businessName, email, password, instagramLink } = req.body;

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = new Seller({
      businessName,
      email,
      password: hashedPassword,
      instagramLink: instagramLink || '',
    });

    await seller.save();

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      seller: {
        id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        instagramLink: seller.instagramLink,
        logo: seller.logo,
        isAdmin: seller.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      seller: {
        id: seller._id,
        businessName: seller.businessName,
        email: seller.email,
        instagramLink: seller.instagramLink,
        logo: seller.logo,
        isAdmin: seller.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current seller
router.get('/me', auth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user._id).select('-password');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth - Initiate
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth - Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
  (req, res) => {
    
    // Generate JWT token
    const token = jwt.sign({ sellerId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}`;

    res.redirect(redirectUrl);
  }
);

export default router;
