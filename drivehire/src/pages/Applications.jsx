import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, Loader2, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { useToast } from '../components/Toast';

const STATUS = {
  Applied:     { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' },
  Shortlisted: { bg: '#fefce8', text: '#92400e', dot: '#eab308' },
  Selected:    { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' },
  Rejected:    { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
};

export default function Applications() {
  const { user, applications, fetchApplications, loading } = useStore();
  const toast = useToast(s => s.show);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(null);
  const [expanded, setExpanded] = useState({});

  if (!user) return <Navigate to="/login" />;

  useEffect(() => { fetchApplications(); }, []);

  const enriched = applications.map(app => ({ ...app, job: app.jobId })).filter(a => a.job);

  const handleWithdraw = async (app) => {
    setWithdrawingId(app._id);
    try {
      await api.withdrawApp(app._id);
      await fetchApplications();
      toast('Application withdrawn', 'success');
    } catch (err) {
      toast(err.message || 'Cannot withdraw', 'error');
    } finally {
      setWithdrawingId(null);
      setConfirmWithdraw(null);
    }
  };

  const counts = Object.keys(STATUS).reduce((acc, s) => {
    acc[s] = enriched.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-narrow">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{ width: '44px', height: '44px', background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Briefcase size={20} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>My Applications</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>{loading ? 'Loading...' : `${enriched.length} application${enriched.length !== 1 ? 's' : ''}`}</p>
          </div>
        </div>

        {/* Status summary pills */}
        {!loading && enriched.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {Object.entries(counts).map(([s, c]) => c > 0 ? (
              <span key={s} style={{ padding: '5px 14px', background: STATUS[s].bg, color: STATUS[s].text, borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: STATUS[s].dot }} />{c} {s}
              </span>
            ) : null)}
          </div>
        )}

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
              const isExp = expanded[app._id];
              return (
                <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '18px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '180px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                        🚌
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Link to={`/jobs/${app.job._id}`} style={{ textDecoration: 'none' }}>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job.title}</p>
                        </Link>
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
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      {app.interviewDate && (
                        <p style={{ fontSize: '12px', color: '#0284c7', marginTop: '3px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <Calendar size={11} /> {new Date(app.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expand / collapse cover letter + actions */}
                  {(app.coverLetter || app.status === 'Applied') && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      {app.coverLetter ? (
                        <button onClick={() => setExpanded(e => ({ ...e, [app._id]: !e[app._id] }))} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#0284c7', padding: 0 }}>
                          {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          {isExp ? 'Hide' : 'View'} Cover Letter
                        </button>
                      ) : <div />}

                      {app.status === 'Applied' && (
                        confirmWithdraw === app._id ? (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>Confirm withdraw?</span>
                            <button onClick={() => handleWithdraw(app)} disabled={withdrawingId === app._id}
                              style={{ padding: '5px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>
                              {withdrawingId === app._id ? '...' : 'Yes'}
                            </button>
                            <button onClick={() => setConfirmWithdraw(null)} style={{ padding: '5px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <X size={11} /> Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmWithdraw(app._id)} style={{ padding: '5px 12px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#94a3b8', cursor: 'pointer' }}>
                            Withdraw
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {isExp && app.coverLetter && (
                    <div style={{ marginTop: '10px', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', fontSize: '13px', color: '#334155', lineHeight: 1.7, borderLeft: '3px solid #0ea5e9' }}>
                      {app.coverLetter}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Withdraw confirmation modal */}
      </div>
    </div>
  );
}
