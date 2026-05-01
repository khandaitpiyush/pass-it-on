import express from 'express';
import {
  signup,
  login,
  googleLogin,
  sendOTP,
  verifyOTP,
  selectCampus,
  getCampuses,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/signup',          signup);
router.post('/login',           login);
router.post('/google',          googleLogin);
router.get('/campuses',         getCampuses);

// ── Protected routes (JWT required) ──────────────────────────────────────────
router.post('/send-otp',        protect, sendOTP);
router.post('/verify-otp',      protect, verifyOTP);
router.post('/select-campus',   protect, selectCampus);

export default router;