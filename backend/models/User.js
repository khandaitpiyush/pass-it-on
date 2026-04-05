import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String
  },

  collegeCode: {
    type: String
  },

  branch: {
    type: String
  },

  year: {
    type: String
  },

  googleId: {
    type: String
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    type: String
  },

  otpExpiry: {
    type: Date
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);