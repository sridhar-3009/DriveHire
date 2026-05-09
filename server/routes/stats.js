const router = require('express').Router();
const supabase = require('../lib/supabase');

router.get('/', async (req, res) => {
  try {
    const [
      { count: drivers },
      { count: employers },
      { count: jobs },
      { count: applications },
      { count: verifiedDrivers },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'driver'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'driver').eq('kyc_status', 'verified'),
    ]);
    res.json({ drivers, employers, jobs, applications, verifiedDrivers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
