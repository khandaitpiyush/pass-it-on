import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Campus from "../models/Campus.js";
import generateToken from "../utils/generateToken.js";
import SibApiV3Sdk from "sib-api-v3-sdk";
import { OAuth2Client } from "google-auth-library";

/* ---------------- GOOGLE CLIENT ---------------- */

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ---------------- BREVO CONFIG ---------------- */

const brevoClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = brevoClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

/* ---------------- HELPER — strip sensitive fields ---------------- */

const sanitizeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.__v;
  return obj;
};

/* ---------------- SIGNUP ---------------- */

export const signup = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const domain = email.split("@")[1].toLowerCase();
    const campus = await Campus.findOne({ domain });

    let studentVerified = false;
    let campusId = null;

    if (campus) {
      studentVerified = true;
      campusId = campus._id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      branch,
      year,
      campusId,
      studentVerified,
      emailVerified: !!campus, // auto-verified if college email
    });

    const token = generateToken(user);

    res.json({
      user: sanitizeUser(user),
      token,
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: !user.campusId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup failed" });
  }
};

/* ---------------- LOGIN ---------------- */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Block Google-only accounts from password login
    if (user.provider === "google" && !user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please sign in with Google."
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateToken(user);

    res.json({
      user: sanitizeUser(user),
      token,
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: !user.campusId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ---------------- SEND OTP ---------------- */

// IMPORTANT: This route is protected — req.user comes from JWT via protect middleware.
// The email in req.body is the COLLEGE email to verify, NOT the login email.
// We find the user by req.user._id, not by the college email.

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body; // college email to verify

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user by their account ID from JWT — not by the college email
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reject if already verified
    if (user.studentVerified) {
      return res.status(400).json({
        message: "Your college email is already verified."
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: { name: "PassItOn", email: "noreply@passiton.in" },
      to: [{ email }], // send to the college email being verified
      subject: "Verify your college email — PassItOn",
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #ffffff;">

          <div style="margin-bottom: 32px;">
            <span style="font-size: 24px; font-weight: 800; color: #1a3a2a;">PassItOn</span>
          </div>

          <h2 style="font-size: 22px; font-weight: 700; color: #111; margin-bottom: 8px;">
            Verify your college email
          </h2>
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">
            Use the code below to confirm your student status and unlock selling on PassItOn.
            This code expires in <strong>10 minutes</strong>.
          </p>

          <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 16px;
                      padding: 28px; text-align: center; margin-bottom: 28px;">
            <span style="font-size: 40px; font-weight: 900; letter-spacing: 10px; color: #166534;
                         font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>

          <p style="color: #999; font-size: 13px; line-height: 1.6;">
            If you didn't request this, you can safely ignore this email.
            Your account remains secure.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
            <p style="color: #bbb; font-size: 12px;">© 2026 PassItOn · Campus Academic Marketplace</p>
          </div>
        </div>
      `
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP sending failed" });
  }
};

/* ---------------- VERIFY OTP ---------------- */

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body; // email = college email being verified

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find user by their account ID from JWT
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new one."
      });
    }

    // Detect campus from the college email domain
    const domain = email.split("@")[1].toLowerCase();
    const campus = await Campus.findOne({ domain });

    user.emailVerified = true;
    user.studentVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    // Auto-assign campus if domain matches a known campus
    if (campus) {
      user.campusId = campus._id;
    }

    await user.save();

    const userObj = sanitizeUser(user);

    res.json({
      message: "College email verified successfully",
      user: userObj,
      studentVerified: true,
      campusId: user.campusId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* ---------------- GOOGLE LOGIN ---------------- */

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    const domain = email.split("@")[1].toLowerCase();
    const campus = await Campus.findOne({ domain });

    let studentVerified = false;
    let campusId = null;

    if (campus) {
      studentVerified = true;
      campusId = campus._id;
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        provider: "google",
        emailVerified: true,
        studentVerified,
        campusId
      });
    } else {
      // Upgrade if campus domain was added after their first login
      if (studentVerified && !user.studentVerified) {
        user.studentVerified = true;
        user.campusId = campusId;
        await user.save();
      }
    }

    const jwtToken = generateToken(user);

    res.json({
      user: sanitizeUser(user),
      token: jwtToken,
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: !user.campusId,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed" });
  }
};

/* ---------------- SELECT CAMPUS ---------------- */

export const selectCampus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { campusId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.studentVerified) {
      return res.status(400).json({
        message: "Verified campus cannot be changed"
      });
    }

    const campus = await Campus.findById(campusId);
    if (!campus) {
      return res.status(400).json({ message: "Invalid campus selected" });
    }

    user.campusId = campusId;
    user.studentVerified = false;
    await user.save();

    res.json({
      message: "Campus assigned successfully",
      user: sanitizeUser(user),
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: false,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign campus" });
  }
};

/* ---------------- GET CAMPUSES ---------------- */

export const getCampuses = async (req, res) => {
  try {
    const campuses = await Campus.find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 });

    res.json(campuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch campuses" });
  }
};