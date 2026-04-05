import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  image: {
    type: String
  },

  category: {
    type: String
  },

  condition: {
    type: String
  },

  semester: {
    type: String
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  campusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campus",
    required: true
  }

}, { timestamps: true });

export default mongoose.model("Listing", listingSchema);