import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/pitches - Browse all pitches with filters
router.get("/", optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    const { category, sort, search, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "funding") sortOption = { totalFunding: -1 };
    if (sort === "votes") sortOption = { fundVotes: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await db.collection("pitches").countDocuments(filter);
    const pitches = await db
      .collection("pitches")
      .find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.json({
      pitches,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get pitches error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/pitches/leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    const db = getDB();
    const pitches = await db
      .collection("pitches")
      .find({})
      .sort({ totalFunding: -1, fundVotes: -1 })
      .limit(20)
      .toArray();
    res.json(pitches);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/pitches/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }
    const pitch = await db
      .collection("pitches")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    res.json(pitch);
  } catch (error) {
    console.error("Get pitch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/pitches - Create a pitch
router.post("/", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { name, description, category, budgetBreakdown, fundingGoal, tagline } =
      req.body;

    if (!name || !description || !category || !fundingGoal) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const pitch = {
      name,
      description,
      tagline: tagline || "",
      category,
      budgetBreakdown: budgetBreakdown || {},
      fundingGoal: parseFloat(fundingGoal),
      totalFunding: 0,
      fundVotes: 0,
      passVotes: 0,
      voters: [],
      authorId: new ObjectId(req.user.userId),
      authorName: req.user.displayName,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("pitches").insertOne(pitch);
    res.status(201).json({ ...pitch, _id: result.insertedId });
  } catch (error) {
    console.error("Create pitch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/pitches/:id - Update a pitch
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }
    const pitch = await db
      .collection("pitches")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    if (pitch.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { name, description, category, budgetBreakdown, fundingGoal, tagline } =
      req.body;
    const updates = {
      ...(name && { name }),
      ...(description && { description }),
      ...(tagline !== undefined && { tagline }),
      ...(category && { category }),
      ...(budgetBreakdown && { budgetBreakdown }),
      ...(fundingGoal && { fundingGoal: parseFloat(fundingGoal) }),
      updatedAt: new Date(),
    };

    await db
      .collection("pitches")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    const updated = await db
      .collection("pitches")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Update pitch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/pitches/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }
    const pitch = await db
      .collection("pitches")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    if (pitch.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.collection("pitches").deleteOne({ _id: new ObjectId(req.params.id) });

    // Also remove related investments
    await db
      .collection("investments")
      .deleteMany({ pitchId: new ObjectId(req.params.id) });

    res.json({ message: "Pitch deleted successfully" });
  } catch (error) {
    console.error("Delete pitch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/pitches/:id/vote - Vote fund or pass
router.post("/:id/vote", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { vote } = req.body; // "fund" or "pass"
    if (!["fund", "pass"].includes(vote)) {
      return res.status(400).json({ error: "Vote must be 'fund' or 'pass'" });
    }

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }
    const pitch = await db
      .collection("pitches")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });

    const userId = req.user.userId.toString();
    const alreadyVoted = pitch.voters.some((v) => v.userId.toString() === userId);
    if (alreadyVoted) {
      return res.status(409).json({ error: "Already voted on this pitch" });
    }

    const update = {
      $push: { voters: { userId: new ObjectId(userId), vote, votedAt: new Date() } },
      $inc: vote === "fund" ? { fundVotes: 1 } : { passVotes: 1 },
    };

    await db
      .collection("pitches")
      .updateOne({ _id: new ObjectId(req.params.id) }, update);
    const updated = await db
      .collection("pitches")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
