import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import { analyzeMessage } from "../utils/scamDetector.js";

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

// How many recent messages from the OTHER person to scan on history load.
// Keep low to avoid Groq rate limits — 5 is enough for demo purposes.
const SCAN_LAST_N = 5;

// ─── GET /api/messages ────────────────────────────────────────────────────────

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
//
// On the first page load (no cursor), the last SCAN_LAST_N messages sent by
// the OTHER person are scanned via Groq and returned with a scan field so the
// buyer sees the warning banner even if they weren't online when it was sent.

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
    const isFirstPage = !req.query.before;

    const filter = { roomId };

    if (req.query.before) {
      if (!mongoose.Types.ObjectId.isValid(req.query.before)) {
        return res.status(400).json({ error: "INVALID_CURSOR" });
      }
      filter._id = { $lt: new mongoose.Types.ObjectId(req.query.before) };
    }

    // Fetch limit+1 to know if more pages exist
    const raw     = await Message.find(filter).sort({ _id: -1 }).limit(limit + 1).lean();
    const hasMore = raw.length > limit;
    const page    = (hasMore ? raw.slice(0, limit) : raw).reverse(); // oldest → newest

    // ── Scan recent messages from the other person (first page only) ─────────
    // Build a map of idempotencyKey → scanResult for messages we scan
    const scanMap = new Map();

    if (isFirstPage) {
      // Get the last SCAN_LAST_N messages sent by the OTHER person
      const othersMessages = page
        .filter((m) => m.senderId !== req.userId)
        .slice(-SCAN_LAST_N);

      // Run scans in parallel — Groq is fast enough for 5 messages
      await Promise.all(
        othersMessages.map(async (m) => {
          try {
            const result = await analyzeMessage(m.text);
            if (result.risk === "warn") {
              scanMap.set(m.idempotencyKey, result);
              console.log(`[SCAM] History scan WARN for "${m.text}":`, JSON.stringify(result));
            }
          } catch (err) {
            console.error(`[SCAM] History scan error for msg ${m._id}:`, err.message);
          }
        })
      );
    }

    // ── Shape response ────────────────────────────────────────────────────────
    const messages = page.map((m) => ({
      _id:            m._id.toString(),
      idempotencyKey: m.idempotencyKey,
      roomId:         m.roomId,
      senderId:       m.senderId,
      text:           m.text,
      timestamp:      m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
      scan:           scanMap.get(m.idempotencyKey) ?? null,
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