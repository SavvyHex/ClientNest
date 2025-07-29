import fs from 'fs';
import path from 'path';

// In-memory storage for demo purposes (replace with DB in production)
let files = [];

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