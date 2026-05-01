// controllers/auth/verifyCollegeEmail.controller.ts
// Handles: POST /api/auth/send-otp  &  POST /api/auth/verify-otp

import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../../models/User'; // adjust path to your User model
import { sendEmail, buildOtpEmailHtml } from '../../utils/emailHelper';

// ─── Config ──────────────────────────────────────────────────────────────────

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const OTP_LENGTH = 6;

/**
 * Domains that are NOT allowed as college emails.
 * Extend as needed.
 */
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.in',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me',
  'rediffmail.com',
  'ymail.com',
  'zoho.com',
  'tutanota.com',
  'mail.com',
  'gmx.com',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Generates a cryptographically random N-digit numeric OTP string. */
function generateOtp(length: number = OTP_LENGTH): string {
  const max = Math.pow(10, length);
  // Use crypto.randomInt for uniform distribution, no modulo bias
  return crypto.randomInt(0, max).toString().padStart(length, '0');
}

/** Returns true when the email domain is from a personal provider. */
function isPersonalEmail(email: string): boolean {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2 || !parts[1]) return true;
  return PERSONAL_EMAIL_DOMAINS.has(parts[1]);
}

// ─── Controller: Send OTP ─────────────────────────────────────────────────────

/**
 * POST /api/auth/send-otp
 * Body: { email: string }  ← the NEW college email
 *
 * - Rejects personal email domains
 * - Generates OTP, stores hash + expiry on the user document
 * - Sends OTP via Brevo
 */
export async function sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id; // populated by your auth middleware
    const { email } = req.body as { email?: string };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'College email is required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ message: 'Please enter a valid email address.' });
      return;
    }

    if (isPersonalEmail(normalizedEmail)) {
      res.status(400).json({
        message:
          'Personal email addresses are not accepted. Please use your institutional college email (e.g. name@college.edu.in).',
      });
      return;
    }

    // ── Check the email isn't already taken by another verified user ────────
    const existingUser = await User.findOne({
      collegeEmail: normalizedEmail,
      studentVerified: true,
      _id: { $ne: userId },
    });

    if (existingUser) {
      res.status(409).json({
        message: 'This college email is already associated with another verified account.',
      });
      return;
    }

    // ── Generate OTP and hash it before storing ──────────────────────────────
    const otp = generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_MS);

    // ── Persist pending state on user document ───────────────────────────────
    const user = await User.findByIdAndUpdate(
      userId,
      {
        pendingCollegeEmail: normalizedEmail,
        otpHash,
        otpExpiry,
        otpAttempts: 0, // reset attempt counter on new OTP
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // ── Send email ───────────────────────────────────────────────────────────
    await sendEmail({
      to: normalizedEmail,
      toName: user.name,
      subject: '🎓 Your CampusCart verification code',
      htmlContent: buildOtpEmailHtml(otp, user.name),
      textContent: `Hi ${user.name},\n\nYour CampusCart verification code is: ${otp}\n\nIt expires in 10 minutes. Do not share it with anyone.`,
    });

    res.status(200).json({
      message: 'OTP sent successfully. Please check your college inbox.',
    });
  } catch (error: any) {
    console.error('[sendOtp] Error:', error?.message ?? error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
}

// ─── Controller: Verify OTP ───────────────────────────────────────────────────

/**
 * POST /api/auth/verify-otp
 * Body: { email: string, otp: string }
 *
 * - Validates OTP hash + expiry + attempt count
 * - On success: updates user.email to the college email, sets studentVerified
 */
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const { email, otp } = req.body as { email?: string; otp?: string };

    // ── Validation ──────────────────────────────────────────────────────────
    if (!email || !otp) {
      res.status(400).json({ message: 'Email and OTP are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // ── Guard: pending email must match what we sent OTP to ─────────────────
    if (user.pendingCollegeEmail !== normalizedEmail) {
      res.status(400).json({ message: 'Email mismatch. Please restart the verification flow.' });
      return;
    }

    // ── Guard: expiry ────────────────────────────────────────────────────────
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      res.status(410).json({ message: 'OTP has expired. Please request a new one.' });
      return;
    }

    // ── Guard: max attempts (brute-force protection) ──────────────────────
    const MAX_ATTEMPTS = 5;
    if ((user.otpAttempts ?? 0) >= MAX_ATTEMPTS) {
      res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new OTP.',
      });
      return;
    }

    // ── Verify hash (constant-time comparison) ───────────────────────────────
    const incomingHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    const isValid = crypto.timingSafeEqual(
      Buffer.from(incomingHash, 'hex'),
      Buffer.from(user.otpHash ?? '', 'hex')
    );

    if (!isValid) {
      // Increment attempt counter
      await User.findByIdAndUpdate(userId, { $inc: { otpAttempts: 1 } });
      const remaining = MAX_ATTEMPTS - ((user.otpAttempts ?? 0) + 1);
      res.status(400).json({
        message: `Incorrect OTP. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'No attempts left. Request a new OTP.'}`,
      });
      return;
    }

    // ── Success: promote the pending college email to primary email ──────────
    await User.findByIdAndUpdate(userId, {
      email: normalizedEmail,           // replace old email with college email
      collegeEmail: normalizedEmail,    // also store explicitly if your schema has this
      studentVerified: true,
      emailVerified: true,
      pendingCollegeEmail: null,        // clear pending
      otpHash: null,
      otpExpiry: null,
      otpAttempts: 0,
    });

    res.status(200).json({
      message: 'College email verified successfully. You are now a verified seller!',
    });
  } catch (error: any) {
    console.error('[verifyOtp] Error:', error?.message ?? error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
}