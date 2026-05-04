import { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Loader2 } from 'lucide-react';
import useStore from '../store/useStore';

const STATUS = {
  Applied:     { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  Shortlisted: { bg: '#fefce8', text: '#92400e', dot: '#eab308' },
  Selected:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  Rejected:    { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
};

export default function Applications() {
  const { user, applications, fetchApplications, loading } = useStore();
  if (!user) return <Navigate to="/login" />;

  useEffect(() => { fetchApplications(); }, []);

  const enriched = applications
    .map(app => ({ ...app, job: app.jobId }))
    .filter(a => a.job);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-narrow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={20} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>My Applications</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>{loading ? 'Loading...' : `${enriched.length} application${enriched.length !== 1 ? 's' : ''}`}</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8', gap: '12px', alignItems: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : enriched.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '20px', border: '1.5px solid #e2e8f0' }}>
            <p style={{ fontSize: '52px', marginBottom: '16px' }}>📋</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No applications yet</p>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Apply to bus driver jobs to track them here</p>
            <Link to="/jobs" style={{ display: 'inline-block', padding: '12px 28px', background: '#0ea5e9', color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Find Jobs
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {enriched.map((app, i) => {
              const cfg = STATUS[app.status] || STATUS.Applied;
              return (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                    <div style={{ width: '48px', height: '48px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      🚌
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job.title}</p>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>{app.job.company}</p>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {app.job.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><IndianRupee size={11} /> {app.job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, background: cfg.bg, color: cfg.text }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                      {app.status}
                    </span>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                      {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
