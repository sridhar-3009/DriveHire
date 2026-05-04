import { useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, User } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { useToast } from '../components/Toast';

const STATUS_CFG = {
  Applied:     { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6', label: 'Applied' },
  Shortlisted: { bg: '#fefce8', text: '#92400e', dot: '#eab308', label: 'Shortlisted' },
  Selected:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', label: 'Selected' },
  Rejected:    { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', label: 'Rejected' },
};

const TRANSITIONS = {
  Applied:     ['Shortlisted', 'Rejected'],
  Shortlisted: ['Selected', 'Rejected'],
  Selected:    [],
  Rejected:    ['Applied'],
};

export default function Applicants() {
  const { jobId } = useParams();
  const { user } = useStore();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const toast = useToast(s => s.show);

  if (!user || user.role !== 'employer') return <Navigate to="/login" />;

  useEffect(() => {
    Promise.all([
      api.jobApplicants(jobId),
      api.getJob(jobId),
    ]).then(([applications, job]) => {
      setApps(applications);
      setJobTitle(job.title || 'Job');
    }).catch(() => {
      setApps([]);
    }).finally(() => setLoading(false));
  }, [jobId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdating(appId);
    try {
      const updated = await api.updateApp(appId, newStatus);
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status: updated.status } : a));
      toast(`Applicant ${newStatus.toLowerCase()}`, 'success');
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const counts = Object.keys(STATUS_CFG).reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-narrow">

        <button onClick={() => navigate('/manage-jobs')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '20px', padding: '0' }}>
          <ArrowLeft size={16} /> Back to My Jobs
        </button>

        {/* Header */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '22px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                🚌
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(16px,3vw,20px)', fontWeight: 800, color: '#0f172a' }}>{jobTitle}</h1>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{loading ? '...' : `${apps.length} applicant${apps.length !== 1 ? 's' : ''}`}</p>
              </div>
            </div>
          </div>

          {/* Status counts */}
          {!loading && apps.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Object.entries(counts).map(([status, count]) => {
                const cfg = STATUS_CFG[status];
                return count > 0 ? (
                  <span key={status} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.dot}22` }}>
                    {count} {status}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8', gap: '12px', alignItems: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
            <p style={{ fontSize: '52px', marginBottom: '16px' }}>👤</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No applicants yet</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Share your job listing to attract candidates</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {apps.map(app => {
              const driver = app.userId || {};
              const cfg = STATUS_CFG[app.status] || STATUS_CFG.Applied;
              const nextStatuses = TRANSITIONS[app.status] || [];

              return (
                <div key={app._id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    {/* Driver info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                      <div style={{ width: '44px', height: '44px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={20} style={{ color: '#64748b' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{driver.name || 'Driver'}</p>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '3px' }}>{driver.email || ''}</p>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                          {driver.phone && <span>📞 {driver.phone}</span>}
                          {driver.profile?.experience > 0 && <span>🕒 {driver.profile.experience} yr exp.</span>}
                          {driver.profile?.location && <span>📍 {driver.profile.location}</span>}
                          {driver.profile?.licenseNumber && <span>🪪 {driver.profile.licenseNumber}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Status + date */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: cfg.bg, color: cfg.text }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot }} />
                        {app.status}
                      </span>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {nextStatuses.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                      {nextStatuses.map(status => {
                        const isPositive = status === 'Selected' || status === 'Shortlisted';
                        const isReopen = status === 'Applied';
                        return (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(app._id, status)}
                            disabled={updating === app._id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                              cursor: updating === app._id ? 'not-allowed' : 'pointer', border: 'none',
                              background: isPositive ? '#0ea5e9' : isReopen ? '#f8fafc' : '#fef2f2',
                              color: isPositive ? '#fff' : isReopen ? '#475569' : '#dc2626',
                            }}
                          >
                            {updating === app._id
                              ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                              : isPositive ? <CheckCircle size={13} />
                              : isReopen ? <Clock size={13} />
                              : <XCircle size={13} />
                            }
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
