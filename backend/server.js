import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

// Models
import Message from "./models/Message.js";
import Conversation from "./models/Conversation.js";

import { seedCampuses } from "./utils/seedCampuses.js";

dotenv.config();

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function isUserInRoom(roomId, userId) {
  const parts = roomId.split("_");
  return parts.length === 2 && parts.includes(userId);
}

function sanitiseText(raw) {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text || text.length > 2000) return null;
  return text;
}

/* -------------------------------------------------------------------------- */
/* Socket Auth                                                                 */
/* -------------------------------------------------------------------------- */

function socketAuthMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("AUTH_MISSING"));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId ?? payload._id ?? payload.id;

    if (!socket.userId) return next(new Error("AUTH_INVALID"));

    next();
  } catch {
    next(new Error("AUTH_INVALID"));
  }
}

/* -------------------------------------------------------------------------- */
/* Server                                                                      */
/* -------------------------------------------------------------------------- */

const startServer = async () => {
  try {
    await connectDB();
    console.log("[DB] MongoDB Connected");

    await seedCampuses();

    const app = express();
    const httpServer = createServer(app);

    const io = new Server(httpServer, {
      cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    /* ------------------------------- Middleware ------------------------------ */

    app.use(cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    }));

    app.use(express.json());
    app.use(cookieParser());

    /* -------------------------------- Routes -------------------------------- */

    app.use("/api/auth", authRoutes);
    app.use("/api/listings", listingRoutes);
    app.use("/api/messages", messageRoutes);
    app.use("/api/conversations", conversationRoutes);

    app.get("/", (_req, res) => {
      res.send("API running");
    });

    /* ------------------------------- Socket.io ------------------------------- */

    io.use(socketAuthMiddleware);

    io.on("connection", (socket) => {
      console.log(`[SOCKET] Connected ${socket.id} user=${socket.userId}`);

      /* ------------------------------ JOIN ROOM ------------------------------ */

      socket.on("join_room", (roomId) => {
        if (!roomId || !isUserInRoom(roomId, socket.userId)) {
          socket.emit("error", { message: "Unauthorized room access" });
          return;
        }

        // leave previous rooms
        for (const room of socket.rooms) {
          if (room !== socket.id) socket.leave(room);
        }

        socket.join(roomId);
        socket.currentRoom = roomId;

        console.log(`[ROOM] Joined ${roomId}`);
      });

      /* ----------------------------- SEND MESSAGE ---------------------------- */

      socket.on("send_message", async (data) => {
        const { roomId, senderId, text: rawText, idempotencyKey } = data || {};

        const text = sanitiseText(rawText);

        if (!text) {
          socket.emit("message_error", { idempotencyKey, code: "INVALID_TEXT" });
          return;
        }

        if (!idempotencyKey || typeof idempotencyKey !== "string") {
          socket.emit("message_error", { code: "INVALID_KEY" });
          return;
        }

        if (senderId !== socket.userId || !isUserInRoom(roomId, socket.userId)) {
          socket.emit("message_error", { idempotencyKey, code: "FORBIDDEN" });
          return;
        }

        try {
          // Save message (idempotent)
          const saved = await Message.findOneAndUpdate(
            { idempotencyKey },
            {
              $setOnInsert: {
                roomId,
                senderId,
                text,
                idempotencyKey,
                timestamp: new Date(),
              },
            },
            { upsert: true, new: true }
          ).lean();

          const participants = roomId.split("_");

          // Update conversation
          await Conversation.findOneAndUpdate(
            { roomId },
            {
              $set: {
                participants,
                lastMessage: {
                  text: saved.text,
                  senderId: saved.senderId,
                  timestamp: saved.timestamp,
                },
                updatedAt: new Date(),
              },
            },
            { upsert: true, new: true }
          );

          const payload = {
            _id: saved._id.toString(),
            idempotencyKey: saved.idempotencyKey,
            roomId: saved.roomId,
            senderId: saved.senderId,
            text: saved.text,
            timestamp: saved.timestamp.toISOString(),
          };

          // ACK to sender
          socket.emit("message_ack", {
            _id: payload._id,
            idempotencyKey: payload.idempotencyKey,
            timestamp: payload.timestamp,
          });

          // Send to others
          socket.to(roomId).emit("receive_message", payload);

        } catch (err) {
          console.error("[ERROR] Message:", err);
          socket.emit("message_error", {
            idempotencyKey,
            code: "DB_ERROR",
          });
        }
      });

      /* ------------------------------ DISCONNECT ----------------------------- */

      socket.on("disconnect", () => {
        console.log(`[SOCKET] Disconnected ${socket.id}`);
      });
    });

    /* -------------------------------- Start -------------------------------- */

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