const router = require('express').Router();
const User = require('../models/User');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/auth');

// GET /api/users/employer/:id — public employer profile
router.get('/employer/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: 'employer' })
      .select('-password -loginAttempts -lockUntil -isActive');
    if (!user) return res.status(404).json({ message: 'Employer not found' });

    const activeJobs = await Job.countDocuments({ employerId: user._id, status: 'active' });
    const obj = user.toSafeObject();
    obj.activeJobs = activeJobs;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/drivers — employer searches verified drivers
router.get('/drivers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const { location, minExp, availability, search, kycOnly = 'true' } = req.query;
    const filter = { role: 'driver', isActive: true };
    if (kycOnly === 'true') filter['profile.kycStatus'] = 'verified';
    if (location) filter['profile.location'] = { $regex: location, $options: 'i' };
    if (minExp) filter['profile.experience'] = { $gte: Number(minExp) };
    if (availability) filter['profile.availability'] = availability;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.location': { $regex: search, $options: 'i' } },
      ];
    }
    const drivers = await User.find(filter)
      .select('-password -loginAttempts -lockUntil -email')
      .sort({ 'profile.experience': -1 })
      .limit(50);
    res.json(drivers.map(d => d.toSafeObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
