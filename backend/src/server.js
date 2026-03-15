// Authors: Abhimanyu Dudeja, Kashish Rahulbhai Khatri
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import pitchRoutes from "./routes/pitches.js";
import investmentRoutes from "./routes/investments.js";
import userRoutes from "./routes/users.js";
import commentRoutes from "./routes/comments.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - manual CORS (no cors library)
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3001",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/pitches", pitchRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// Serve static frontend in production
const frontendPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendPath));
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

// Start server
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`FundTank server running on port ${PORT}`);
  });
}

start();
