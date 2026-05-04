const router = require('express').Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const authMiddleware = require('../middleware/auth');

// GET /api/jobs — public, bus jobs only
router.get('/', async (req, res) => {
  try {
    const { location, salary, experience, search } = req.query;
    const filter = { status: 'active', vehicleType: 'bus' };

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search)   filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/jobs/employer/mine — MUST be before /:id to avoid shadowing
router.get('/employer/mine', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 }).lean();
    // attach applicant counts
    const jobIds = jobs.map(j => j._id);
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));
    const withCounts = jobs.map(j => ({ ...j, applicantCount: countMap[j._id.toString()] || 0 }));
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/jobs/:id — public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/jobs — employer only
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Employers only' });
    }
    const job = await Job.create({
      ...req.body,
      vehicleType: 'bus', // enforce bus-only
      employerId: req.user._id,
      company: req.user.company?.name || req.user.name,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/jobs/:id/status — employer close/reopen
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, employerId: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    job.status = req.body.status;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
