import { clerkClient, getAuth } from "@clerk/express";
import Seller from "../models/Seller.js";

export const auth = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ message: "Clerk account has no email address" });
    }

    let seller = await Seller.findOne({ clerkId: userId });
    if (!seller) {
      seller = await Seller.findOne({ email });
    }

    if (!seller) {
      seller = await Seller.create({
        clerkId: userId,
        email,
        businessName:
          clerkUser.publicMetadata?.businessName ||
          clerkUser.firstName ||
          email.split("@")[0],
        oauthProvider: "clerk",
      });
    } else if (seller.clerkId !== userId) {
      seller.clerkId = userId;
      await seller.save();
    }

    req.sellerId = seller._id;
    req.user = seller;
    next();
  } catch (error) {
    console.error("Clerk auth middleware error:", error);
    res.status(401).json({ message: "Clerk authentication failed" });
  }
};
