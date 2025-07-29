import express from 'express';
import { getClientFiles, uploadClientFile } from '../controllers/clientController.js';
import { clientAuthMiddleware } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' }); // You can customize storage as needed

// List all files uploaded by the client
router.get('/files', clientAuthMiddleware, getClientFiles);

// Upload a new file (page or invoice)
router.post('/upload', clientAuthMiddleware, upload.single('file'), uploadClientFile);

export default router;