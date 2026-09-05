import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    businessName: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: "",
    },
    instagramLink: {
      type: String,
      default: "",
    },
    whatsappNumber: {
      type: String,
      default: "",
    },
    accentColor: {
      type: String,
      default: "#7c3aed",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if oauthProvider is not set
        return !this.oauthProvider;
      },
    },
    oauthProvider: {
      type: String,
      enum: ["google", "clerk", null],
      default: null,
    },
    clerkId: {
      type: String,
      sparse: true,
      unique: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Seller", sellerSchema);
