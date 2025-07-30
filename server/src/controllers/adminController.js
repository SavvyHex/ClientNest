import AdminRequest from '../models/AdminRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import File from '../models/File.js';
import Message from '../models/Message.js';

import multer from 'multer';
import path from 'path';

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Return all projects
export const getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('client freelancers');
    res.json(projects);
  } catch (err) {
    console.error('❌ getAdminProjects:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Return all files
export const getAdminFiles = async (req, res) => {
  try {
    const files = await File.find().populate('uploadedBy project');
    res.json(files);
  } catch (err) {
    console.error('❌ getAdminFiles:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Return all messages
export const getAdminMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate('sender project');
    res.json(messages);
  } catch (err) {
    console.error('❌ getAdminMessages:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Return all notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('❌ getAdminNotifications:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept a client request
export const acceptAdminRequest = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification || notification.type !== 'admin-request') {
      return res.status(404).json({ message: 'Request not found.' });
    }

    const adminRequest = await AdminRequest.findOne({ status: 'pending' }).populate('user');
    if (!adminRequest) {
      return res.status(404).json({ message: 'Admin request not found.' });
    }

    adminRequest.status = 'accepted';
    await adminRequest.save();

    await Notification.findByIdAndDelete(notificationId);

    const admin = await User.findById(req.user.userId);
    const client = adminRequest.user;

    const project = await Project.create({
      name: `Project for ${client.name || client.email}`,
      description: 'New project started after admin accepted the request.',
      client: client._id,
      freelancers: [],
      status: 'active'
    });

    res.json({ message: 'Request accepted, project created.', project });
  } catch (err) {
    console.error('❌ acceptAdminRequest:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload a file from admin
export const sendAdminFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const adminId = req.user.userId;
    const { projectId } = req.body;

    const newFile = await File.create({
      name: req.file.originalname,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
      uploadedAt: new Date(),
      uploadedBy: adminId,
      project: projectId
    });

    res.status(201).json(newFile);
  } catch (err) {
    console.error("❌ Error uploading file:", err);
    res.status(500).json({ message: 'Failed to upload file.' });
  }
};

// Send a message from admin to client
export const sendAdminMessage = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const { content, projectId } = req.body;

    if (!content || !projectId) {
      return res.status(400).json({ message: 'Content and projectId required.' });
    }

    const message = await Message.create({
      content,
      sender: adminId,
      project: projectId,
      createdAt: new Date()
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('❌ sendAdminMessage:', err.message);
    res.status(500).json({ message: 'Failed to send message.' });
  }
};