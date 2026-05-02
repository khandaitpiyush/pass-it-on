import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

const router = express.Router();

// ─── Auth middleware ──────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization ?? "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "AUTH_MISSING" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId ?? payload._id ?? payload.id;

    if (!req.userId) return res.status(401).json({ error: "AUTH_INVALID" });
    next();
  } catch {
    return res.status(401).json({ error: "AUTH_INVALID" });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isUserInRoom(roomId, userId) {
  const parts = roomId.split("_");
  return parts.length === 2 && parts.includes(userId);
}

// ─── GET /api/messages ────────────────────────────────────────────────────────
// Returns all chat rooms the logged-in user participates in,
// with the last message preview and the other participant's ID.
// MUST be defined before /:roomId so Express doesn't treat "rooms" as a param.

router.get("/", requireAuth, async (req, res) => {
  try {
    const rooms = await Message.aggregate([
      {
        $match: {
          roomId: { $regex: req.userId, $options: "i" },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id:           "$roomId",
          lastMessage:   { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" },
          lastSenderId:  { $first: "$senderId" },
        },
      },
      {
        $sort: { lastTimestamp: -1 },
      },
    ]);

    const result = rooms.map((r) => {
      const parts   = r._id.split("_");
      const otherId = parts.find((p) => p !== req.userId) ?? parts[0];
      return {
        roomId:        r._id,
        otherId,
        lastMessage:   r.lastMessage,
        lastTimestamp: r.lastTimestamp,
        lastSenderId:  r.lastSenderId,
      };
    });

    return res.json({ rooms: result });
  } catch (err) {
    console.error("[API] GET /messages error:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ─── GET /api/messages/:roomId ────────────────────────────────────────────────
// Query params:
//   limit  — messages per page (default 50, max 100)
//   before — _id cursor; if provided, returns messages older than this id
//
// Response:
//   { messages, hasMore, nextCursor }

router.get("/:roomId", requireAuth, async (req, res) => {
  try {
    const { roomId } = req.params;

    if (typeof roomId !== "string" || !roomId) {
      return res.status(400).json({ error: "INVALID_ROOM" });
    }

    if (!isUserInRoom(roomId, req.userId)) {
      return res.status(403).json({ error: "FORBIDDEN" });
    }

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));

    const filter = { roomId };

    if (req.query.before) {
      if (!mongoose.Types.ObjectId.isValid(req.query.before)) {
        return res.status(400).json({ error: "INVALID_CURSOR" });
      }
      filter._id = { $lt: new mongoose.Types.ObjectId(req.query.before) };
    }

    // Fetch limit+1 to know if more pages exist — no extra COUNT query needed
    const raw     = await Message.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const hasMore = raw.length > limit;
    const page    = (hasMore ? raw.slice(0, limit) : raw).reverse(); // oldest → newest

    const messages = page.map((m) => ({
      _id:            m._id.toString(),
      idempotencyKey: m.idempotencyKey,
      roomId:         m.roomId,
      senderId:       m.senderId,
      text:           m.text,
      timestamp:      m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }));

    return res.json({
      messages,
      hasMore,
      nextCursor: hasMore && messages.length > 0 ? messages[0]._id : null,
    });
  } catch (err) {
    console.error("[API] GET /messages error:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;