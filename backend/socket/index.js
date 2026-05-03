import jwt from "jsonwebtoken";
import { registerChatHandlers } from "./handlers/chatHandler.js";

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

export const initSocket = (io) => {          // ← make sure `export` is here
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Connected ${socket.id} user=${socket.userId}`);
    registerChatHandlers(io, socket);
  });
};