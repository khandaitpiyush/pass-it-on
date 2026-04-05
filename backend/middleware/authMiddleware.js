import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ---------------- PROTECT ROUTE ---------------- */

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify payload structure before proceeding
      if (!decoded?.id) {
        return res.status(401).json({
          message: "Invalid token payload"
        });
      }

      // PERFORMANCE OPTIMIZATION:
      // Attach campusId directly from the JWT. 
      // Controllers can now use req.campusId immediately for fast DB queries!
      req.campusId = decoded.campusId;

      // Fetch the full user to ensure they still exist in the DB
      // and to check their latest studentVerified status
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User not found"
        });
      }

      req.user = user;
      next();

    } else {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Not authorized, token invalid"
    });
  }
};

/* ---------------- SELLER GUARD ---------------- */
// Use this middleware ONLY on routes where users create/edit products to sell

export const requireVerifiedSeller = (req, res, next) => {
  // Check if the user exists and their student status is verified
  if (req.user && req.user.studentVerified) {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied: Only verified college students can sell items."
    });
  }
};