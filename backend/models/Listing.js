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

/* ── Indexes ── */
listingSchema.index({ campusId: 1, createdAt: -1 }); // main query pattern
listingSchema.index({ seller: 1 });                   // for my listings page

export default mongoose.model("Listing", listingSchema);