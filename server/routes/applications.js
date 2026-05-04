const router = require('express').Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// POST /api/applications — driver applies
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({ message: 'Drivers only' });
    }
    const { jobId } = req.body;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const app = await Application.create({ jobId, userId: req.user._id });

    // Notify employer of new application
    await Notification.create({
      userId: job.employerId,
      message: `${req.user.name} applied for "${job.title}"`,
      type: 'application',
      link: `/applicants/${job._id}`,
    });

    res.status(201).json(app);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Already applied' });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/mine — driver's applications
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const apps = await Application.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/applications/job/:jobId — employer sees applicants
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const job = await Job.findOne({ _id: req.params.jobId, employerId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const apps = await Application.find({ jobId: req.params.jobId })
      .populate('userId', '-password')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/applications/:id — employer updates status
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const app = await Application.findById(req.params.id).populate('jobId').populate('userId', 'name');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your job' });
    }
    app.status = req.body.status;
    await app.save();

    // Notify driver of status change
    const statusMessages = {
      Shortlisted: `You've been shortlisted for "${app.jobId.title}"! 🎉`,
      Selected:    `Congratulations! You're selected for "${app.jobId.title}" 🚌`,
      Rejected:    `Your application for "${app.jobId.title}" was not selected.`,
    };
    if (statusMessages[req.body.status]) {
      await Notification.create({
        userId: app.userId._id,
        message: statusMessages[req.body.status],
        type: 'status',
        link: `/applications`,
      });
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
