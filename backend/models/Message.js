import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type:     String,
      required: true,
      index:    true,
    },
    senderId: {
      type:     String,
      required: true,
    },
    text: {
      type:      String,
      required:  true,
      maxlength: 2000,
    },
    /**
     * Client-generated key used for idempotent saves.
     * If the client retries a send, the server upserts on this key
     * instead of creating a duplicate message.
     */
    idempotencyKey: {
      type:     String,
      required: true,
      unique:   true,
    },
    timestamp: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Primary query: all messages in a room ordered by time
messageSchema.index({ roomId: 1, timestamp: 1 });

// Cursor pagination: messages before a given timestamp
messageSchema.index({ roomId: 1, timestamp: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;