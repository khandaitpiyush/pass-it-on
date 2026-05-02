import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    roomId: {
      type:     String,
      required: true,
      unique:   true,
    },
    // Both participant userIds — used to query "all chats for user X"
    participants: {
      type:     [String],
      required: true,
    },
    lastMessage: {
      text:      { type: String, default: "" },
      senderId:  { type: String, default: "" },
      timestamp: { type: Date,   default: Date.now },
    },
    updatedAt: {
      type:    Date,
      default: Date.now,
      index:   true,
    },
  },
  { versionKey: false }
);

// Primary query: all conversations a user is part of, newest first
conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;