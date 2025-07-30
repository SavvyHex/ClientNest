import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import AdminRequest from '../models/AdminRequest.js';
import Notification from '../models/Notification.js';

// In-memory storage for demo purposes (replace with DB in production)
let files = [];
let adminRequests = []; // { userId, status: 'pending' | 'accepted' | 'rejected' }
let messages = []; // { _id, userId, sender, content, createdAt }
let notifications = []; // Make sure this is accessible to both client and admin controllers

// GET /api/client/files
export const getClientFiles = (req, res) => {
  // Only return files uploaded by this client
  const userId = req.user.userId;
  const userFiles = files.filter(f => f.userId === userId);
  res.json(userFiles);
};

// POST /api/client/upload
export const uploadClientFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const userId = req.user.userId;
  const fileData = {
    _id: `${Date.now()}-${req.file.filename}`,
    userId,
    name: req.file.originalname,
    path: req.file.path,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date()
  };
  files.push(fileData);
  res.status(201).json(fileData);
};

// POST /api/client/request-admin
export const requestAdmin = async (req, res) => {
  try {
    console.log("🛠 requestAdmin route hit");

    const userId = req.user._id || req.user.userId;
    const userName = req.user.name || req.user.email || 'Client';
    console.log("🔎 userId:", userId);

    // Check for existing request
    const existing = await AdminRequest.findOne({
      user: userId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existing) {
      console.log("⚠️ Already exists");
      return res.status(400).json({ message: 'Request already sent or accepted.', status: existing.status });
    }

    // Create admin request
    const newRequest = await AdminRequest.create({ user: userId });
    console.log("✅ Admin request created:", newRequest);

    // Create admin notification
    const notif = await Notification.create({
      type: 'admin-request',
      message: `${userName} requested to work with an admin.`,
      read: false
    });

    console.log("📬 Notification created:", notif);

    res.json({ message: 'Request sent.', status: 'pending' });

  } catch (err) {
    console.error("❌ Error in requestAdmin:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/client/request-status
export const getRequestStatus = (req, res) => {
  const userId = req.user.userId;
  const reqObj = adminRequests.find(r => r.userId === userId);
  res.json({ status: reqObj ? reqObj.status : 'none' });
};

// GET /api/client/messages
export const getClientMessages = (req, res) => {
  const userId = req.user.userId;
  const userMessages = messages.filter(m => m.userId === userId);
  res.json(userMessages);
};

// POST /api/client/messages
export const sendClientMessage = (req, res) => {
  const userId = req.user.userId;
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Message content required.' });
  const msg = {
    _id: `${Date.now()}-${Math.random()}`,
    userId,
    sender: { name: req.user.name || 'Client', id: userId },
    content,
    createdAt: new Date()
  };
  messages.push(msg);
  res.status(201).json(msg);
};

// GET /api/admin/notifications
export const getAdminNotifications = async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
};