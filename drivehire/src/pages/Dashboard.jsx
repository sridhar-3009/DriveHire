import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Briefcase, Heart, CheckCircle, Plus, Users, Eye, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';

const StatCard = ({ icon, label, value, bg }) => (
  <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: '46px', height: '46px', background: bg, borderRadius: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>{label}</p>
    </div>
  </div>
);

const Section = ({ title, action, children }) => (
  <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '22px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const STATUS_CFG = {
  Applied:     { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  Shortlisted: { bg: '#fefce8', text: '#92400e', dot: '#eab308' },
  Selected:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  Rejected:    { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
};

function DriverDashboard({ user, applications, loading }) {
  const completion = [user.name, user.email].filter(Boolean).length;
  const pct = Math.round((completion / 2) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', borderRadius: '20px', padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '130px', height: '130px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginBottom: '4px' }}>Welcome back,</p>
        <p style={{ color: '#fff', fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, marginBottom: '6px' }}>{user.name} 🚌</p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          {loading ? 'Loading...' : applications.length === 0 ? 'Start your bus driver job search!' : `${applications.length} application${applications.length > 1 ? 's' : ''} submitted`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ gap: '12px' }}>
        <StatCard icon={<Briefcase size={20} style={{ color: '#2563eb' }} />} label="Applied" value={loading ? '—' : applications.length} bg="#eff6ff" />
        <StatCard icon={<CheckCircle size={20} style={{ color: '#16a34a' }} />} label="Selected" value={loading ? '—' : applications.filter(a => a.status === 'Selected').length} bg="#f0fdf4" />
      </div>

      {/* Profile completion */}
      <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Profile Completion</p>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7' }}>{pct}%</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginBottom: '10px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(to right, #38bdf8, #0284c7)', borderRadius: '999px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Add experience & license for better matches</p>
          <Link to="/profile" style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}>Edit →</Link>
        </div>
      </div>

      {/* Recent applications */}
      <Section title="Recent Applications" action={<Link to="/applications" style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}>View all</Link>}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', color: '#94a3b8' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 20px' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>📋</p>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '14px' }}>No applications yet</p>
            <Link to="/jobs" style={{ display: 'inline-block', padding: '9px 20px', background: '#0ea5e9', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Browse Jobs</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {applications.slice(0, 4).map((app, i) => {
              const job = app.jobId || {};
              const cfg = STATUS_CFG[app.status] || STATUS_CFG.Applied;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{ fontSize: '22px', flexShrink: 0 }}>🚌</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title || 'Bus Driver Job'}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{job.company || ''}</p>
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: cfg.bg, color: cfg.text, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot }} />
                    {app.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Quick actions */}
      <div className="quick-actions">
        <Link to="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', background: '#0ea5e9', borderRadius: '16px', textDecoration: 'none' }}>
          <Briefcase size={20} style={{ color: '#fff', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Find Jobs</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Browse bus driver listings</p>
          </div>
        </Link>
        <Link to="/applications" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', textDecoration: 'none' }}>
          <Heart size={20} style={{ color: '#db2777', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>My Applications</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Track your status</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function EmployerDashboard({ user }) {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    api.employerJobs()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'active');
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicantCount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '20px', padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '130px', height: '130px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginBottom: '4px' }}>Welcome back,</p>
        <p style={{ color: '#fff', fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, marginBottom: '6px' }}>{user.name} 👋</p>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
          {jobsLoading ? 'Loading...' : `${activeJobs.length} active job${activeJobs.length !== 1 ? 's' : ''} · ${jobs.length} total`}
        </p>
      </div>

      <div className="grid-2" style={{ gap: '12px' }}>
        <StatCard icon={<Briefcase size={20} style={{ color: '#4f46e5' }} />} label="Jobs Posted" value={jobsLoading ? '—' : jobs.length} bg="#eef2ff" />
        <StatCard icon={<Users size={20} style={{ color: '#0284c7' }} />} label="Total Applicants" value={jobsLoading ? '—' : totalApplicants} bg="#f0f9ff" />
      </div>

      <Section title="Recent Job Listings" action={<Link to="/manage-jobs" style={{ fontSize: '13px', fontWeight: 600, color: '#4f46e5', textDecoration: 'none' }}>Manage all →</Link>}>
        {jobsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px', color: '#94a3b8' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 20px' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>📋</p>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '14px' }}>No jobs posted yet</p>
            <Link to="/post-job" style={{ display: 'inline-block', padding: '9px 20px', background: '#4f46e5', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Post First Job</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {jobs.slice(0, 4).map((job, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>🚌</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
                    <p style={{ fontSize: '12px', color: '#64748b' }}>{job.location}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: job.status === 'active' ? '#f0fdf4' : '#f8fafc', color: job.status === 'active' ? '#16a34a' : '#64748b' }}>
                    {job.status === 'active' ? 'Active' : 'Closed'}
                  </span>
                  <Link to={`/applicants/${job._id}`} style={{ padding: '6px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', color: '#64748b', textDecoration: 'none' }}>
                    <Eye size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="quick-actions">
        <Link to="/post-job" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', background: '#4f46e5', borderRadius: '16px', textDecoration: 'none' }}>
          <Plus size={20} style={{ color: '#fff', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>Post Bus Job</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>Hire now</p>
          </div>
        </Link>
        <Link to="/manage-jobs" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', textDecoration: 'none' }}>
          <Users size={20} style={{ color: '#4f46e5', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Manage Jobs</p>
            <p style={{ fontSize: '12px', color: '#64748b' }}>View & edit listings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, applications, fetchApplications, loading } = useStore();
  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    if (user?.role === 'driver') fetchApplications();
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-form">
        {user.role === 'driver'
          ? <DriverDashboard user={user} applications={applications} loading={loading} />
          : <EmployerDashboard user={user} />
        }
      </div>
    </div>
  );
}
