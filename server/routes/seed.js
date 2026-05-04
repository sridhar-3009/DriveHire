const router = require('express').Router();
const User = require('../models/User');
const Job = require('../models/Job');

// POST /api/seed — dev only, seeds sample bus driver jobs
router.post('/', async (req, res) => {
  try {
    // Create a sample employer
    let employer = await User.findOne({ email: 'employer@demo.com' });
    if (!employer) {
      employer = await User.create({
        name: 'BEST Transport Co.',
        email: 'employer@demo.com',
        password: 'demo1234',
        role: 'employer',
        company: { name: 'BEST Transport Co.', fleetSize: 120, location: 'Mumbai' },
      });
    }

    // Wipe existing seed jobs
    await Job.deleteMany({ employerId: employer._id });

    const jobs = await Job.insertMany([
      {
        employerId: employer._id,
        title: 'City Bus Driver',
        company: 'BEST Transport Co.',
        description: 'Drive AC city bus on fixed routes in Mumbai. Shift-based work. PF & ESI provided.',
        vehicleType: 'bus', salary: '₹20,000 – ₹28,000/mo', location: 'Mumbai, Maharashtra',
        route: 'City', experience: '2+ years', accommodation: false, food: false, urgent: false,
        requirements: ['HMV License', '2+ yrs experience', 'Mumbai route knowledge'],
      },
      {
        employerId: employer._id,
        title: 'School Bus Driver',
        company: 'Sunrise Academy',
        description: 'Responsible driving for school children. Morning and afternoon shifts only.',
        vehicleType: 'bus', salary: '₹18,000 – ₹24,000/mo', location: 'Chennai, Tamil Nadu',
        route: 'City', experience: '3+ years', accommodation: false, food: true, urgent: false,
        requirements: ['HMV License', '3+ yrs experience', 'Police verification required'],
      },
      {
        employerId: employer._id,
        title: 'Interstate Bus Driver',
        company: 'Karnataka SRTC',
        description: 'Drive overnight sleeper buses on Bangalore–Hyderabad route. Excellent pay.',
        vehicleType: 'bus', salary: '₹30,000 – ₹42,000/mo', location: 'Bangalore, Karnataka',
        route: 'Interstate', experience: '5+ years', accommodation: true, food: true, urgent: true,
        requirements: ['HMV/Transport License', '5+ yrs exp', 'Night driving experience'],
      },
      {
        employerId: employer._id,
        title: 'Electric Bus Driver',
        company: 'GreenMove Solutions',
        description: 'Drive new electric city buses. Training provided for EV handling.',
        vehicleType: 'bus', salary: '₹22,000 – ₹30,000/mo', location: 'Hyderabad, Telangana',
        route: 'City', experience: '2+ years', accommodation: false, food: false, urgent: true,
        requirements: ['HMV License', 'EV training (provided)', 'Clean record'],
      },
      {
        employerId: employer._id,
        title: 'Tourist Bus Driver',
        company: 'SkyTours Pvt Ltd',
        description: 'Drive luxury tourist buses across hill stations and heritage routes.',
        vehicleType: 'bus', salary: '₹25,000 – ₹35,000/mo', location: 'Delhi, NCR',
        route: 'Interstate', experience: '3+ years', accommodation: true, food: false, urgent: false,
        requirements: ['HMV License', 'Tourist permit', 'English communication skills'],
      },
      {
        employerId: employer._id,
        title: 'Corporate Shuttle Driver',
        company: 'TechPark Mobility',
        description: 'Drive AC mini-bus for IT company employee pickup/drop. Fixed shifts, weekends off.',
        vehicleType: 'bus', salary: '₹16,000 – ₹22,000/mo', location: 'Pune, Maharashtra',
        route: 'City', experience: '1+ year', accommodation: false, food: false, urgent: false,
        requirements: ['LMV/HMV License', '1+ yr experience', 'Punctuality required'],
      },
    ]);

    res.json({ message: `Seeded ${jobs.length} bus driver jobs`, employerEmail: 'employer@demo.com', employerPassword: 'demo1234' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
