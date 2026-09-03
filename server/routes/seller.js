import express from "express";
import bcrypt from "bcrypt";
import Seller from "../models/Seller.js";
import Subscription from "../models/Subscription.js";
import { auth } from "../middleware/auth.js";
import { getSubscriptionStatus } from "../utils/subscriptionHelpers.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(file.originalname.toLowerCase());
    const mime = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ].includes(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed for business logo uploads."));
  },
});

const uploadToCloudinary = async (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(file.buffer);
  });
};

router.get("/profile", auth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user._id).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const subscription = await Subscription.findOne({ userId: req.user._id });
    const subscriptionStatus = getSubscriptionStatus(subscription);

    res.json({
      _id: seller._id,
      name: seller.name || "",
      businessName: seller.businessName,
      logo: seller.logo || "",
      email: seller.email,
      instagramLink: seller.instagramLink || "",
      whatsappNumber: seller.whatsappNumber || "",
      accentColor: seller.accentColor || "#7c3aed",
      oauthProvider: seller.oauthProvider || null,
      isAdmin: seller.isAdmin,
      subscription: {
        status: subscriptionStatus.status,
        hasSubscription: subscriptionStatus.hasSubscription,
        plan: subscriptionStatus.plan,
        startDate: subscriptionStatus.startDate,
        endDate: subscriptionStatus.endDate,
        isActive: subscriptionStatus.isActive,
        daysRemaining: subscriptionStatus.daysRemaining,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching profile", error: error.message });
  }
});

router.put("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      businessName,
      logo,
      instagramLink,
      whatsappNumber,
      accentColor,
    } = req.body;

    const seller = await Seller.findById(req.user._id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (typeof name === "string") seller.name = name.trim();
    if (typeof businessName === "string" && businessName.trim())
      seller.businessName = businessName.trim();
    if (typeof logo === "string") seller.logo = logo.trim();
    if (typeof instagramLink === "string")
      seller.instagramLink = instagramLink.trim();
    if (typeof whatsappNumber === "string")
      seller.whatsappNumber = whatsappNumber.trim();
    if (typeof accentColor === "string" && accentColor.trim())
      seller.accentColor = accentColor.trim();

    await seller.save();

    res.json({
      message: "Profile updated successfully",
      seller: {
        _id: seller._id,
        name: seller.name || "",
        businessName: seller.businessName,
        logo: seller.logo || "",
        email: seller.email,
        instagramLink: seller.instagramLink || "",
        whatsappNumber: seller.whatsappNumber || "",
        accentColor: seller.accentColor || "#7c3aed",
        oauthProvider: seller.oauthProvider || null,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error updating profile", error: error.message });
  }
});

router.put("/profile/logo", auth, upload.single("logo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo file provided" });
    }

    const result = await uploadToCloudinary(
      req.file,
      `giftnote/${req.user._id}/logos`,
    );
    const seller = await Seller.findById(req.user._id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.logo = result.secure_url;
    await seller.save();

    res.json({
      message: "Logo updated successfully",
      logo: seller.logo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to upload logo", error: error.message });
  }
});

router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const seller = await Seller.findById(req.user._id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.oauthProvider === "google") {
      return res
        .status(400)
        .json({
          message:
            "This account is signed in with Google and does not have a password to change.",
        });
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res
        .status(400)
        .json({
          message:
            "Current password, new password, and confirmation are required.",
        });
    }

    const isMatch = await bcrypt.compare(currentPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error updating password",
        error: error.message,
      });
  }
});

export default router;
