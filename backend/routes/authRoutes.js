import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  signup,
  login,
  sendOTP,
  verifyOTP,
  googleLogin,
  selectCampus,
  getCampuses,
} from "../controllers/authController.js";

const router = express.Router();

/* ---------- PUBLIC ROUTES ---------- */
router.post("/signup", signup);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.get("/campuses", getCampuses);

/* ---------- PROTECTED ROUTES ---------- */
router.post("/send-otp", protect, sendOTP);
router.post("/verify-otp", protect, verifyOTP);
router.post("/select-campus", protect, selectCampus);

export default router;