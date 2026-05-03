import "./config/env.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import { seedCampuses } from "./utils/seedCampuses.js";
import { initSocket } from "./socket/index.js";

// Routes
import authRoutes         from "./routes/authRoutes.js";
import listingRoutes      from "./routes/listingRoutes.js";
import messageRoutes      from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

dotenv.config();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://pass-it-on-piyush.netlify.app",
];

const startServer = async () => {
  try {
    await connectDB();
    console.log("[DB] MongoDB Connected");

    await seedCampuses();

    const app        = express();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin:      ALLOWED_ORIGINS,
        methods:     ["GET", "POST"],
        credentials: true,
      },
    });

    /* ── Middleware ─────────────────────────────────────────────────────── */

    app.use(cors({
      origin:      ALLOWED_ORIGINS,
      credentials: true,
    }));
    app.use(express.json());
    app.use(cookieParser());

    /* ── REST Routes ────────────────────────────────────────────────────── */

    app.use("/api/auth",          authRoutes);
    app.use("/api/listings",      listingRoutes);
    app.use("/api/messages",      messageRoutes);
    app.use("/api/conversations", conversationRoutes);

    app.get("/", (_req, res) => res.send("API running"));

    /* ── Socket.io ──────────────────────────────────────────────────────── */

    initSocket(io);

    /* ── Start ──────────────────────────────────────────────────────────── */

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`);
    });

  } catch (err) {
    console.error("[FATAL]", err);
    process.exit(1);
  }
};

startServer();