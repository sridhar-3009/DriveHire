const router = require('express').Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications — user's notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/read-all — mark all read
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark one read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
