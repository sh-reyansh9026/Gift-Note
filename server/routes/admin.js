import express from 'express';
import mongoose from 'mongoose';
import Seller from '../models/Seller.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import { auth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { calculateNewEndDate, isSubscriptionActive } from '../utils/subscriptionHelpers.js';

const router = express.Router();

// Get all users with search/filter support
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { businessName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    
    const users = await Seller.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get subscription status for each user
    const usersWithSubscription = await Promise.all(
      users.map(async (user) => {
        const subscription = await Subscription.findOne({ userId: user._id });
        const isActive = isSubscriptionActive(subscription);
        
        return {
          id: user._id,
          businessName: user.businessName,
          email: user.email,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          subscription: subscription ? {
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            status: isActive ? 'active' : 'expired',
          } : {
            plan: null,
            startDate: null,
            endDate: null,
            status: 'none',
          },
        };
      })
    );
    
    res.json(usersWithSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

// Get single user details with subscription and payment history
router.get('/users/:userId', auth, requireAdmin, async (req, res) => {
  try {
    const user = await Seller.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const subscription = await Subscription.findOne({ userId: user._id });
    const payments = await Payment.find({ userId: user._id })
      .populate('verifiedBy', 'businessName email')
      .sort({ paymentDate: -1 });
    
    const isActive = isSubscriptionActive(subscription);
    
    res.json({
      user: {
        id: user._id,
        businessName: user.businessName,
        email: user.email,
        isAdmin: user.isAdmin,
        instagramLink: user.instagramLink,
        logo: user.logo,
        createdAt: user.createdAt,
      },
      subscription: subscription ? {
        plan: subscription.plan,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: isActive ? 'active' : 'expired',
      } : null,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user details', error: error.message });
  }
});

// Activate/Renew user subscription
router.post('/users/:userId/activate', auth, requireAdmin, async (req, res) => {
  try {
    console.log('=== SUBSCRIPTION ACTIVATION START ===');
    console.log('Request body:', req.body);
    console.log('Params userId:', req.params.userId);
    console.log('Req user:', req.user);
    
    const { plan, amount, notes } = req.body;
    
    if (!plan || !amount) {
      return res.status(400).json({ message: 'Plan and amount are required' });
    }
    
    const user = await Seller.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Target user found:', user._id);
    
    // Map plan to months
    const planMonths = {
      '1_month': 1,
      '3_months': 3,
      '1_year': 12,
    };
    
    const monthsToAdd = planMonths[plan];
    if (!monthsToAdd) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    
    // Get existing subscription
    const existingSubscription = await Subscription.findOne({ userId: user._id });
    console.log('Existing subscription:', existingSubscription);
    
    // Calculate new end date
    const currentDate = new Date();
    const newEndDate = calculateNewEndDate(existingSubscription, monthsToAdd, currentDate);
    console.log('New end date:', newEndDate);
    
    // Create or update subscription
    let subscription;
    if (existingSubscription) {
      existingSubscription.plan = plan;
      existingSubscription.startDate = currentDate;
      existingSubscription.endDate = newEndDate;
      subscription = await existingSubscription.save();
    } else {
      subscription = new Subscription({
        userId: user._id,
        plan,
        startDate: currentDate,
        endDate: newEndDate,
      });
      await subscription.save();
    }
    
    console.log('Subscription saved:', subscription._id);
    
    // Create payment record
    const paymentData = {
      userId: user._id,
      amount: Number(amount),
      plan,
      paymentMethod: 'UPI',
      paymentDate: currentDate,
      subscriptionStartDate: currentDate,
      subscriptionEndDate: newEndDate,
      paymentStatus: 'verified',
      notes: notes || '',
      verifiedBy: req.user._id,
    };
    
    console.log('Payment data:', paymentData);
    
    const payment = new Payment(paymentData);
    await payment.save();
    
    console.log('Payment saved:', payment._id);
    
    // Populate verifiedBy for response
    await payment.populate('verifiedBy', 'businessName email');
    
    console.log('=== SUBSCRIPTION ACTIVATION SUCCESS ===');
    
    res.status(201).json({
      subscription,
      payment,
    });
  } catch (error) {
    console.error('=== SUBSCRIPTION ACTIVATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error activating subscription', 
      error: error.message,
      errorName: error.name 
    });
  }
});

// Get payment history for a user
router.get('/users/:userId/payments', auth, requireAdmin, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .populate('verifiedBy', 'businessName email')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching payment history', error: error.message });
  }
});

export default router;
