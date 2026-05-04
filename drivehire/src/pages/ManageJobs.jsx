import { useState, useEffect } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, ToggleLeft, ToggleRight, Loader2, Briefcase } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';

export default function ManageJobs() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  if (!user || user.role !== 'employer') return <Navigate to="/login" />;

  useEffect(() => {
    api.employerJobs()
      .then(setJobs)
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = async (job) => {
    const next = job.status === 'active' ? 'closed' : 'active';
    setToggling(job._id);
    try {
      const updated = await api.updateJobStatus(job._id, next);
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: updated.status } : j));
    } catch {
      // noop
    } finally {
      setToggling(null);
    }
  };

  const activeCount = jobs.filter(j => j.status === 'active').length;
  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicantCount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-content">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', background: '#eef2ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Briefcase size={20} style={{ color: '#4f46e5' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>My Job Listings</h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {loading ? 'Loading...' : `${jobs.length} total · ${activeCount} active`}
              </p>
            </div>
          </div>
          <Link to="/post-job" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#4f46e5', color: '#fff', borderRadius: '12px', fontSize: '14px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
            <Plus size={16} /> Post New Job
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8', gap: '12px', alignItems: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
            <p style={{ fontSize: '56px', marginBottom: '16px' }}>📋</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No jobs posted yet</p>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Post your first bus driver job to start receiving applications</p>
            <Link to="/post-job" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#4f46e5', color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              <Plus size={16} /> Post a Job
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {jobs.map(job => (
              <div key={job._id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {/* Icon + Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                    🚌
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                      <span>📍 {job.location}</span>
                      <span>💰 {job.salary}</span>
                      <span>👥 {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
                      <span>🗓 {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Status badge */}
                <span style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: job.status === 'active' ? '#f0fdf4' : '#f8fafc', color: job.status === 'active' ? '#16a34a' : '#64748b', border: `1px solid ${job.status === 'active' ? '#bbf7d0' : '#e2e8f0'}`, flexShrink: 0 }}>
                  {job.status === 'active' ? '● Active' : '○ Closed'}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => navigate(`/applicants/${job._id}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}
                  >
                    <Users size={14} /> Applicants
                  </button>
                  <button
                    onClick={() => handleToggleStatus(job)}
                    disabled={toggling === job._id}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: job.status === 'active' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${job.status === 'active' ? '#fecaca' : '#bbf7d0'}`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: job.status === 'active' ? '#dc2626' : '#16a34a', cursor: toggling === job._id ? 'not-allowed' : 'pointer' }}
                  >
                    {toggling === job._id
                      ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      : job.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />
                    }
                    {job.status === 'active' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
