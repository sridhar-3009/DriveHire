import { Link } from 'react-router-dom';
import { Shield, Users, Zap, MapPin } from 'lucide-react';

const VALUES = [
  { icon: <Shield size={24} style={{ color: '#0284c7' }} />, title: 'Verified Employers', desc: 'Every fleet owner and transport company is verified before posting jobs.', bg: '#f0f9ff' },
  { icon: <Zap size={24} style={{ color: '#d97706' }} />, title: 'Fast Hiring', desc: 'Apply in one click. Employers contact you directly — no middlemen.', bg: '#fffbeb' },
  { icon: <Users size={24} style={{ color: '#7c3aed' }} />, title: 'Driver First', desc: 'Built for drivers, not recruiters. Your profile, your terms.', bg: '#faf5ff' },
  { icon: <MapPin size={24} style={{ color: '#16a34a' }} />, title: 'Pan-India', desc: 'Jobs across Mumbai, Delhi, Bangalore, Chennai, Hyderabad and 200+ cities.', bg: '#f0fdf4' },
];

const TEAM = [
  { name: 'Arjun Mehta', role: 'Co-founder & CEO', icon: '👨‍💼' },
  { name: 'Priya Singh', role: 'Head of Operations', icon: '👩‍💼' },
  { name: 'Rahul Verma', role: 'Product & Technology', icon: '👨‍💻' },
];

export default function About() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', padding: '64px 0 80px' }}>
        <div className="page-container" style={{ textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '999px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.3)' }}>
            🚌 Our Story
          </span>
          <h1 style={{ fontSize: 'clamp(28px,5vw,46px)', fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.5px' }}>
            India's Bus Driver<br />Job Platform
          </h1>
          <p style={{ fontSize: 'clamp(14px,2vw,17px)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto' }}>
            We started DriveHire because finding a bus driver job in India was broken. Scattered WhatsApp groups, unreliable middlemen, and no transparency. We built something better.
          </p>
        </div>
        <div style={{ height: '40px', background: '#f8fafc', borderRadius: '24px 24px 0 0' }} />
      </section>

      {/* Stats */}
      <section style={{ background: '#f8fafc', paddingBottom: '56px' }}>
        <div className="page-container">
          <div className="grid-4">
            {[
              { v: '3,800+', l: 'Bus Drivers' },
              { v: '1,200+', l: 'Jobs Posted' },
              { v: '280+',   l: 'Fleet Owners' },
              { v: '22',     l: 'States Covered' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '22px', textAlign: 'center' }}>
                <p style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.5px' }}>{s.v}</p>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: '#fff', padding: '56px 0' }}>
        <div className="page-container">
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', marginBottom: '16px', letterSpacing: '-0.3px' }}>Our Mission</h2>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8 }}>
              India has over <strong>15 million commercial bus drivers</strong>. Most of them find jobs through word of mouth or contractors who take cuts. DriveHire cuts the middleman and connects drivers directly with fleet owners, school buses, state transport corporations, and private coach operators.
            </p>
            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.8, marginTop: '16px' }}>
              We believe every driver deserves transparent pay, verified employers, and the dignity of choosing their own job.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: '#f8fafc', padding: '56px 0' }}>
        <div className="page-container">
          <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '36px', letterSpacing: '-0.3px' }}>Why Drivers Choose DriveHire</h2>
          <div className="grid-4">
            {VALUES.map((v, i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
                <div style={{ width: '52px', height: '52px', background: v.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{v.title}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: '#fff', padding: '56px 0' }}>
        <div className="page-container">
          <h2 style={{ fontSize: 'clamp(22px,4vw,32px)', fontWeight: 800, color: '#0f172a', textAlign: 'center', marginBottom: '36px', letterSpacing: '-0.3px' }}>The Team</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {TEAM.map((m, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '28px 24px', textAlign: 'center', minWidth: '160px' }}>
                <div style={{ fontSize: '40px', marginBottom: '14px' }}>{m.icon}</div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{m.name}</p>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#f8fafc', padding: '48px 0 56px' }}>
        <div className="page-container">
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderRadius: '28px', padding: 'clamp(32px,5vw,56px) clamp(24px,5vw,48px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px,4vw,34px)', fontWeight: 800, color: '#fff', marginBottom: '10px', letterSpacing: '-0.3px' }}>Ready to join DriveHire?</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', marginBottom: '32px' }}>Free for drivers. Always.</p>
            <div className="cta-buttons">
              <Link to="/register?role=driver" style={{ padding: '14px 28px', background: '#fff', color: '#0284c7', fontWeight: 700, fontSize: '15px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                I'm a Bus Driver
              </Link>
              <Link to="/register?role=employer" style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: '15px', borderRadius: '12px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)' }}>
                I'm Hiring
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
