import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET all users
router.get('/users', requireAdmin, async (req, res) => {
  const users = await User.find({}, '-passwordHash');
  res.json(users);
});

// DELETE user
router.delete('/users/:id', requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// UPDATE user role or plan
router.put('/users/:id', requireAdmin, async (req, res) => {
  const { role, plan } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(plan && { plan }) },
    { new: true }
  );
  res.json(updated);
});

export default router;