const router = require('express').Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from('notifications').select('*')
      .eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    res.json(data.map(n => ({ ...n, _id: n.id, userId: n.user_id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await supabase.from('notifications').update({ read: true }).eq('user_id', req.user.id).eq('read', false);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    await supabase.from('notifications').update({ read: true }).eq('id', req.params.id).eq('user_id', req.user.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
