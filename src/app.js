import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";

dotenv.config();

// Increase payload size limit (e.g., 10MB)
app.use(express.json({ limit: "10mb" })); // For JSON payloads
app.use(express.urlencoded({ limit: "10mb", extended: true })); // For URL-encoded payloads

app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://chat-app-free.vercel.app", // Production
  "https://chat-app-free-qhpv2fdce-chandrashekhar-patils-projects.vercel.app" // New frontend deployment
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware to set CORS headers (additional safeguard)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  connectDB(); // Connect to MongoDB
});
