import express from "express";
import {
  createListing,
  getListings,
  getListingById,
  deleteListing
} from "../controllers/listingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createListing);
router.get("/", protect, getListings);
router.get("/:id", protect, getListingById);      // ← new
router.delete("/:id", protect, deleteListing);    // ← new

export default router;