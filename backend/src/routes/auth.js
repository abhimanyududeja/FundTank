import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fundtank_secret_key_2026";
const STARTING_BUDGET = 100000;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const db = getDB();
    const { username, email, password, displayName, strategy, riskPreference } =
      req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing = await db
      .collection("users")
      .findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      username,
      email,
      password: hashedPassword,
      displayName,
      strategy: strategy || "",
      riskPreference: riskPreference || "moderate",
      budget: STARTING_BUDGET,
      totalInvested: 0,
      totalReturns: 0,
      successfulPicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(user);
    const token = jwt.sign(
      { userId: result.insertedId, username, displayName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: { ...safeUser, _id: result.insertedId } });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        displayName: user.displayName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) return res.status(404).json({ error: "User not found" });

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
