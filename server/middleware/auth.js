import jwt from 'jsonwebtoken';
import Seller from '../models/Seller.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.sellerId = decoded.sellerId;
    
    // Fetch the user and attach to request for use in other middleware
    const seller = await Seller.findById(req.sellerId).select('-password');
    if (!seller) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = seller;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
