import Message      from "../../models/Message.js";
import Conversation from "../../models/Conversation.js";
import { analyzeMessage } from "../../utils/scamDetector.js";

const sessionScanCache = new Map();

function hashText(text) {
  let h = 0;
  for (const c of text) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return String(h);
}

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

function handleJoinRoom(socket) {
  socket.on("join_room", (roomId) => {
    if (!roomId || !isUserInRoom(roomId, socket.userId)) {
      socket.emit("error", { message: "Unauthorized room access" });
      return;
    }
    for (const room of socket.rooms) {
      if (room !== socket.id) socket.leave(room);
    }
    socket.join(roomId);
    socket.currentRoom = roomId;
    console.log(`[ROOM] ${socket.userId} joined ${roomId}`);
  });
}

async function handleSendMessage(io, socket) {
  socket.on("send_message", async (data) => {
    const { roomId, senderId, text: rawText, idempotencyKey } = data || {};

    // ── 1. Validate ──────────────────────────────────────────────────────
    const text = sanitiseText(rawText);

    if (!text) {
      socket.emit("message_error", { idempotencyKey, code: "INVALID_TEXT" });
      return;
    }

    if (!idempotencyKey || typeof idempotencyKey !== "string") {
      socket.emit("message_error", { code: "INVALID_KEY" });
      return;
    }

    // ── 2. Security ──────────────────────────────────────────────────────
    if (senderId !== socket.userId || !isUserInRoom(roomId, socket.userId)) {
      socket.emit("message_error", { idempotencyKey, code: "FORBIDDEN" });
      return;
    }

    // ── 3. Scam detection ────────────────────────────────────────────────
    // Result is always { risk: 'safe' | 'warn', category, reason }
    // Messages are NEVER blocked — always saved and delivered.
    // Buyer sees an amber warning banner for 'warn' messages.
    const cache    = sessionScanCache.get(socket.id) ?? new Map();
    const cacheKey = hashText(text);
    let scanResult = cache.get(cacheKey);

    if (!scanResult) {
      try {
        scanResult = await analyzeMessage(text);
        console.log(`[SCAM] result for "${text}":`, JSON.stringify(scanResult));
      } catch (err) {
        console.error(`[SCAM] analyzeMessage threw:`, err);
        scanResult = { risk: "safe", category: null, reason: null };
      }
      cache.set(cacheKey, scanResult);
    } else {
      console.log(`[SCAM] Cache hit for: "${text}" →`, JSON.stringify(scanResult));
    }

    // ── 4. Persist and broadcast ─────────────────────────────────────────
    try {
      const saved = await Message.findOneAndUpdate(
        { idempotencyKey },
        {
          $setOnInsert: {
            roomId, senderId, text, idempotencyKey,
            timestamp: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" }
      ).lean();

      await Conversation.findOneAndUpdate(
        { roomId },
        {
          $set: {
            participants: roomId.split("_"),
            lastMessage: {
              text:      saved.text,
              senderId:  saved.senderId,
              timestamp: saved.timestamp,
            },
            updatedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      const base = {
        _id:            saved._id.toString(),
        idempotencyKey: saved.idempotencyKey,
        roomId:         saved.roomId,
        senderId:       saved.senderId,
        text:           saved.text,
        timestamp:      saved.timestamp.toISOString(),
      };

      // scan payload only for warn — buyer sees the amber banner
      const scanPayload = scanResult.risk === "warn"
        ? { risk: "warn", category: scanResult.category, reason: scanResult.reason }
        : null;

      // Sender: ack with no scan info — sender never sees any banner
      socket.emit("message_ack", {
        _id:            base._id,
        idempotencyKey: base.idempotencyKey,
        timestamp:      base.timestamp,
        scan:           null,
      });

      // Buyer: receives the message + scan payload for warn banner
      socket.to(roomId).emit("receive_message", {
        ...base,
        scan: scanPayload,
      });

      if (scanResult.risk === "warn") {
        console.warn(`[SCAM] WARN user=${socket.userId} room=${roomId} category=${scanResult.category}`);
      }

    } catch (err) {
      console.error("[ERROR] send_message:", err);
      socket.emit("message_error", { idempotencyKey, code: "DB_ERROR" });
    }
  });
}

function handleDisconnect(socket) {
  socket.on("disconnect", () => {
    console.log(`[SOCKET] Disconnected ${socket.id}`);
    sessionScanCache.get(socket.id)?.clear();
    sessionScanCache.delete(socket.id);
  });
}

export const registerChatHandlers = (io, socket) => {
  sessionScanCache.set(socket.id, new Map());
  handleJoinRoom(socket);
  handleSendMessage(io, socket);
  handleDisconnect(socket);
};