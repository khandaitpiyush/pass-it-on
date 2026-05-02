/**
 * chatSocket.js
 *
 * Registers all Socket.io event handlers for the chat feature.
 * Call this once from your main server file:
 *
 *   const { registerChatSocket } = require('./chatSocket');
 *   registerChatSocket(io);
 */

const jwt     = require('jsonwebtoken');
const Message = require('../models/Message');

// ─── Auth middleware ──────────────────────────────────────────────────────────

/**
 * Validates the JWT sent in socket.handshake.auth.token.
 * Attaches userId to the socket instance for use in all handlers.
 * Rejects the connection if the token is missing or invalid.
 */
function authMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('AUTH_MISSING'));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId ?? payload._id ?? payload.id;

    if (!socket.userId) return next(new Error('AUTH_INVALID'));

    next();
  } catch (err) {
    next(new Error('AUTH_INVALID'));
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * A roomId is always two sorted userIds joined by '_'.
 * Validates that the connecting socket's userId is actually one of the
 * two participants, preventing room ID spoofing.
 */
function isUserInRoom(roomId, userId) {
  const parts = roomId.split('_');
  return parts.length === 2 && parts.includes(userId);
}

/**
 * Trims and sanitises message text.
 * Returns null if the result is empty or too long.
 */
function sanitiseText(raw) {
  if (typeof raw !== 'string') return null;
  const text = raw.trim();
  if (!text || text.length > 2000) return null;
  return text;
}

// ─── Main export ──────────────────────────────────────────────────────────────

function registerChatSocket(io) {
  // Apply auth middleware to every incoming connection
  io.use(authMiddleware);

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id} (user: ${socket.userId})`);

    // ── join_room ────────────────────────────────────────────────────────────
    /**
     * Client emits this after connecting to enter a chat room.
     * We validate that the user belongs to the room before joining.
     */
    socket.on('join_room', async (roomId) => {
      // Guard: roomId must be a valid string
      if (typeof roomId !== 'string' || !roomId) return;

      // Guard: user must be a participant in this room
      if (!isUserInRoom(roomId, socket.userId)) {
        console.warn(`[Socket] User ${socket.userId} tried to join room ${roomId} — not a participant`);
        socket.emit('error', { code: 'FORBIDDEN', message: 'You are not part of this room.' });
        return;
      }

      // Leave any previously joined rooms (except the socket's own room)
      for (const room of socket.rooms) {
        if (room !== socket.id) socket.leave(room);
      }

      socket.join(roomId);
      socket.currentRoom = roomId;

      console.log(`[Socket] User ${socket.userId} joined room ${roomId}`);

      // History is loaded via REST (GET /api/messages/:roomId), not here.
      // Socket is only for real-time delivery of new messages.
    });

    // ── send_message ─────────────────────────────────────────────────────────
    /**
     * Client emits this to send a new message.
     *
     * Expected payload:
     *   { roomId, senderId, text, idempotencyKey }
     *
     * Flow:
     *   1. Validate all fields
     *   2. Confirm sender matches authenticated userId (prevent spoofing)
     *   3. Upsert to DB using idempotencyKey (handles retries gracefully)
     *   4. Emit ack back to sender with real _id + server timestamp
     *   5. Broadcast to the OTHER socket(s) in the room
     */
    socket.on('send_message', async (data) => {
      const { roomId, senderId, text: rawText, idempotencyKey } = data ?? {};

      // ── Validate ────────────────────────────────────────────────────────
      const text = sanitiseText(rawText);

      if (!text) {
        socket.emit('message_error', {
          idempotencyKey,
          code:    'INVALID_TEXT',
          message: 'Message text is empty or too long.',
        });
        return;
      }

      if (!idempotencyKey || typeof idempotencyKey !== 'string') {
        socket.emit('message_error', {
          idempotencyKey,
          code:    'INVALID_KEY',
          message: 'Missing idempotency key.',
        });
        return;
      }

      // ── Security: sender must match authenticated user ───────────────────
      if (senderId !== socket.userId) {
        console.warn(`[Socket] senderId mismatch: claimed ${senderId}, auth is ${socket.userId}`);
        socket.emit('message_error', {
          idempotencyKey,
          code:    'FORBIDDEN',
          message: 'Sender ID does not match authenticated user.',
        });
        return;
      }

      // ── Security: user must be in the room they're sending to ────────────
      if (!isUserInRoom(roomId, socket.userId)) {
        socket.emit('message_error', {
          idempotencyKey,
          code:    'FORBIDDEN',
          message: 'You are not part of this room.',
        });
        return;
      }

      // ── Save to DB ───────────────────────────────────────────────────────
      try {
        /**
         * findOneAndUpdate with upsert on idempotencyKey:
         * - First call: creates the document
         * - Retry call (same key): finds the existing doc and returns it
         * - Result: identical ack sent back → client deduplicates in UI
         */
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
          {
            upsert:         true,
            new:            true,
            runValidators:  true,
          }
        ).lean();

        const responsePayload = {
          _id:            saved._id.toString(),
          idempotencyKey: saved.idempotencyKey,
          roomId:         saved.roomId,
          senderId:       saved.senderId,
          text:           saved.text,
          timestamp:      saved.timestamp.toISOString(),
        };

        // ── Ack to sender ────────────────────────────────────────────────
        // Sent only to the sender's socket — confirms DB write succeeded
        socket.emit('message_ack', {
          _id:            responsePayload._id,
          idempotencyKey: responsePayload.idempotencyKey,
          timestamp:      responsePayload.timestamp,
        });

        // ── Broadcast to others in the room ──────────────────────────────
        // socket.to() excludes the sender — they already have the message
        socket.to(roomId).emit('receive_message', responsePayload);

      } catch (err) {
        console.error('[Socket] send_message DB error:', err);
        socket.emit('message_error', {
          idempotencyKey,
          code:    'DB_ERROR',
          message: 'Failed to save message. Please retry.',
        });
      }
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id} (user: ${socket.userId}) — ${reason}`);
    });

    // ── Catch unexpected errors on the socket ────────────────────────────────
    socket.on('error', (err) => {
      console.error(`[Socket] Error on ${socket.id}:`, err);
    });
  });
}

module.exports = { registerChatSocket };