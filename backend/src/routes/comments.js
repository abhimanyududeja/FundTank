// Author: Abhimanyu Dudeja
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";
import { authMiddleware, optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/comments/pitch/:pitchId - Get all comments for a pitch
router.get("/pitch/:pitchId", optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.pitchId)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }

    const comments = await db
      .collection("comments")
      .find({ pitchId: new ObjectId(req.params.pitchId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/comments - Create a comment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { pitchId, text, parentId } = req.body;

    if (!pitchId || !text) {
      return res.status(400).json({ error: "Pitch ID and text are required" });
    }
    if (!ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }

    // Verify pitch exists
    const pitch = await db.collection("pitches").findOne({ _id: new ObjectId(pitchId) });
    if (!pitch) {
      return res.status(404).json({ error: "Pitch not found" });
    }

    const comment = {
      pitchId: new ObjectId(pitchId),
      pitchName: pitch.name,
      authorId: new ObjectId(req.user.userId),
      authorName: req.user.displayName,
      text: text.trim(),
      parentId: parentId ? new ObjectId(parentId) : null,
      isAuthorReply: pitch.authorId.toString() === req.user.userId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("comments").insertOne(comment);
    res.status(201).json({ ...comment, _id: result.insertedId });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/comments/:id - Edit a comment
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { text: text.trim(), updatedAt: new Date() } }
      );

    const updated = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/comments/:id - Delete a comment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    const comment = await db
      .collection("comments")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    if (comment.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await db.collection("comments").deleteOne({ _id: new ObjectId(req.params.id) });

    // Also delete replies to this comment
    await db.collection("comments").deleteMany({ parentId: new ObjectId(req.params.id) });

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
