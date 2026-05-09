const router = require('express').Router();
const supabase = require('../lib/supabase');
const authMiddleware = require('../middleware/auth');
const { toSafeUser } = require('../lib/helpers');

function validateAadhaar(n) { return /^[2-9][0-9]{11}$/.test(n.replace(/\s|-/g, '')); }
function validateDL(dl) { return /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(dl.replace(/\s|-/g, '').toUpperCase()); }
function maskAadhaar(n) { const c = n.replace(/\s|-/g, ''); return `XXXX-XXXX-${c.slice(-4)}`; }

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { data: kyc } = await supabase.from('kyc')
      .select('id,user_id,dl_number,aadhaar_number,status,rejection_reason,submitted_at,reviewed_at,created_at')
      .eq('user_id', req.user.id).maybeSingle();
    res.json(kyc ? { ...kyc, _id: kyc.id } : { status: 'not_submitted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/submit', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'driver') return res.status(403).json({ message: 'Drivers only' });
    const { aadhaarNumber, aadhaarFront, aadhaarBack, dlNumber, dlFront, selfie } = req.body;
    if (!validateAadhaar(aadhaarNumber)) return res.status(400).json({ message: 'Invalid Aadhaar number' });
    if (!validateDL(dlNumber)) return res.status(400).json({ message: 'Invalid DL number format' });
    if (!aadhaarFront || !aadhaarBack || !dlFront || !selfie) return res.status(400).json({ message: 'All documents required' });

    const { error } = await supabase.from('kyc').upsert({
      user_id: req.user.id,
      aadhaar_number: maskAadhaar(aadhaarNumber),
      aadhaar_front: aadhaarFront, aadhaar_back: aadhaarBack,
      dl_number: dlNumber.replace(/\s|-/g, '').toUpperCase(),
      dl_front: dlFront, selfie,
      status: 'pending', submitted_at: new Date().toISOString(), rejection_reason: '',
    }, { onConflict: 'user_id' });
    if (error) throw error;

    await supabase.from('users').update({ kyc_status: 'pending' }).eq('id', req.user.id);
    await supabase.from('notifications').insert({ user_id: req.user.id, message: 'KYC submitted. Under review (24-48 hrs).', type: 'status', link: '/profile' });
    res.json({ message: 'KYC submitted successfully', status: 'pending' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:userId/review', async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) return res.status(403).json({ message: 'Unauthorized' });
    const { status, rejectionReason } = req.body;
    if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ message: 'Status must be verified or rejected' });
    const { data: kyc, error } = await supabase.from('kyc')
      .update({ status, rejection_reason: rejectionReason || '', reviewed_at: new Date().toISOString() })
      .eq('user_id', req.params.userId).select().single();
    if (error || !kyc) return res.status(404).json({ message: 'KYC not found' });
    await supabase.from('users').update({ kyc_status: status }).eq('id', req.params.userId);
    const msg = status === 'verified' ? 'Your KYC is verified! ✅' : `KYC rejected: ${rejectionReason || 'Documents unclear'}. Please resubmit.`;
    await supabase.from('notifications').insert({ user_id: req.params.userId, message: msg, type: 'status', link: '/profile' });
    res.json({ ...kyc, _id: kyc.id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/pending', async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) return res.status(403).json({ message: 'Unauthorized' });
    const { data: list, error } = await supabase.from('kyc').select('*, user:users(name,email,phone,id)')
      .eq('status', 'pending').order('submitted_at', { ascending: true });
    if (error) throw error;
    res.json(list.map(k => ({ ...k, _id: k.id, userId: k.user ? { ...k.user, _id: k.user_id } : k.user_id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
