const router = require('express').Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { toSafeJob } = require('../lib/helpers');

// GET /api/jobs — public
router.get('/', async (req, res) => {
  try {
    const { location, search } = req.query;
    const { data: jobs, error } = await supabase
      .from('jobs').select('*').eq('status', 'active').eq('vehicle_type', 'bus')
      .order('created_at', { ascending: false });
    if (error) throw error;
    let out = jobs;
    if (location) out = out.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    if (search) {
      const s = search.toLowerCase();
      out = out.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.location.toLowerCase().includes(s));
    }
    res.json(out.map(toSafeJob));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/jobs/employer/mine — must be before /:id
router.get('/employer/mine', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const { data: jobs, error } = await supabase.from('jobs').select('*').eq('employer_id', req.user.id).order('created_at', { ascending: false });
    if (error) throw error;
    const jobIds = jobs.map(j => j.id);
    const counts = {};
    if (jobIds.length) {
      const { data: apps } = await supabase.from('applications').select('job_id').in('job_id', jobIds);
      (apps || []).forEach(a => { counts[a.job_id] = (counts[a.job_id] || 0) + 1; });
    }
    res.json(jobs.map(j => ({ ...toSafeJob(j), applicantCount: counts[j.id] || 0 })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/jobs/:id — public
router.get('/:id', async (req, res) => {
  try {
    const { data: job, error } = await supabase.from('jobs').select('*').eq('id', req.params.id).single();
    if (error || !job) return res.status(404).json({ message: 'Job not found' });
    res.json(toSafeJob(job));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/jobs
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const { title, location, salary, type, route, experience, description, requirements, openings, deadline } = req.body;
    const { data: job, error } = await supabase.from('jobs').insert({
      employer_id: req.user.id,
      company: req.user.company_name || req.user.name,
      title, location, salary,
      type: type || 'Full-time',
      route: route || 'City',
      experience: Number(experience) || 0,
      description: description || '',
      requirements: requirements || [],
      openings: Number(openings) || 1,
      deadline: deadline || null,
      vehicle_type: 'bus', status: 'active',
    }).select().single();
    if (error) throw error;
    res.status(201).json(toSafeJob(job));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/jobs/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { data: existing } = await supabase.from('jobs').select('employer_id').eq('id', req.params.id).single();
    if (!existing || existing.employer_id !== req.user.id) return res.status(404).json({ message: 'Job not found' });
    const { data: job, error } = await supabase.from('jobs').update({ status: req.body.status }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(toSafeJob(job));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
