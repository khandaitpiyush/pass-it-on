import bcrypt from "bcryptjs";
import User from "../models/User.js";
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
    const { name, email, password, collegeCode, branch, year } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      collegeCode,
      branch,
      year
    });

    const token = generateToken(user._id);

    res.json({
      user,
      token
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Signup failed"
    });

  }
};

/* ---------------- LOGIN ---------------- */

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = generateToken(user._id);

    res.json({
      user,
      token
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });

  }
};

/* ---------------- SEND OTP ---------------- */

export const sendOTP = async (req, res) => {
  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = expiry;

    await user.save();

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    await apiInstance.sendTransacEmail({
      sender: { email: "your@email.com" },
      to: [{ email }],
      subject: "PassItOn OTP Verification",
      htmlContent: `<h2>Your OTP is ${otp}</h2>`
    });

    res.json({
      message: "OTP sent successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "OTP sending failed"
    });

  }
};

/* ---------------- VERIFY OTP ---------------- */

export const verifyOTP = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    user.emailVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({
      message: "Email verified successfully"
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "OTP verification failed"
    });

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

    let user = await User.findOne({ email });

    if (!user) {

      user = await User.create({
        name,
        email,
        googleId: sub,
        emailVerified: true
      });

    }

    const jwtToken = generateToken(user._id);

    res.json({
      user,
      token: jwtToken
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Google login failed"
    });

  }
};