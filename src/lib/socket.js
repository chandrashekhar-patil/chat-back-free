import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "https://chat-app-free.vercel.app", // Allow requests from frontend
    methods: ["GET", "POST"], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers)
  },
});

// Function to get the socket ID of a receiver by user ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Object to store online users: { userId: [socketId1, socketId2, ...] }
const userSocketMap = {};

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Extract userId from the handshake query
  const userId = String(socket.handshake.query.userId); // Ensure userId is a string

  // Add the user to the userSocketMap if userId is valid
  if (userId && userId !== "undefined") {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = []; // Initialize array if it doesn't exist
    }
    userSocketMap[userId].push(socket.id); // Add socket ID to the user's list
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users list
  }

  // Handle socket disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    // Remove the disconnected socket ID from the userSocketMap
    for (const [key, value] of Object.entries(userSocketMap)) {
      userSocketMap[key] = value.filter((id) => id !== socket.id); // Filter out the disconnected socket ID
      if (userSocketMap[key].length === 0) {
        delete userSocketMap[key]; // Remove the user if no sockets are left
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit updated online users list
  });

  // Handle custom events (if needed)
  socket.on("customEvent", (data) => {
    console.log("Received custom event:", data);
    // Handle the event and emit a response if necessary
    socket.emit("customEventResponse", { message: "Event received!" });
  });
});

// Error handling for Socket.IO
io.on("connection_error", (err) => {
  console.error("Socket connection error:", err);
});

// Export the necessary variables
export { io, app, server };
