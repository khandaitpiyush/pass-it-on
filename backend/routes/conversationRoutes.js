import express from "express";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Auth Middleware
// ─────────────────────────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
try {
const header = req.headers.authorization ?? "";
const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

```
if (!token) return res.status(401).json({ error: "AUTH_MISSING" });

const payload = jwt.verify(token, process.env.JWT_SECRET);
req.userId = payload.userId ?? payload._id ?? payload.id;

if (!req.userId) return res.status(401).json({ error: "AUTH_INVALID" });

next();
```

} catch {
return res.status(401).json({ error: "AUTH_INVALID" });
}
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/conversations
// ─────────────────────────────────────────────────────────────────────────────

router.get("/", requireAuth, async (req, res) => {
try {
const limit = Math.min(parseInt(req.query.limit) || 20, 50);

```
const query = {
  participants: req.userId,
};

if (req.query.cursor) {
  query.updatedAt = { $lt: new Date(req.query.cursor) };
}

const conversations = await Conversation.find(query)
  .select("roomId participants lastMessage updatedAt")
  .sort({ updatedAt: -1 })
  .limit(limit)
  .lean();

const shaped = conversations.map((c) => {
  const otherUserId =
    c.participants.length === 2
      ? c.participants.find((p) => p !== req.userId)
      : null;

  return {
    roomId: c.roomId,
    participants: c.participants,
    otherUserId,

    lastMessage: {
      text: c.lastMessage?.text ?? "",
      senderId: c.lastMessage?.senderId ?? "",
      timestamp: c.lastMessage?.timestamp
        ? new Date(c.lastMessage.timestamp).toISOString()
        : null,
    },

    updatedAt: c.updatedAt
      ? new Date(c.updatedAt).toISOString()
      : null,
  };
});

return res.json({
  conversations: shaped,
  nextCursor:
    conversations.length === limit
      ? conversations[conversations.length - 1].updatedAt
      : null,
});
```

} catch (err) {
console.error("[API] GET /conversations error:", err);
return res.status(500).json({ error: "SERVER_ERROR" });
}
});

export default router;
