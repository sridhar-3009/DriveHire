const router = require('express').Router();
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

router.get('/', async (req, res) => {
  try {
    const [drivers, employers, jobs, applications, verifiedDrivers] = await Promise.all([
      User.countDocuments({ role: 'driver' }),
      User.countDocuments({ role: 'employer' }),
      Job.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      User.countDocuments({ role: 'driver', 'profile.kycStatus': 'verified' }),
    ]);
    res.json({ drivers, employers, jobs, applications, verifiedDrivers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
