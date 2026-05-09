const router = require('express').Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { toSafeUser } = require('../lib/helpers');

router.get('/employer/:id', async (req, res) => {
  try {
    const { data: user } = await supabase.from('users').select('*').eq('id', req.params.id).eq('role', 'employer').single();
    if (!user) return res.status(404).json({ message: 'Employer not found' });
    const { count: activeJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', req.params.id).eq('status', 'active');
    res.json({ ...toSafeUser(user), activeJobs: activeJobs || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/drivers', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const { location, minExp, availability, kycOnly, search } = req.query;
    let query = supabase.from('users').select('*').eq('role', 'driver').eq('is_active', true);
    if (availability) query = query.eq('availability', availability);
    if (kycOnly === 'true') query = query.eq('kyc_status', 'verified');
    if (minExp) query = query.gte('experience', Number(minExp));
    const { data: drivers, error } = await query.order('experience', { ascending: false }).limit(50);
    if (error) throw error;
    let out = drivers;
    if (location) out = out.filter(d => (d.location || '').toLowerCase().includes(location.toLowerCase()));
    if (search) {
      const s = search.toLowerCase();
      out = out.filter(d => d.name.toLowerCase().includes(s) || (d.license_number || '').toLowerCase().includes(s));
    }
    res.json(out.map(toSafeUser));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
