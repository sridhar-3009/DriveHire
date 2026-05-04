import { useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, User, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
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
  const [expanded, setExpanded] = useState({});
  const [profileModal, setProfileModal] = useState(null);
  const [interviewDates, setInterviewDates] = useState({});

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
      const extra = newStatus === 'Shortlisted' && interviewDates[appId]
        ? { interviewDate: interviewDates[appId] } : {};
      const updated = await api.updateApp(appId, newStatus, extra);
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status: updated.status, interviewDate: updated.interviewDate } : a));
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
                      <button onClick={() => setProfileModal(driver)} style={{ width: '44px', height: '44px', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        <User size={20} style={{ color: '#0284c7' }} />
                      </button>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <button onClick={() => setProfileModal(driver)} style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{driver.name || 'Driver'}</button>
                          {driver.profile?.kycStatus === 'verified' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: '#15803d', flexShrink: 0 }}>
                              ✅ Verified
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '3px' }}>{driver.email || ''}</p>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                          {driver.phone && <span>📞 {driver.phone}</span>}
                          {driver.profile?.experience > 0 && <span>🕒 {driver.profile.experience} yr exp.</span>}
                          {driver.profile?.location && <span>📍 {driver.profile.location}</span>}
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
                      {app.interviewDate && (
                        <p style={{ fontSize: '11px', color: '#0284c7', marginTop: '3px', fontWeight: 600 }}>
                          📅 {new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cover letter */}
                  {app.coverLetter && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <button onClick={() => setExpanded(e => ({ ...e, [app._id]: !e[app._id] }))} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#0284c7', padding: 0 }}>
                        {expanded[app._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {expanded[app._id] ? 'Hide' : 'Show'} Cover Letter
                      </button>
                      {expanded[app._id] && (
                        <div style={{ marginTop: '10px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#334155', lineHeight: 1.7, borderLeft: '3px solid #0ea5e9' }}>
                          {app.coverLetter}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interview date input (shows when about to Shortlist) */}
                  {nextStatuses.includes('Shortlisted') && (
                    <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Calendar size={13} /> Interview Date <span style={{ fontWeight: 400 }}>(optional, sent to driver)</span>
                      </label>
                      <input type="date" value={interviewDates[app._id] || ''} min={new Date().toISOString().split('T')[0]}
                        onChange={e => setInterviewDates(d => ({ ...d, [app._id]: e.target.value }))}
                        style={{ padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' }} />
                    </div>
                  )}

                  {/* Action buttons */}
                  {nextStatuses.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
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

      {/* Driver Profile Modal */}
      {profileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) setProfileModal(null); }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>Driver Profile</h2>
              <button onClick={() => setProfileModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#94a3b8', lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '56px', height: '56px', background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={24} style={{ color: '#0284c7' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{profileModal.name}</p>
                  {profileModal.profile?.kycStatus === 'verified' && <span style={{ padding: '2px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: '#15803d' }}>✅ KYC Verified</span>}
                </div>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{profileModal.email}</p>
                {profileModal.phone && <p style={{ fontSize: '13px', color: '#64748b' }}>📞 {profileModal.phone}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profileModal.profile?.licenseNumber && <Row label="License No." value={profileModal.profile.licenseNumber} />}
              {profileModal.profile?.experience > 0 && <Row label="Experience" value={`${profileModal.profile.experience} years`} />}
              {profileModal.profile?.location && <Row label="Location" value={profileModal.profile.location} />}
              {profileModal.profile?.availability && <Row label="Availability" value={{ immediate: 'Immediate', '2weeks': 'In 2 weeks', '1month': 'In 1 month' }[profileModal.profile.availability] || profileModal.profile.availability} />}
              {profileModal.profile?.languages?.length > 0 && <Row label="Languages" value={profileModal.profile.languages.join(', ')} />}
            </div>
            <button onClick={() => { window.location.href = `mailto:${profileModal.email}`; }} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              📧 Contact via Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px' }}>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{value}</span>
    </div>
  );
}
