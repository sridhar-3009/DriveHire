const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const KYC = require('../models/KYC');
const authMiddleware = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
  return null;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const safeRole = role === 'employer' ? 'employer' : 'driver';
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ name: name.trim(), email, phone, password, role: safeRole });
    res.status(201).json({ token: sign(user._id), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    // Account lock check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const mins = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(429).json({ message: `Account locked. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(429).json({ message: 'Account locked after 5 failed attempts. Try again in 15 minutes.' });
      }
      await user.save();
      const rem = 5 - user.loginAttempts;
      return res.status(401).json({ message: `Invalid password. ${rem} attempt${rem > 1 ? 's' : ''} remaining.` });
    }

    // Reset on success
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    res.json({ token: sign(user._id), user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -loginAttempts -lockUntil');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, phone, avatar, profile, company } = req.body;
    if (name?.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (profile && user.role === 'driver')   Object.assign(user.profile, profile);
    if (company && user.role === 'employer') Object.assign(user.company, company);

    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/auth/password — change password
router.patch('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ message: pwErr });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/auth/account — permanently delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    await Promise.all([
      Application.deleteMany({ userId: req.user._id }),
      Notification.deleteMany({ userId: req.user._id }),
      KYC.deleteOne({ userId: req.user._id }),
      User.findByIdAndDelete(req.user._id),
    ]);

    res.json({ message: 'Account permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
