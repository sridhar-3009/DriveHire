const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, default: '' },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['driver', 'employer', 'admin'], default: 'driver' },
  // Driver-specific (bus drivers only)
  profile: {
    licenseNumber: { type: String, default: '' },
    experience:    { type: Number, default: 0 },
    location:      { type: String, default: '' },
    languages:     { type: [String], default: [] },
    availability:  { type: String, default: 'immediate' },
  },
  // Employer-specific
  company: {
    name:      { type: String, default: '' },
    fleetSize: { type: Number, default: 0 },
    location:  { type: String, default: '' },
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
