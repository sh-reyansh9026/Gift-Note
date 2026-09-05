import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import Seller from "../models/Seller.js";
import SignupOtp from "../models/SignupOtp.js";
import { auth } from "../middleware/auth.js";
import passport from "../config/passport.js";

const router = express.Router();

const getMailer = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const sellerResponse = (seller) => ({
  id: seller._id,
  businessName: seller.businessName,
  email: seller.email,
  instagramLink: seller.instagramLink,
  logo: seller.logo,
  isAdmin: seller.isAdmin,
});

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { businessName, email, password, instagramLink } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (
      !businessName?.trim() ||
      !normalizedEmail ||
      !password ||
      password.length < 6
    ) {
      return res
        .status(400)
        .json({
          message:
            "Business name, valid email, and a password of at least 6 characters are required",
        });
    }

    const existingSeller = await Seller.findOne({ email: normalizedEmail });
    if (existingSeller) {
      return res
        .status(400)
        .json({ message: "Seller with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 1000000).toString();

    await SignupOtp.deleteMany({ email: normalizedEmail });
    await SignupOtp.create({
      businessName: businessName.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
      instagramLink: instagramLink || "",
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await getMailer().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: normalizedEmail,
      subject: "Your GiftNote verification code",
      text: `Your GiftNote verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your GiftNote verification code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`,
    });

    return res
      .status(200)
      .json({ message: "Verification code sent to your email" });
  } catch (error) {
    console.error("Signup OTP error:", error);
    res
      .status(500)
      .json({ message: "Unable to send verification code. Please try again." });
  }
});

// Verify signup email and create the seller account.
router.post("/verify-signup", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const pendingSignup = await SignupOtp.findOne({ email: normalizedEmail });

    if (!pendingSignup || pendingSignup.expiresAt < new Date()) {
      return res
        .status(400)
        .json({ message: "Verification code is invalid or expired" });
    }

    if (pendingSignup.attempts >= 5) {
      return res
        .status(429)
        .json({ message: "Too many attempts. Please request a new code." });
    }

    pendingSignup.attempts += 1;
    await pendingSignup.save();

    if (!otp || hashOtp(otp.trim()) !== pendingSignup.otpHash) {
      return res.status(400).json({ message: "Incorrect verification code" });
    }

    const seller = await Seller.create({
      businessName: pendingSignup.businessName,
      email: pendingSignup.email,
      password: pendingSignup.passwordHash,
      instagramLink: pendingSignup.instagramLink,
    });
    await SignupOtp.deleteOne({ _id: pendingSignup._id });

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      seller: sellerResponse(seller),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Seller with this email already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current seller
router.get("/me", auth, async (req, res) => {
  try {
    const seller = await Seller.findById(req.user._id).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Google OAuth - Initiate
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google OAuth - Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ sellerId: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?token=${token}`;

    res.redirect(redirectUrl);
  },
);

export default router;
