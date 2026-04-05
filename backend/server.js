import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import { seedCampuses } from "./utils/seedCampuses.js";

dotenv.config();

/**
 * startServer handles the asynchronous initialization of the backend.
 * It ensures the database is ready and campuses are seeded before accepting traffic.
 */
const startServer = async () => {
  try {
    // 1. Database Connection
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2. Initial Data Seeding
    await seedCampuses();

    const app = express();

    // 3. Middleware Configuration
    app.use(cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      credentials: true
    }));

    app.use(express.json());
    app.use(cookieParser());

    // 4. API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/listings", listingRoutes);

    // 5. Health Check
    app.get("/", (req, res) => {
      res.send("PassItOn API is active and healthy.");
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Critical Server Error:", error);
    process.exit(1);
  }
};

startServer();