import express from "express";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { 
  getAdminNotifications,
  getAdminProjects,
  getAdminFiles,
  getAdminMessages,
  acceptAdminRequest
} from '../controllers/adminController.js';

const router = express.Router();

// GET all users (admin only)
router.get('/users', protect, adminOnly, async (req, res) => {
  const users = await User.find({}, '-passwordHash');
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
router.get('/notifications', protect, adminOnly, getAdminNotifications);

// GET admin projects
router.get('/projects', protect, adminOnly, getAdminProjects);

// GET admin files
router.get('/files', protect, adminOnly, getAdminFiles);

// GET admin messages
router.get('/messages', protect, adminOnly, getAdminMessages);

// Accept a client request (admin only)
router.post('/accept-request/:notificationId', protect, adminOnly, acceptAdminRequest);

export default router;