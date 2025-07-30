import AdminRequest from '../models/AdminRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Project from '../models/Project.js';

// Return all projects
export const getAdminProjects = async (req, res) => {
  const projects = await Project.find().populate('client freelancers');
  res.json(projects);
};

// Return all files
export const getAdminFiles = async (req, res) => {
  const files = await File.find().populate('uploadedBy project');
  res.json(files);
};

// Return all messages
export const getAdminMessages = async (req, res) => {
  const messages = await Message.find().populate('sender project');
  res.json(messages);
};

// Return all notifications
export const getAdminNotifications = async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
};

export const acceptAdminRequest = async (req, res) => {
  const { notificationId } = req.params;

  // Find and remove the notification
  const notification = await Notification.findById(notificationId);
  if (!notification || notification.type !== 'admin-request') {
    return res.status(404).json({ message: 'Request not found.' });
  }

  // Find the related admin request
  const adminRequest = await AdminRequest.findOne({ status: 'pending' }).populate('user');
  if (!adminRequest) {
    return res.status(404).json({ message: 'Admin request not found.' });
  }

  // Accept the request
  adminRequest.status = 'accepted';
  await adminRequest.save();

  // Remove the notification
  await Notification.findByIdAndDelete(notificationId);

  // Create a new project for this client
  const admin = await User.findById(req.user.userId);
  const client = adminRequest.user;
  const project = await Project.create({
    name: `Project for ${client.name || client.email}`,
    description: 'New project started after admin accepted the request.',
    client: client._id,
    freelancers: [], // or add admin/freelancer IDs if needed
    status: 'active'
  });

  res.json({ message: 'Request accepted, project created.', project });
};