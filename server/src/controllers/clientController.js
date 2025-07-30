import AdminRequest from '../models/AdminRequest.js';
import Notification from '../models/Notification.js';
import File from '../models/File.js';
import Message from '../models/Message.js';
import Project from '../models/Project.js';

// POST /api/client/upload
export const uploadClientFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const userId = req.user.userId;

    const project = await Project.findOne({ client: userId });
    if (!project) return res.status(404).json({ message: 'No project found for this client.' });

    const file = await File.create({
      name: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      uploadedBy: userId,
      project: project._id
    });

    res.status(201).json(file);
  } catch (err) {
    console.error('❌ Error uploading file:', err.message);
    res.status(500).json({ message: 'File upload failed' });
  }
};

// GET /api/client/files
export const getClientFiles = async (req, res) => {
  try {
    const userId = req.user.userId;
    const files = await File.find({ uploadedBy: userId }).populate('project');
    res.json(files);
  } catch (err) {
    console.error('❌ Error fetching files:', err.message);
    res.status(500).json({ message: 'Error fetching files' });
  }
};

// POST /api/client/request-admin
export const requestAdmin = async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const userName = req.user.name || req.user.email || 'Client';

    const existing = await AdminRequest.findOne({
      user: userId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already sent or accepted.', status: existing.status });
    }

    const newRequest = await AdminRequest.create({ user: userId });

    await Notification.create({
      type: 'admin-request',
      message: `${userName} requested to work with an admin.`,
      read: false
    });

    res.json({ message: 'Request sent.', status: 'pending' });
  } catch (err) {
    console.error("❌ Error in requestAdmin:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/client/request-status
export const getRequestStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const request = await AdminRequest.findOne({ user: userId }).sort({ createdAt: -1 });
    res.json({ status: request ? request.status : 'none' });
  } catch (err) {
    res.status(500).json({ message: 'Error checking status' });
  }
};

// POST /api/client/messages
export const sendClientMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Message content required.' });

    const project = await Project.findOne({ client: userId });
    if (!project) return res.status(404).json({ message: 'No project found for this client.' });

    const msg = await Message.create({
      sender: userId,
      content,
      project: project._id
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error('❌ Error sending message:', err.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// GET /api/client/messages
export const getClientMessages = async (req, res) => {
  try {
    const userId = req.user.userId;

    const project = await Project.findOne({ client: userId });
    if (!project) return res.status(404).json({ message: 'No project found.' });

    const messages = await Message.find({ project: project._id }).populate('sender');
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// GET /api/client/project
export const getClientProject = async (req, res) => {
  try {
    const project = await Project.findOne({ client: req.user.userId }).populate('client freelancers');
    if (!project) {
      return res.status(404).json({ message: 'No project found for this client.' });
    }
    res.json(project);
  } catch (err) {
    console.error('❌ Error fetching project:', err.message);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
};

// (Optional) Admin notifications endpoint here if you're using it for debug/dev
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('❌ Error fetching notifications:', err.message);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};