import express from 'express';
import {
  getClientFiles,
  uploadClientFile,
  requestAdmin,
  getRequestStatus,
  getClientMessages,
  sendClientMessage,
  getClientProject
} from '../controllers/clientController.js';
import { clientAuthMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // You can customize storage as needed

// List all files uploaded by the client
router.get('/files', clientAuthMiddleware, getClientFiles);

// Upload a new file (page or invoice)
router.post('/upload', clientAuthMiddleware, upload.single('file'), uploadClientFile);

// Request to work with an admin
router.post('/request-admin', clientAuthMiddleware, requestAdmin);

// Get the status of the admin request
router.get('/request-status', clientAuthMiddleware, getRequestStatus);

// Get all messages for the client
router.get('/messages', clientAuthMiddleware, getClientMessages);

// Send a new message
router.post('/messages', clientAuthMiddleware, sendClientMessage);

// Get the project
router.get('/project', clientAuthMiddleware, getClientProject);

export default router;