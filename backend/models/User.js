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

  // Campus reference (important for multi-campus system)
  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus"
  },

  // Verified college student
  studentVerified: {
    type: Boolean,
    default: false
  },

  // Basic academic details
  branch: {
    type: String
  },

  year: {
    type: String
  },

  // Email verification
  emailVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    type: String
  },

  otpExpiry: {
    type: Date
  },

  // Account status
  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);