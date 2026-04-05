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

/* ---------------- SIGNUP ---------------- */

export const signup = async (req, res) => {
  try {
    const { name, email, password, branch, year } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Auto-detect campus based on email domain (normalized to lowercase)
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
      studentVerified
    });

    // Pass the full user object to include campusId in the JWT payload
    const token = generateToken(user);

    res.json({
      user,
      token,
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: !user.campusId 
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

    // Explicitly select the password field if it is set to select: false in the schema
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Pass the full user object to include campusId in the JWT payload
    const token = generateToken(user);

    // Remove the password from the user object before sending it to the client
    user.password = undefined;

    res.json({
      user,
      token,
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: !user.campusId 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ---------------- SEND OTP ---------------- */

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = expiry;
    await user.save();

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: { email: "your@email.com" }, // Replace with your verified sender
      to: [{ email }],
      subject: "PassItOn OTP Verification",
      htmlContent: `<h2>Your OTP is ${otp}</h2>`
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
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully" });

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

    // Find campus using domain
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
        emailVerified: true, // Google emails are pre-verified
        studentVerified,
        campusId
      });
    } else {
      // update verification if a user previously logged in without it, 
      // but their campus domain was recently added to the DB
      if (studentVerified && !user.studentVerified) {
        user.studentVerified = true;
        user.campusId = campusId;
        await user.save();
      }
    }

    // Pass the full user object to include campusId in the JWT payload
    const jwtToken = generateToken(user);

    res.json({
      user,
      token: jwtToken,
      campusId: user.campusId,
      studentVerified: user.studentVerified,
      needsCampusSelection: !user.campusId 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Google login failed" });
  }
};

/* ---------------- SELECT CAMPUS (For Gmail Users) ---------------- */

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

    // Convert to plain object and strip sensitive fields
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpiry;
    delete userObj.__v;

    res.json({
      message: "Campus assigned successfully",
      user: userObj,                        // ← clean object
      campusId: userObj.campusId,
      studentVerified: userObj.studentVerified,
      needsCampusSelection: false
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign campus" });
  }
};

/* ---------------- GET CAMPUSES ---------------- */

export const getCampuses = async (req, res) => {
  try {
    // Fetch active campuses, select _id and name, and sort alphabetically
    const campuses = await Campus.find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 });

    res.json(campuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch campuses"
    });
  }
};