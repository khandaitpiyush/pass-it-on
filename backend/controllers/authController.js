import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import Campus from '../models/Campus.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail, buildOtpEmailHtml } from '../utils/emailHelper.js';

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CLIENT
// ─────────────────────────────────────────────────────────────────────────────

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL DOMAIN BLOCKLIST
// Only used during college-email OTP verification, not during signup/login.
// ─────────────────────────────────────────────────────────────────────────────

const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com',
  'live.com', 'icloud.com', 'me.com', 'aol.com', 'protonmail.com',
  'proton.me', 'rediffmail.com', 'ymail.com', 'zoho.com', 'tutanota.com',
  'mail.com', 'gmx.com',
]);

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPER — strip every sensitive field before sending to the client
// ─────────────────────────────────────────────────────────────────────────────

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.otpHash;
  delete obj.otpExpiry;
  delete obj.otpAttempts;
  delete obj.otpLastSentAt;
  delete obj.__v;
  return obj;
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// Public. Password-based account creation.
// Auto-verifies if the signup email matches a known campus domain.
// ─────────────────────────────────────────────────────────────────────────────

export const signup = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const domain = normalizedEmail.split('@')[1];
    const campus = await Campus.findOne({ domain });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email:           normalizedEmail,
      password:        hashedPassword,
      branch,
      year,
      campusId:        campus?._id ?? null,
      studentVerified: !!campus,
      emailVerified:   !!campus,  // auto-verified when signup email is a college domain
    });

    const token = generateToken(user);

    res.status(201).json({
      user:                sanitizeUser(user),
      token,
      campusId:            user.campusId,
      studentVerified:     user.studentVerified,
      needsCampusSelection: !user.campusId,
    });

  } catch (err) {
    console.error('[signup]', err.message);
    res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Public. Password-based login.
// Blocks Google-only accounts from using this route.
// ─────────────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // +password because the field has select:false on the User model
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      // Intentionally vague — don't leak whether the email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Prevent password login for Google-only accounts
    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({
        message: 'This account uses Google Sign-In. Please continue with Google.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      user:                sanitizeUser(user),
      token,
      campusId:            user.campusId,
      studentVerified:     user.studentVerified,
      needsCampusSelection: !user.campusId,
    });

  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/google
// Public. Verify Google ID token, create or update account.
// ─────────────────────────────────────────────────────────────────────────────

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google ID token is required.' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken:  token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, sub: googleId } = ticket.getPayload();

    const normalizedEmail = email.toLowerCase();
    const domain = normalizedEmail.split('@')[1];
    const campus = await Campus.findOne({ domain });

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name,
        email:           normalizedEmail,
        googleId,
        provider:        'google',
        emailVerified:   true,
        studentVerified: !!campus,
        campusId:        campus?._id ?? null,
      });
    } else if (campus && !user.studentVerified) {
      // Campus domain was added after their first login — upgrade silently
      user.studentVerified = true;
      user.campusId = campus._id;
      await user.save();
    }

    const jwtToken = generateToken(user);

    res.json({
      user:                sanitizeUser(user),
      token:               jwtToken,
      campusId:            user.campusId,
      studentVerified:     user.studentVerified,
      needsCampusSelection: !user.campusId,
    });

  } catch (err) {
    console.error('[googleLogin]', err.message);
    res.status(500).json({ message: 'Google login failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/send-otp                                    🔒 protect
// Sends a 6-digit OTP to the college email the user wants to verify.
// The email in req.body is the COLLEGE email being verified, not the login email.
// req.user is already the full Mongoose doc injected by protect middleware.
// ─────────────────────────────────────────────────────────────────────────────

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user._id;

    // 1. Basic format check
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const domain = normalizedEmail.split('@')[1];

    // 2. Block personal email domains
    if (PERSONAL_DOMAINS.has(domain)) {
      return res.status(400).json({
        message: 'Personal email addresses are not accepted. Please use your college email.',
      });
    }

    // 3. Already verified — nothing to do
    // req.user is fetched fresh from DB by protect, so studentVerified is current
    if (req.user.studentVerified) {
      return res.status(400).json({ message: 'Your college email is already verified.' });
    }

    // 4. Resend cooldown — 60 seconds between requests
    if (req.user.otpLastSentAt) {
      const elapsed = (Date.now() - new Date(req.user.otpLastSentAt).getTime()) / 1000;
      if (elapsed < 60) {
        const wait = Math.ceil(60 - elapsed);
        return res.status(429).json({
          message: `Please wait ${wait}s before requesting a new code.`,
        });
      }
    }

    // 5. Generate and hash a 6-digit OTP — never store plaintext
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = await bcrypt.hash(otp, 10);

    // 6. Persist OTP metadata — reset attempt counter on every fresh send
    await User.findByIdAndUpdate(userId, {
      collegeEmail:  normalizedEmail,
      otpHash,
      otpExpiry:     new Date(Date.now() + 10 * 60 * 1000),  // 10 minutes
      otpAttempts:   0,
      otpLastSentAt: new Date(),
    });

    // 7. Send the email via Brevo (emailHelper uses native fetch + env vars)
    await sendEmail({
      to:          normalizedEmail,
      toName:      req.user.name,
      subject:     `${otp} is your PassItOn verification code`,
      htmlContent: buildOtpEmailHtml(otp, req.user.name),
    });

    res.json({ message: 'Verification code sent. Check your college inbox.' });

  } catch (err) {
    console.error('[sendOTP]', err.message);
    res.status(500).json({ message: 'Failed to send code. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp                                  🔒 protect
// Validates the OTP and marks the user as a verified student.
// On success: auto-assigns campus if the college domain exists in the DB.
// ─────────────────────────────────────────────────────────────────────────────

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userId = req.user._id;

    // 1. Input validation
    if (!email || !otp || String(otp).trim().length !== 6) {
      return res.status(400).json({ message: 'A valid email and 6-digit code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Fetch user with otpHash opted back in (field has select:false on the model)
    const user = await User.findById(userId).select('+otpHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // 3. Already verified
    if (user.studentVerified) {
      return res.status(400).json({ message: 'Your college email is already verified.' });
    }

    // 4. No active OTP session — user must request a new code
    if (!user.otpHash || !user.otpExpiry) {
      return res.status(400).json({
        message: 'No active code found. Please request a new one.',
      });
    }

    // 5. Expired — wipe fields and force a fresh request
    if (new Date() > new Date(user.otpExpiry)) {
      await User.findByIdAndUpdate(userId, {
        $unset: { otpHash: '', otpExpiry: '', otpAttempts: '', otpLastSentAt: '' },
      });
      return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    }

    // 6. Too many wrong attempts — wipe fields and force a fresh request
    if (user.otpAttempts >= 5) {
      await User.findByIdAndUpdate(userId, {
        $unset: { otpHash: '', otpExpiry: '', otpAttempts: '', otpLastSentAt: '' },
      });
      return res.status(429).json({
        message: 'Too many failed attempts. Please request a new code.',
      });
    }

    // 7. Email must match what we sent the code to
    if (user.collegeEmail !== normalizedEmail) {
      return res.status(400).json({
        message: 'Email mismatch. Please restart verification.',
      });
    }

    // 8. Verify the OTP against the stored hash
    const isMatch = await bcrypt.compare(String(otp).trim(), user.otpHash);

    if (!isMatch) {
      await User.findByIdAndUpdate(userId, { $inc: { otpAttempts: 1 } });

      // otpAttempts on the doc reflects count BEFORE this failure
      const attemptsUsed = user.otpAttempts + 1;
      const remaining = 5 - attemptsUsed;

      return res.status(400).json({
        message: remaining > 0
          ? `Wrong code. ${remaining} attempt${remaining !== 1 ? 's' : ''} left.`
          : 'Wrong code. Please request a new one.',
      });
    }

    // 9. ✅ OTP correct — auto-assign campus from the verified college domain
    const domain = normalizedEmail.split('@')[1];
    const campus = await Campus.findOne({ domain });

    // 10. Mark verified, assign campus if found, wipe all OTP fields atomically
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        studentVerified: true,
        emailVerified:   true,
        ...(campus && { campusId: campus._id }),
        $unset: { otpHash: '', otpExpiry: '', otpAttempts: '', otpLastSentAt: '' },
      },
      { new: true },
    ).select('-password -otpHash');

    res.json({
      message:         'College email verified. You can now list items!',
      user:            sanitizeUser(updatedUser),
      studentVerified: true,
      campusId:        updatedUser.campusId,
    });

  } catch (err) {
    console.error('[verifyOTP]', err.message);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/select-campus                               🔒 protect
// Lets unverified users manually pick a campus (e.g. personal-email signups).
// Blocked once studentVerified is true — a verified campus is permanent.
// ─────────────────────────────────────────────────────────────────────────────

export const selectCampus = async (req, res) => {
  try {
    const { campusId } = req.body;

    if (!campusId) {
      return res.status(400).json({ message: 'Campus ID is required.' });
    }

    if (req.user.studentVerified) {
      return res.status(400).json({ message: 'Verified campus cannot be changed.' });
    }

    const campus = await Campus.findById(campusId);
    if (!campus) {
      return res.status(400).json({ message: 'Invalid campus selected.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { campusId: campus._id, studentVerified: false },
      { new: true },
    );

    res.json({
      message:             'Campus assigned successfully.',
      user:                sanitizeUser(updatedUser),
      campusId:            updatedUser.campusId,
      studentVerified:     updatedUser.studentVerified,
      needsCampusSelection: false,
    });

  } catch (err) {
    console.error('[selectCampus]', err.message);
    res.status(500).json({ message: 'Failed to assign campus. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/campuses
// Public. Returns all active campuses for the campus-selection UI.
// ─────────────────────────────────────────────────────────────────────────────

export const getCampuses = async (req, res) => {
  try {
    const campuses = await Campus.find({ isActive: true })
      .select('_id name')
      .sort({ name: 1 });

    res.json(campuses);

  } catch (err) {
    console.error('[getCampuses]', err.message);
    res.status(500).json({ message: 'Failed to fetch campuses. Please try again.' });
  }
};