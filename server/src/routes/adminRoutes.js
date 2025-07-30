import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getAdminNotifications,
  getAdminProjects,
  getAdminFiles,
  getAdminMessages,
  acceptAdminRequest,
  sendAdminFile,
  sendAdminMessage,
} from "../controllers/adminController.js";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

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

// GET admin notifications
router.get("/notifications", protect, adminOnly, getAdminNotifications);

// GET admin projects
router.get("/projects", protect, adminOnly, getAdminProjects);

// GET admin files
router.get("/files", protect, adminOnly, getAdminFiles);

// POST admin files
router.post("/files", protect, adminOnly, upload.single("file"), sendAdminFile);

// GET admin messages
router.get("/messages", protect, adminOnly, getAdminMessages);

// POST admin messages
router.post("/messages", protect, adminOnly, sendAdminMessage);

// Accept a client request (admin only)
router.post(
  "/accept-request/:notificationId",
  protect,
  adminOnly,
  acceptAdminRequest
);

export default router;
