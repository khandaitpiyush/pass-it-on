import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import { seedCampuses } from "./utils/seedCampuses.js";

dotenv.config();

const startServer = async () => {
  try {
    // 1. Database Connection
    await connectDB();
    console.log("✅ MongoDB Connected");

    // 2. Initial Data Seeding
    await seedCampuses();

    const app = express();

    // 3. Create HTTP server and attach Socket.io
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // 4. Middleware
    app.use(cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      credentials: true
    }));

    app.use(express.json({ limit: "10mb" })); // 10mb for base64 images
    app.use(cookieParser());

    // 5. API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/listings", listingRoutes);

    // 6. Health Check
    app.get("/", (req, res) => {
      res.send("PassItOn API is active and healthy.");
    });

    // 7. Socket.io — real-time chat
    io.on("connection", (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Each conversation has a deterministic room ID:
      // [userId, sellerId].sort().join('_')
      // Same room regardless of who initiates the chat
      socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`📦 Socket ${socket.id} joined room: ${roomId}`);
      });

      socket.on("send_message", (data) => {
        // Broadcast to everyone in the room including sender
        // Frontend deduplicates using message ID
        io.to(data.roomId).emit("receive_message", data);
      });

      socket.on("disconnect", () => {
        console.log(`❌ Socket disconnected: ${socket.id}`);
      });
    });

    // 8. Start server — use httpServer not app.listen
    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Critical Server Error:", error);
    process.exit(1);
  }
};

startServer();