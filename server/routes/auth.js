const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { toSafeUser } = require('../lib/helpers');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

function validatePassword(pw) {
  if (!pw || pw.length < 8) return 'Password must be at least 8 characters';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
  return null;
}

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name?.trim() || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email address' });
    const pwErr = validatePassword(password);
    if (pwErr) return res.status(400).json({ message: pwErr });

    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).maybeSingle();
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase.from('users').insert({
      name: name.trim(), email: email.toLowerCase(),
      phone: phone || '', password: hashed,
      role: role === 'employer' ? 'employer' : 'driver',
    }).select().single();
    if (error) throw error;
    res.status(201).json({ token: sign(user.id), user: toSafeUser(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const { data: user } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      const mins = Math.ceil((new Date(user.lock_until) - new Date()) / 60000);
      return res.status(429).json({ message: `Account locked. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` });
    }
    if (!user.is_active) return res.status(403).json({ message: 'Account has been deactivated' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const attempts = (user.login_attempts || 0) + 1;
      const upd = { login_attempts: attempts };
      if (attempts >= 5) upd.lock_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await supabase.from('users').update(upd).eq('id', user.id);
      if (attempts >= 5) return res.status(429).json({ message: 'Account locked after 5 failed attempts. Try again in 15 minutes.' });
      return res.status(401).json({ message: `Invalid password. ${5 - attempts} attempt${5 - attempts !== 1 ? 's' : ''} remaining.` });
    }

    await supabase.from('users').update({ login_attempts: 0, lock_until: null }).eq('id', user.id);
    res.json({ token: sign(user.id), user: toSafeUser(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => res.json({ user: toSafeUser(req.user) }));

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, avatar, profile, company } = req.body;
    const upd = { updated_at: new Date().toISOString() };
    if (name?.trim()) upd.name = name.trim();
    if (phone !== undefined) upd.phone = phone;
    if (avatar !== undefined) upd.avatar = avatar;
    if (profile && req.user.role === 'driver') {
      if (profile.licenseNumber !== undefined) upd.license_number = profile.licenseNumber;
      if (profile.licenseExpiry !== undefined) upd.license_expiry = profile.licenseExpiry || null;
      if (profile.experience !== undefined) upd.experience = Number(profile.experience) || 0;
      if (profile.location !== undefined) upd.location = profile.location;
      if (profile.languages !== undefined) upd.languages = profile.languages;
      if (profile.availability !== undefined) upd.availability = profile.availability;
      if (profile.bio !== undefined) upd.bio = profile.bio;
    }
    if (company && req.user.role === 'employer') {
      if (company.name !== undefined) upd.company_name = company.name;
      if (company.fleetSize !== undefined) upd.fleet_size = Number(company.fleetSize) || 0;
      if (company.location !== undefined) upd.company_location = company.location;
      if (company.website !== undefined) upd.company_website = company.website;
      if (company.description !== undefined) upd.company_description = company.description;
    }
    const { data: user, error } = await supabase.from('users').update(upd).eq('id', req.user.id).select().single();
    if (error) throw error;
    res.json({ user: toSafeUser(user) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/auth/password
router.patch('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { data: row } = await supabase.from('users').select('password').eq('id', req.user.id).single();
    if (!(await bcrypt.compare(currentPassword, row.password))) return res.status(401).json({ message: 'Current password is incorrect' });
    const pwErr = validatePassword(newPassword);
    if (pwErr) return res.status(400).json({ message: pwErr });
    await supabase.from('users').update({ password: await bcrypt.hash(newPassword, 10) }).eq('id', req.user.id);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/auth/account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const { data: row } = await supabase.from('users').select('password').eq('id', req.user.id).single();
    if (!(await bcrypt.compare(password, row.password))) return res.status(401).json({ message: 'Incorrect password' });
    await supabase.from('users').delete().eq('id', req.user.id); // cascades to all tables
    res.json({ message: 'Account permanently deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
