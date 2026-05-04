const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, default: '' },
  password: { type: String, required: true, minlength: 8 },
  role:     { type: String, enum: ['driver', 'employer', 'admin'], default: 'driver' },
  avatar:   { type: String, default: '' }, // base64 compressed
  isActive: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date, default: null },
  // Driver-specific
  profile: {
    licenseNumber: { type: String, default: '' },
    licenseExpiry: { type: Date, default: null },
    experience:    { type: Number, default: 0 },
    location:      { type: String, default: '' },
    languages:     { type: [String], default: [] },
    availability:  { type: String, default: 'immediate' },
    bio:           { type: String, default: '' },
    kycStatus:     { type: String, enum: ['not_submitted', 'pending', 'verified', 'rejected'], default: 'not_submitted' },
  },
  // Employer-specific
  company: {
    name:        { type: String, default: '' },
    fleetSize:   { type: Number, default: 0 },
    location:    { type: String, default: '' },
    website:     { type: String, default: '' },
    description: { type: String, default: '' },
  },
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
