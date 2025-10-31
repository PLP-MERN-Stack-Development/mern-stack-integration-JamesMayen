// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
// Fetch the full user from DB
    const user = await User.findById(decoded.id).select('-passwordHash -password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // Attach full user object to request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Named export for compatibility with code that imports { protect }
export const protect = auth;
