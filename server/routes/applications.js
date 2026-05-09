const router = require('express').Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { toSafeUser, toSafeJob } = require('../lib/helpers');

// POST /api/applications
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') return res.status(403).json({ message: 'Drivers only' });
    const { jobId, coverLetter = '' } = req.body;
    const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const { data: app, error } = await supabase.from('applications').insert({
      job_id: jobId, user_id: req.user.id,
      cover_letter: coverLetter.slice(0, 1000),
    }).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ message: 'Already applied' });
      throw error;
    }
    await supabase.from('notifications').insert({
      user_id: job.employer_id,
      message: `${req.user.name} applied for "${job.title}"`,
      type: 'application', link: `/applicants/${job.id}`,
    });
    res.status(201).json({ ...app, _id: app.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/applications/mine
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const { data: apps, error } = await supabase
      .from('applications').select('*, job:jobs(*)').eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(apps.map(a => ({
      ...a, _id: a.id,
      jobId: a.job ? toSafeJob(a.job) : a.job_id,
      coverLetter: a.cover_letter, interviewDate: a.interview_date,
    })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/applications/job/:jobId
router.get('/job/:jobId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const { data: job } = await supabase.from('jobs').select('employer_id').eq('id', req.params.jobId).single();
    if (!job || job.employer_id !== req.user.id) return res.status(404).json({ message: 'Job not found' });
    const { data: apps, error } = await supabase
      .from('applications').select('*, user:users(*)').eq('job_id', req.params.jobId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(apps.map(a => ({
      ...a, _id: a.id,
      userId: a.user ? toSafeUser(a.user) : a.user_id,
      coverLetter: a.cover_letter, interviewDate: a.interview_date,
    })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/applications/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'employer') return res.status(403).json({ message: 'Employers only' });
    const { data: app } = await supabase.from('applications')
      .select('*, job:jobs(*), user:users(id,name)').eq('id', req.params.id).single();
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.job.employer_id !== req.user.id) return res.status(403).json({ message: 'Not your job' });

    const upd = { status: req.body.status, updated_at: new Date().toISOString() };
    if (req.body.interviewDate !== undefined) upd.interview_date = req.body.interviewDate || null;
    const { data: updated, error } = await supabase.from('applications').update(upd).eq('id', req.params.id).select().single();
    if (error) throw error;

    const interviewNote = updated.interview_date
      ? ` Interview scheduled: ${new Date(updated.interview_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.` : '';
    const msgs = {
      Shortlisted: `You've been shortlisted for "${app.job.title}"!${interviewNote} 🎉`,
      Selected: `Congratulations! You're selected for "${app.job.title}" 🚌`,
      Rejected: `Your application for "${app.job.title}" was not selected.`,
    };
    if (msgs[req.body.status]) {
      await supabase.from('notifications').insert({ user_id: app.user.id, message: msgs[req.body.status], type: 'status', link: '/applications' });
    }
    res.json({ ...updated, _id: updated.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/applications/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') return res.status(403).json({ message: 'Drivers only' });
    const { data: app } = await supabase.from('applications').select('status').eq('id', req.params.id).eq('user_id', req.user.id).single();
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status !== 'Applied') return res.status(400).json({ message: 'Can only withdraw applications in Applied status' });
    await supabase.from('applications').delete().eq('id', req.params.id);
    res.json({ message: 'Application withdrawn successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
