import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to protect routes and attach full user to the request
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach minimal required user info
    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to restrict access to admins only
 */
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

/**
 * Middleware to restrict access to clients only
 */
export const clientAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('🔐 clientAuthMiddleware called');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded);
    if (decoded.role !== 'client') {
      console.log('❌ Forbidden: Not a client');
      return res.status(403).json({ message: 'Forbidden: Not a client' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Invalid token:', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
