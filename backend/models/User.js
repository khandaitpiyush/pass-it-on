import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    select: false
  },

  googleId: {
    type: String
  },

  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },

  // Campus reference
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus"
  },

  // ── Verification status ──────────────────────────────
  studentVerified: {
    type: Boolean,
    default: false
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  // College email (may differ from login email for Google users)
  collegeEmail: {
    type: String,
    lowercase: true,
    trim: true
  },

  // ── OTP fields (temporary, cleared after verify) ─────
  otpHash: {
    type: String,        // bcrypt hash of the 6-digit code
    select: false        // never returned in queries by default
  },

  otpExpiry: {
    type: Date           // 10 min from send time
  },

  otpAttempts: {
    type: Number,
    default: 0           // max 5 before OTP is invalidated
  },

  otpLastSentAt: {
    type: Date           // enforces 60s resend cooldown
  },

  // ── Academic details ─────────────────────────────────
  branch: {
    type: String
  },

  year: {
    type: String
  },

  // ── Account status ───────────────────────────────────
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// ── Index for OTP expiry cleanup (optional but good practice) ──
userSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model("User", userSchema);