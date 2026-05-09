const router = require('express').Router();
const bcrypt = require('bcryptjs');
const supabase = require('../lib/supabase');

router.post('/', async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const hash = await bcrypt.hash('demo1234', 10);
    const { data: employer } = await supabase.from('users').upsert({
      name: 'BEST Transport Co.', email: 'employer@demo.com',
      password: hash, role: 'employer',
      company_name: 'BEST Transport Co.', fleet_size: 120, company_location: 'Mumbai',
    }, { onConflict: 'email' }).select().single();

    if (!employer) return res.status(500).json({ message: 'Failed to create demo employer' });

    await supabase.from('jobs').delete().eq('employer_id', employer.id);

    const d30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const d14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const jobList = [
      { title: 'City Bus Driver', company: 'BEST Transport Co.', description: 'Drive AC city bus on fixed routes in Mumbai. Shift-based. PF & ESI provided.', salary: '₹20,000 – ₹28,000/mo', location: 'Mumbai, Maharashtra', route: 'City', experience: 2, openings: 5, deadline: d30, requirements: ['HMV License', '2+ yrs exp', 'Mumbai route knowledge'] },
      { title: 'School Bus Driver', company: 'Sunrise Academy', description: 'Responsible driving for school children. Morning and afternoon shifts only.', salary: '₹18,000 – ₹24,000/mo', location: 'Chennai, Tamil Nadu', route: 'School', experience: 3, openings: 2, deadline: d30, requirements: ['HMV License', '3+ yrs exp', 'Police verification required'] },
      { title: 'Interstate Bus Driver', company: 'Karnataka SRTC', description: 'Drive overnight sleeper buses on Bangalore–Hyderabad route. Excellent pay.', salary: '₹30,000 – ₹42,000/mo', location: 'Bangalore, Karnataka', route: 'Interstate', experience: 5, openings: 3, deadline: d14, requirements: ['HMV License', '5+ yrs exp', 'Night driving exp'] },
      { title: 'Electric Bus Driver', company: 'GreenMove Solutions', description: 'Drive new electric city buses. Training provided for EV handling.', salary: '₹22,000 – ₹30,000/mo', location: 'Hyderabad, Telangana', route: 'City', experience: 2, openings: 4, deadline: d14, requirements: ['HMV License', 'EV training (provided)', 'Clean record'] },
      { title: 'Tourist Bus Driver', company: 'SkyTours Pvt Ltd', description: 'Drive luxury tourist buses across hill stations and heritage routes.', salary: '₹25,000 – ₹35,000/mo', location: 'Delhi, NCR', route: 'Interstate', experience: 3, openings: 2, deadline: d30, requirements: ['HMV License', 'Tourist permit', 'English skills'] },
      { title: 'Corporate Shuttle Driver', company: 'TechPark Mobility', description: 'Drive AC mini-bus for IT company pickup/drop. Fixed shifts, weekends off.', salary: '₹16,000 – ₹22,000/mo', location: 'Pune, Maharashtra', route: 'Corporate', experience: 1, openings: 3, deadline: d30, requirements: ['HMV License', '1+ yr exp', 'Punctual'] },
      { title: 'Local Route Bus Driver', company: 'City Connect Transport', description: 'Drive local bus connecting suburbs to city center. Good base salary + incentives.', salary: '₹15,000 – ₹20,000/mo', location: 'Pune, Maharashtra', route: 'Local', experience: 1, openings: 6, deadline: d30, requirements: ['HMV License', 'Clean record'] },
      { title: 'Volvo Bus Driver', company: 'Raj Travels', description: 'Drive premium Volvo buses on Mumbai–Goa and Mumbai–Pune routes.', salary: '₹35,000 – ₹50,000/mo', location: 'Mumbai, Maharashtra', route: 'Interstate', experience: 5, openings: 2, deadline: d30, requirements: ['HMV License', '5+ yrs exp', 'Volvo exp preferred'] },
    ];

    const { data: jobs } = await supabase.from('jobs').insert(
      jobList.map(j => ({ ...j, employer_id: employer.id, vehicle_type: 'bus', status: 'active', type: 'Full-time' }))
    ).select();

    res.json({ message: `Seeded ${jobs.length} jobs`, employerEmail: 'employer@demo.com', employerPassword: 'demo1234' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
