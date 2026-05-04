import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 24px 28px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '36px', marginBottom: '40px' }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '14px' }}>
              <div style={{ width: '34px', height: '34px', background: '#0ea5e9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={17} style={{ color: '#fff' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Drive<span style={{ color: '#38bdf8' }}>Hire</span></span>
            </Link>
            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#64748b', maxWidth: '220px' }}>
              India's dedicated bus driver job platform. Connecting 3,800+ drivers with fleet owners since 2024.
            </p>
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '12px' }}>
              🇮🇳 Made for India · Pan-India Coverage
            </p>
          </div>

          {/* For Drivers */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>For Drivers</p>
            {[
              { to: '/jobs',         label: 'Browse Jobs' },
              { to: '/register?role=driver', label: 'Create Profile' },
              { to: '/kyc',          label: 'KYC Verification' },
              { to: '/applications', label: 'My Applications' },
              { to: '/dashboard',    label: 'Dashboard' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', fontSize: '13px', color: '#64748b', textDecoration: 'none', marginBottom: '9px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#38bdf8'}
                onMouseLeave={e => e.target.style.color = '#64748b'}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* For Employers */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>For Employers</p>
            {[
              { to: '/register?role=employer', label: 'Post Jobs Free' },
              { to: '/post-job',    label: 'Create Listing' },
              { to: '/manage-jobs', label: 'Manage Jobs' },
              { to: '/drivers',     label: 'Search Drivers' },
              { to: '/admin',       label: 'Admin Panel' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', fontSize: '13px', color: '#64748b', textDecoration: 'none', marginBottom: '9px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#38bdf8'}
                onMouseLeave={e => e.target.style.color = '#64748b'}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Company</p>
            {[
              { to: '/about',   label: 'About Us' },
              { to: '/contact', label: 'Contact Us' },
              { to: '/faq',     label: 'FAQ' },
              { to: '/privacy', label: 'Privacy Policy' },
              { to: '/terms',   label: 'Terms of Service' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ display: 'block', fontSize: '13px', color: '#64748b', textDecoration: 'none', marginBottom: '9px', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = '#38bdf8'}
                onMouseLeave={e => e.target.style.color = '#64748b'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            © {new Date().getFullYear()} DriveHire. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[
              { to: '/privacy', label: 'Privacy' },
              { to: '/terms',   label: 'Terms' },
              { to: '/contact', label: 'Contact' },
            ].map(l => (
              <Link key={l.to} to={l.to} style={{ fontSize: '13px', color: '#475569', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#38bdf8'}
                onMouseLeave={e => e.target.style.color = '#475569'}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
