import express from 'express';
import {
  signup,
  login,
  googleLogin,
  sendOTP,
  verifyOTP,
  selectCampus,
  getCampuses,
  sendSignupOtp,      // 👈 added
  verifySignupOtp,    // 👈 added
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/signup',             signup);
router.post('/login',              login);
router.post('/google',             googleLogin);
router.get('/campuses',            getCampuses);
router.post('/send-signup-otp',    sendSignupOtp);    // 👈 public — no protect
router.post('/verify-signup-otp',  verifySignupOtp);  // 👈 public — no protect

// ── Protected routes (JWT required) ──────────────────────────────────────────
router.post('/send-otp',      protect, sendOTP);
router.post('/verify-otp',    protect, verifyOTP);
router.post('/select-campus', protect, selectCampus);

// ── GET /api/auth/users/:id — fetch basic public profile by ID ────────────────
router.get('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name studentVerified')
      .lean();

    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    return res.json({
      _id:             user._id,
      name:            user.name,
      studentVerified: user.studentVerified,
    });
  } catch {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;