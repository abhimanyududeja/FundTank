import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/users/leaderboard - Investor leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const db = getDB();
    const users = await db
      .collection("users")
      .find({})
      .project({ password: 0 })
      .sort({ totalReturns: -1, successfulPicks: -1 })
      .limit(20)
      .toArray();
    res.json(users);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/:id - View user profile
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.params.id) },
        { projection: { password: 0 } }
      );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/profile - Update own profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { displayName, strategy, riskPreference } = req.body;
    const updates = { updatedAt: new Date() };

    if (displayName) updates.displayName = displayName;
    if (strategy !== undefined) updates.strategy = strategy;
    if (riskPreference) updates.riskPreference = riskPreference;

    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.user.userId) },
        { $set: updates }
      );

    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(req.user.userId) },
        { projection: { password: 0 } }
      );
    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
