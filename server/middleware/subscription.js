import Subscription from '../models/Subscription.js';
import { isSubscriptionActive } from '../utils/subscriptionHelpers.js';

/**
 * Middleware to require active subscription
 * Must be used after auth middleware (which sets req.user)
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    
    if (!isSubscriptionActive(subscription)) {
      return res.status(403).json({ 
        error: 'SUBSCRIPTION_EXPIRED',
        message: 'Your subscription has expired or is not active'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking subscription', error: error.message });
  }
};
