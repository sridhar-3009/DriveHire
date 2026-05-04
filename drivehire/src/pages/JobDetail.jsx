import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, IndianRupee, Briefcase, Clock, Home, CheckCircle, Bookmark, BookmarkCheck, Send, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { FALLBACK_JOBS, normalizeJob } from '../data/jobs';
import useStore from '../store/useStore';
import { useToast } from '../components/Toast';

const MetaItem = ({ icon: Icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
    <div style={{ width: '36px', height: '36px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={15} style={{ color: '#64748b' }} />
    </div>
    <div>
      <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{value}</p>
    </div>
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '22px', marginBottom: '14px', ...style }}>
    {children}
  </div>
);

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist, applyToJob, applications } = useStore();
  const toast = useToast(s => s.show);
  const [job, setJob] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setPageLoading(true);
    api.getJob(id)
      .then(data => setJob(normalizeJob(data)))
      .catch(() => {
        const fallback = FALLBACK_JOBS.find(j => String(j.id) === String(id) || String(j._id) === String(id));
        setJob(fallback || null);
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  if (pageLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#64748b' }}>
      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span>Loading job...</span>
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
      <p style={{ fontSize: '56px' }}>🚧</p>
      <p style={{ fontWeight: 600, color: '#334155', fontSize: '18px' }}>Job not found</p>
      <Link to="/jobs" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>← Back to jobs</Link>
    </div>
  );

  const saved = wishlist.includes(job.id);
  const applied = applications.find(a => {
    const appJobId = a.jobId?._id || a.jobId;
    return String(appJobId) === String(job.id);
  });

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await applyToJob(job.id);
      toast('Application submitted!', 'success');
    } catch {
      toast('Failed to apply. Try again.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-narrow">
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '20px', padding: '0' }}>
          <ArrowLeft size={16} /> Back to Jobs
        </button>

        {/* Header */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '220px' }}>
              <div style={{ width: '58px', height: '58px', background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
                🚌
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                  <h1 style={{ fontSize: 'clamp(16px,4vw,20px)', fontWeight: 800, color: '#0f172a' }}>{job.title}</h1>
                  {job.urgent && <span style={{ padding: '3px 10px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>🔴 Urgent</span>}
                </div>
                <p style={{ fontSize: '14px', color: '#475569', fontWeight: 500, marginBottom: '4px' }}>{job.company}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '13px' }}>
                  <MapPin size={13} /> {job.location}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
              <button onClick={() => { if (!user) { navigate('/login'); return; } toggleWishlist(job.id); }}
                style={{ width: '42px', height: '42px', border: `1.5px solid ${saved ? '#0ea5e9' : '#e2e8f0'}`, background: saved ? '#f0f9ff' : '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                {saved ? <BookmarkCheck size={18} style={{ color: '#0ea5e9' }} /> : <Bookmark size={18} style={{ color: '#94a3b8' }} />}
              </button>
              {applied ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 18px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#15803d' }}>
                  <CheckCircle size={15} /> Applied
                </div>
              ) : (
                <button onClick={handleApply} disabled={applying}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: applying ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: applying ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' }}>
                  <Send size={14} /> {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
            {[{ label: 'Bus Driver', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
              { label: `${job.route} Route`, bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
              { label: `${job.experience} exp.`, bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
            ].map((p, i) => (
              <span key={i} style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, background: p.bg, color: p.text, border: `1px solid ${p.border}` }}>{p.label}</span>
            ))}
          </div>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '18px', paddingTop: '18px', borderTop: '1px solid #f1f5f9' }}>
            <MetaItem icon={IndianRupee} label="Salary" value={job.salary} />
            <MetaItem icon={Briefcase}   label="Experience" value={job.experience} />
            <MetaItem icon={Clock}       label="Route" value={job.route} />
            <MetaItem icon={Home}        label="Accommodation" value={job.accommodation ? 'Provided' : 'Not included'} />
          </div>
        </Card>

        {/* Description */}
        <Card>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>Job Description</h2>
          <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.75 }}>{job.description}</p>
        </Card>

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <Card>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Requirements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {job.requirements.map((req, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={16} style={{ color: '#0ea5e9', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#334155' }}>{req}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Perks */}
        {(job.accommodation || job.food) && (
          <Card style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>Benefits & Perks</h2>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {job.accommodation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🏠</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Accommodation</p>
                    <p style={{ fontSize: '12px', color: '#0284c7' }}>Provided by employer</p>
                  </div>
                </div>
              )}
              {job.food && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🍱</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Food</p>
                    <p style={{ fontSize: '12px', color: '#0284c7' }}>Meals included</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {!user && (
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '8px' }}>Want to apply?</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', marginBottom: '20px' }}>Create a free bus driver account to apply</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: '11px 22px', background: '#fff', color: '#0284c7', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Register Free</Link>
              <Link to="/login" style={{ padding: '11px 22px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.35)' }}>Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
