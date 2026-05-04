// Static fallback data (used when API is loading or unavailable)
export const FALLBACK_JOBS = [
  {
    _id: '1', id: 1,
    title: 'City Bus Driver', company: 'BEST Transport Co.',
    location: 'Mumbai, Maharashtra', salary: '₹20,000 – ₹28,000/mo',
    vehicleType: 'bus', experience: '2+ years', route: 'City',
    accommodation: false, food: false, createdAt: '2026-05-01', urgent: false,
    description: 'Drive AC city bus on fixed routes. Shift-based work. PF & ESI provided.',
    requirements: ['HMV License', '2+ yrs experience', 'Mumbai route knowledge'],
  },
  {
    _id: '2', id: 2,
    title: 'Interstate Bus Driver', company: 'Karnataka SRTC',
    location: 'Bangalore, Karnataka', salary: '₹30,000 – ₹42,000/mo',
    vehicleType: 'bus', experience: '5+ years', route: 'Interstate',
    accommodation: true, food: true, createdAt: '2026-05-02', urgent: true,
    description: 'Drive overnight sleeper buses on Bangalore–Hyderabad route.',
    requirements: ['HMV/Transport License', '5+ yrs exp', 'Night driving experience'],
  },
  {
    _id: '3', id: 3,
    title: 'School Bus Driver', company: 'Sunrise Academy',
    location: 'Chennai, Tamil Nadu', salary: '₹18,000 – ₹24,000/mo',
    vehicleType: 'bus', experience: '3+ years', route: 'City',
    accommodation: false, food: true, createdAt: '2026-05-02', urgent: false,
    description: 'Responsible driving for school children. Morning and afternoon shifts.',
    requirements: ['HMV License', '3+ yrs experience', 'Police verification required'],
  },
];

export const VEHICLE_ICONS  = { bus: '🚌' };
export const VEHICLE_LABELS = { bus: 'Bus Driver' };

// Normalize job from API (_id) or fallback (id)
export function normalizeJob(job) {
  return { ...job, id: job._id || job.id };
}
