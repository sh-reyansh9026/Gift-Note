import mongoose from "mongoose";

const signupOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    instagramLink: {
      type: String,
      default: "",
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export default mongoose.model("SignupOtp", signupOtpSchema);
