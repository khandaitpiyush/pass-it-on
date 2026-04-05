import mongoose from "mongoose";

const campusSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  domain: {
    type: String,
    required: true,
    unique: true
  },

  city: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("Campus", campusSchema);