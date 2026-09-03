import express from "express";
import Subscription from "../models/Subscription.js";
import { auth } from "../middleware/auth.js";
import { getSubscriptionStatus } from "../utils/subscriptionHelpers.js";

const router = express.Router();

// Get current user's subscription status
router.get("/status", auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id });
    res.json(getSubscriptionStatus(subscription));
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error fetching subscription status",
        error: error.message,
      });
  }
});

export default router;
