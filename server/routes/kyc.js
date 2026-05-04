const router = require('express').Router();
const KYC = require('../models/KYC');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// Aadhaar format: 12 digits, first digit not 0 or 1
function validateAadhaar(num) {
  return /^[2-9][0-9]{11}$/.test(num.replace(/\s|-/g, ''));
}

// DL format: XX00 20001234567 (state + RTO + year + number)
function validateDL(dl) {
  return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(dl.replace(/\s|-/g, '').toUpperCase());
}

function maskAadhaar(num) {
  const clean = num.replace(/\s|-/g, '');
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

// GET /api/kyc/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user._id }).select('-aadhaarFront -aadhaarBack -dlFront -selfie');
    res.json(kyc || { status: 'not_submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/kyc/submit
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') return res.status(403).json({ message: 'Drivers only' });

    const { aadhaarNumber, aadhaarFront, aadhaarBack, dlNumber, dlFront, selfie } = req.body;

    // Validate formats
    if (!validateAadhaar(aadhaarNumber)) {
      return res.status(400).json({ message: 'Invalid Aadhaar number (must be 12 digits, first digit 2-9)' });
    }
    if (!validateDL(dlNumber)) {
      return res.status(400).json({ message: 'Invalid DL number format (e.g. MH0220001234567)' });
    }
    if (!aadhaarFront || !aadhaarBack || !dlFront || !selfie) {
      return res.status(400).json({ message: 'All documents and selfie required' });
    }

    const kyc = await KYC.findOneAndUpdate(
      { userId: req.user._id },
      {
        aadhaarNumber: maskAadhaar(aadhaarNumber),
        aadhaarFront, aadhaarBack,
        dlNumber: dlNumber.replace(/\s|-/g, '').toUpperCase(),
        dlFront, selfie,
        status: 'pending',
        submittedAt: new Date(),
        rejectionReason: '',
      },
      { upsert: true, new: true }
    );

    // Update user kycStatus for quick access
    await User.findByIdAndUpdate(req.user._id, { 'profile.kycStatus': 'pending' });

    await Notification.create({
      userId: req.user._id,
      message: 'KYC documents submitted. Under review (24-48 hrs).',
      type: 'status',
      link: '/profile',
    });

    res.json({ message: 'KYC submitted successfully', status: 'pending' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/kyc/:userId/review — admin endpoint (requires ADMIN_SECRET header)
router.patch('/:userId/review', async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { status, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }

    const kyc = await KYC.findOneAndUpdate(
      { userId: req.params.userId },
      { status, rejectionReason: rejectionReason || '', reviewedAt: new Date() },
      { new: true }
    );
    if (!kyc) return res.status(404).json({ message: 'KYC not found' });

    await User.findByIdAndUpdate(req.params.userId, { 'profile.kycStatus': status });

    const msg = status === 'verified'
      ? 'Your KYC is verified! You now have a Verified badge on your profile. ✅'
      : `KYC rejected: ${rejectionReason || 'Documents unclear'}. Please resubmit.`;

    await Notification.create({
      userId: req.params.userId,
      message: msg,
      type: 'status',
      link: '/profile',
    });

    res.json(kyc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/kyc/pending — admin: list pending KYCs
router.get('/pending', async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const list = await KYC.find({ status: 'pending' })
      .populate('userId', 'name email phone')
      .sort({ submittedAt: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
