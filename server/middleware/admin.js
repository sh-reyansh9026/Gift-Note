/**
 * Middleware to require admin privileges
 * Must be used after auth middleware (which sets req.user)
 */
export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        error: 'ADMIN_REQUIRED',
        message: 'Admin privileges required'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error checking admin status', error: error.message });
  }
};
