const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  company:      { type: String, required: true },
  description:  { type: String, default: '' },
  vehicleType:  { type: String, enum: ['bus'], default: 'bus' }, // bus drivers only
  salary:       { type: String, required: true },
  location:     { type: String, required: true },
  route:        { type: String, enum: ['City', 'Interstate', 'Local', 'School', 'Corporate'], default: 'City' },
  experience:   { type: String, default: '1+ year' },
  accommodation:{ type: Boolean, default: false },
  food:         { type: Boolean, default: false },
  urgent:       { type: Boolean, default: false },
  status:       { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  requirements: { type: [String], default: [] },
  openings:     { type: Number, default: 1, min: 1 },
  deadline:     { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
