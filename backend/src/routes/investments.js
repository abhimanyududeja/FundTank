// Author: Abhimanyu Dudeja
import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// GET /api/investments - Get current user's investments (portfolio)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const investments = await db
      .collection("investments")
      .find({ investorId: new ObjectId(req.user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with pitch data
    const enriched = await Promise.all(
      investments.map(async (inv) => {
        const pitch = await db.collection("pitches").findOne({ _id: inv.pitchId });
        return { ...inv, pitch: pitch || { name: "Deleted Pitch", status: "deleted" } };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get investments error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/investments/user/:userId - View any user's portfolio
router.get("/user/:userId", async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const investments = await db
      .collection("investments")
      .find({ investorId: new ObjectId(req.params.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const enriched = await Promise.all(
      investments.map(async (inv) => {
        const pitch = await db.collection("pitches").findOne({ _id: inv.pitchId });
        return { ...inv, pitch: pitch || { name: "Deleted Pitch", status: "deleted" } };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get user investments error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/investments/analytics/summary - Portfolio analytics for current user
router.get("/analytics/summary", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const investments = await db
      .collection("investments")
      .find({ investorId: new ObjectId(req.user.userId) })
      .toArray();

    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    const totalEstimatedReturns = investments.reduce(
      (sum, i) => sum + i.estimatedReturn,
      0
    );
    const categoryBreakdown = {};
    for (const inv of investments) {
      const pitch = await db.collection("pitches").findOne({ _id: inv.pitchId });
      if (pitch) {
        const cat = pitch.category || "Other";
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + inv.amount;
      }
    }

    res.json({
      totalInvestments: investments.length,
      totalInvested,
      totalEstimatedReturns,
      roi:
        totalInvested > 0
          ? (((totalEstimatedReturns - totalInvested) / totalInvested) * 100).toFixed(2)
          : 0,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/investments/:id - Get single investment
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid investment ID" });
    }
    const investment = await db
      .collection("investments")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!investment) return res.status(404).json({ error: "Investment not found" });
    res.json(investment);
  } catch (error) {
    console.error("Get investment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/investments - Invest in a startup
router.post("/", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    const { pitchId, amount, notes } = req.body;

    if (!pitchId || !amount) {
      return res.status(400).json({ error: "Pitch ID and amount required" });
    }
    if (!ObjectId.isValid(pitchId)) {
      return res.status(400).json({ error: "Invalid pitch ID" });
    }

    const investAmount = parseFloat(amount);
    if (investAmount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }

    // Check pitch exists and is active
    const pitch = await db.collection("pitches").findOne({ _id: new ObjectId(pitchId) });
    if (!pitch) return res.status(404).json({ error: "Pitch not found" });
    if (pitch.status !== "active") {
      return res.status(400).json({ error: "Pitch is not accepting investments" });
    }

    // Can't invest in own pitch
    if (pitch.authorId.toString() === req.user.userId.toString()) {
      return res.status(400).json({ error: "Cannot invest in your own pitch" });
    }

    // Check user budget
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user.userId) });
    const availableBudget = user.budget - user.totalInvested;
    if (investAmount > availableBudget) {
      return res.status(400).json({
        error: `Insufficient budget. Available: $${availableBudget.toLocaleString()}`,
      });
    }

    // Calculate returns based on pitch performance
    const fundRatio =
      pitch.fundVotes + pitch.passVotes > 0
        ? pitch.fundVotes / (pitch.fundVotes + pitch.passVotes)
        : 0.5;
    const fundingProgress = pitch.totalFunding / pitch.fundingGoal;
    const returnMultiplier = 1 + fundRatio * 0.5 + (fundingProgress > 1 ? 0.3 : 0);

    const investment = {
      investorId: new ObjectId(req.user.userId),
      investorName: req.user.displayName,
      pitchId: new ObjectId(pitchId),
      pitchName: pitch.name,
      amount: investAmount,
      notes: notes || "",
      returnMultiplier,
      estimatedReturn: investAmount * returnMultiplier,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("investments").insertOne(investment);

    // Update user's total invested
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.user.userId) },
        { $inc: { totalInvested: investAmount } }
      );

    // Update pitch's total funding
    await db
      .collection("pitches")
      .updateOne(
        { _id: new ObjectId(pitchId) },
        { $inc: { totalFunding: investAmount } }
      );

    res.status(201).json({ ...investment, _id: result.insertedId });
  } catch (error) {
    console.error("Create investment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/investments/:id - Update investment notes/amount
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid investment ID" });
    }
    const investment = await db
      .collection("investments")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!investment) return res.status(404).json({ error: "Investment not found" });
    if (investment.investorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { notes, amount } = req.body;
    const updates = { updatedAt: new Date() };

    if (notes !== undefined) updates.notes = notes;

    if (amount !== undefined) {
      const newAmount = parseFloat(amount);
      const diff = newAmount - investment.amount;

      if (diff > 0) {
        const user = await db
          .collection("users")
          .findOne({ _id: new ObjectId(req.user.userId) });
        const available = user.budget - user.totalInvested;
        if (diff > available) {
          return res.status(400).json({ error: "Insufficient budget for increase" });
        }
      }

      updates.amount = newAmount;
      updates.estimatedReturn = newAmount * investment.returnMultiplier;

      // Adjust user and pitch totals
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(req.user.userId) },
          { $inc: { totalInvested: diff } }
        );
      await db
        .collection("pitches")
        .updateOne({ _id: investment.pitchId }, { $inc: { totalFunding: diff } });
    }

    await db
      .collection("investments")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    const updated = await db
      .collection("investments")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Update investment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/investments/:id - Withdraw investment
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const db = getDB();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid investment ID" });
    }
    const investment = await db
      .collection("investments")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!investment) return res.status(404).json({ error: "Investment not found" });
    if (investment.investorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Refund the user
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.user.userId) },
        { $inc: { totalInvested: -investment.amount } }
      );

    // Remove from pitch funding
    await db
      .collection("pitches")
      .updateOne(
        { _id: investment.pitchId },
        { $inc: { totalFunding: -investment.amount } }
      );

    await db.collection("investments").deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({ message: "Investment withdrawn successfully" });
  } catch (error) {
    console.error("Delete investment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
