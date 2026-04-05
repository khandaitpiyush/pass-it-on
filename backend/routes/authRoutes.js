import express from "express";
import Campus from "../models/Campus.js";

import {
  signup,
  login,
  sendOTP,
  verifyOTP,
  googleLogin,
  selectCampus
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------- AUTH ROUTES ---------- */

// signup
router.post("/signup", signup);

// login
router.post("/login", login);

// send email OTP
router.post("/send-otp", sendOTP);

// verify email OTP
router.post("/verify-otp", verifyOTP);

// google login
router.post("/google-login", googleLogin);


/* ---------- CAMPUS ROUTES ---------- */

// Fetch all campuses (for dropdown in SelectCampusPage)
router.get("/campuses", async (req, res) => {
  try {
    const campuses = await Campus.find({});
    res.status(200).json(campuses);
  } catch (error) {
    console.error("Error fetching campuses:", error.message);
    res.status(500).json({
      message: "Failed to fetch campuses"
    });
  }
});

// select campus (for Gmail users choosing campus)
router.post("/select-campus", protect, selectCampus);

export default router;