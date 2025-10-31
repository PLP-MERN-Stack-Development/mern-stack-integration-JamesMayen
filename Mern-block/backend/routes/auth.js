// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Make sure this exists

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Debug: log attempt (do NOT log passwords or hashes)
    console.log(`POST /api/auth/login attempt for email=${email}`);

  // normalize email search to lowercase to match schema behavior
  const user = await User.findOne({ email: email && email.toLowerCase() });
    if (!user) {
      console.log(`  -> user not found for email=${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Support both `passwordHash` (current) and legacy `password` field (if any existing docs)
    const storedHash = user.passwordHash || user.password;
    if (!storedHash) {
      console.log(`  -> no stored password hash for user id=${user._id}`);
      // No password stored for this user — treat as invalid credentials
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, storedHash);
    } catch (compareErr) {
      console.error('  -> bcrypt.compare error:', compareErr && compareErr.message);
      return res.status(500).json({ message: 'Server error' });
    }

    if (!isMatch) {
      console.log(`  -> password mismatch for user id=${user._id}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // exclude any password fields (new or legacy)
    const user = await User.findById(req.user.id).select('-passwordHash -password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
