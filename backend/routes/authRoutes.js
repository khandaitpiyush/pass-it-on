import express from "express";

import {
  signup,
  login,
  sendOTP,
  verifyOTP,
  googleLogin
} from "../controllers/authController.js";

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

export default router;