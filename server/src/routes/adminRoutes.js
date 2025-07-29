import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all users (admin only)
router.get("/users", protect, adminOnly, async (req, res) => {
  const users = await User.find({}, "-passwordHash");
  res.json(users);
});

// DELETE user (admin only)
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

// UPDATE user role or plan (admin only)
router.put("/users/:id", protect, adminOnly, async (req, res) => {
  const { role, plan } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(plan && { plan }) },
    { new: true }
  );
  res.json(updated);
});

export default router;