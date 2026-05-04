const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Aadhaar
  aadhaarNumber:  { type: String, default: '' }, // stored masked: XXXX-XXXX-1234
  aadhaarFront:   { type: String, default: '' }, // base64
  aadhaarBack:    { type: String, default: '' }, // base64

  // Driving License
  dlNumber:  { type: String, default: '' },
  dlFront:   { type: String, default: '' }, // base64

  // Live selfie
  selfie: { type: String, default: '' }, // base64

  // Verification
  status:          { type: String, enum: ['not_submitted', 'pending', 'verified', 'rejected'], default: 'not_submitted' },
  rejectionReason: { type: String, default: '' },
  submittedAt:     { type: Date },
  reviewedAt:      { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);
