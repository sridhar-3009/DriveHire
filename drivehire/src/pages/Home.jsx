import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { FALLBACK_JOBS } from '../data/jobs';
import JobCard from '../components/JobCard';
import { api } from '../services/api';

const FALLBACK_STATS = [
  { value: '3,800+', label: 'Bus Drivers' },
  { value: '1,200+', label: 'Jobs Posted' },
  { value: '280+',   label: 'Fleet Owners' },
  { value: '4.8★',   label: 'Rating' },
];

const ROUTE_TYPES = [
  { type: 'City',        icon: '🌆', desc: 'Local city routes', color: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  { type: 'Interstate',  icon: '🛣️',  desc: 'Long-distance routes', color: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  { type: 'School',      icon: '🏫', desc: 'School bus drivers', color: '#fefce8', border: '#fde68a', text: '#92400e' },
  { type: 'Corporate',   icon: '🏢', desc: 'Employee shuttles', color: '#faf5ff', border: '#e9d5ff', text: '#7c3aed' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Profile', desc: 'Add your HMV license, experience, and preferred routes in minutes.' },
  { step: '02', title: 'Browse Jobs', desc: 'Filter by location, salary, route type — find the perfect bus job.' },
  { step: '03', title: 'Apply & Get Hired', desc: 'One-click apply. Fleet owners contact you directly.' },
];

export default function Home() {
  const [stats, setStats] = useState(null);
  const [liveJobs, setLiveJobs] = useState([]);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getJobs().then(jobs => setLiveJobs(jobs.slice(0, 3))).catch(() => {});
  }, []);

  const displayStats = stats ? [
    { value: stats.drivers > 0 ? `${stats.drivers.toLocaleString()}+` : '3,800+', label: 'Bus Drivers' },
    { value: stats.jobs > 0 ? `${stats.jobs.toLocaleString()}+` : '1,200+', label: 'Active Jobs' },
    { value: stats.employers > 0 ? `${stats.employers.toLocaleString()}+` : '280+', label: 'Fleet Owners' },
    { value: stats.verifiedDrivers > 0 ? `${stats.verifiedDrivers.toLocaleString()}+` : '4.8★', label: stats.verifiedDrivers > 0 ? 'Verified Drivers' : 'Rating' },
  ] : FALLBACK_STATS;

  const featuredJobs = liveJobs.length > 0 ? liveJobs : FALLBACK_JOBS;

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 55%, #38bdf8 100%)' }}>
        <div className="page-container hero-pad" style={{ paddingTop: '64px', paddingBottom: '80px', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '999px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
            🚌 India's Bus Driver Job Platform
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Find Your Next<br />
            <span style={{ color: '#fde68a' }}>Bus Driver Job</span> Today
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: 'rgba(255,255,255,0.85)', marginBottom: '32px', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto 32px' }}>
            Connect with 1,200+ fleet owners and transport companies across India. City buses, school buses, interstate coaches and more.
          </p>

          {/* Search bar */}
          <div className="hero-search">
            <div className="hero-search-field">
              <Search style={{ width: '17px', height: '17px', color: '#94a3b8', flexShrink: 0 }} />
              <input type="text" placeholder="Job title or company..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#334155', background: 'transparent', minWidth: 0 }} />
            </div>
            <div className="hero-search-loc">
              <MapPin style={{ width: '17px', height: '17px', color: '#94a3b8', flexShrink: 0 }} />
              <input type="text" placeholder="City" style={{ border: 'none', outline: 'none', fontSize: '14px', color: '#334155', width: '90px', background: 'transparent', minWidth: 0 }} />
            </div>
            <Link to="/jobs" style={{ background: '#0ea5e9', color: '#fff', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              Search <ArrowRight style={{ width: '15px', height: '15px' }} />
            </Link>
          </div>
          <p style={{ marginTop: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
            Popular: City Bus Mumbai · School Bus Chennai · Interstate Bangalore
          </p>
        </div>
        <div style={{ height: '40px', background: '#f8fafc', borderRadius: '24px 24px 0 0' }} />
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#f8fafc', paddingBottom: '48px' }}>
        <div className="page-container">
          <div className="grid-4">
            {displayStats.map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px 16px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>{s.value}</p>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Route ── */}
      <section style={{ background: '#fff', padding: '56px 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Browse by Route Type</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>All jobs are bus driver positions</p>
          </div>
          <div className="grid-4">
            {ROUTE_TYPES.map((rt, i) => (
              <Link
                key={i} to="/jobs"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: rt.color, border: `1.5px solid ${rt.border}`, borderRadius: '20px', padding: '24px 16px', textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ fontSize: '36px' }}>{rt.icon}</span>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>{rt.type} Bus</p>
                  <p style={{ fontSize: '12px', color: rt.text, fontWeight: 600 }}>{rt.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Jobs ── */}
      <section style={{ background: '#f8fafc', padding: '56px 0' }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(20px,4vw,30px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Latest Bus Driver Jobs</h2>
              <p style={{ fontSize: '14px', color: '#64748b', marginTop: '5px' }}>Fresh opportunities posted this week</p>
            </div>
            <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: '#0284c7', textDecoration: 'none', padding: '8px 16px', border: '1px solid #bae6fd', borderRadius: '10px', background: '#f0f9ff', whiteSpace: 'nowrap' }}>
              View all <ArrowRight style={{ width: '14px', height: '14px' }} />
            </Link>
          </div>
          <div className="grid-3">
            {featuredJobs.map((job, i) => <JobCard key={job._id || job.id || i} job={{ ...job, id: job._id || job.id }} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: '#fff', padding: '56px 0' }}>
        <div className="page-container">
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>How It Works</h2>
            <p style={{ fontSize: '15px', color: '#64748b', marginTop: '8px' }}>Get hired in 3 simple steps</p>
          </div>
          <div className="grid-3" style={{ gap: '28px' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#0ea5e9', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 20px rgba(14,165,233,0.3)' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{step.step}</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#f8fafc', padding: '48px 0 56px' }}>
        <div className="page-container">
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderRadius: '28px', padding: 'clamp(32px,5vw,56px) clamp(24px,5vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, color: '#fff', marginBottom: '10px', letterSpacing: '-0.3px' }}>Ready to Drive with DriveHire?</h2>
              <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Join thousands of bus drivers and fleet owners already on DriveHire.
              </p>
              <div className="cta-buttons">
                <Link to="/register?role=driver" style={{ padding: '14px 28px', background: '#fff', color: '#0284c7', fontWeight: 700, fontSize: '15px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  I'm a Bus Driver
                </Link>
                <Link to="/register?role=employer" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '15px', borderRadius: '12px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)' }}>
                  I'm Hiring Drivers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>🚌</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Drive<span style={{ color: '#38bdf8' }}>Hire</span></span>
        </div>
        <p style={{ fontSize: '13px', color: '#475569' }}>© 2026 DriveHire · India's bus driver job platform</p>
      </footer>
    </div>
  );
}
