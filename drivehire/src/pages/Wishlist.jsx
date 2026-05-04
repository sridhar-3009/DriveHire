import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { normalizeJob, FALLBACK_JOBS } from '../data/jobs';
import useStore from '../store/useStore';
import JobCard from '../components/JobCard';

export default function Wishlist() {
  const { user, wishlist } = useStore();
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    api.getJobs()
      .then(data => setAllJobs(data.map(normalizeJob)))
      .catch(() => setAllJobs(FALLBACK_JOBS))
      .finally(() => setLoading(false));
  }, []);

  const savedJobs = allJobs.filter(j => wishlist.includes(j.id));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ width: '44px', height: '44px', background: '#fdf2f8', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Heart size={20} style={{ color: '#db2777' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>Saved Jobs</h1>
            <p style={{ fontSize: '14px', color: '#64748b' }}>
              {loading ? 'Loading...' : `${savedJobs.length} job${savedJobs.length !== 1 ? 's' : ''} saved`}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: '#94a3b8', gap: '12px', alignItems: 'center' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : savedJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
            <p style={{ fontSize: '56px', marginBottom: '16px' }}>💔</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>No saved jobs yet</p>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Bookmark jobs while browsing to save them here</p>
            <Link to="/jobs" style={{ display: 'inline-block', padding: '12px 28px', background: '#0ea5e9', color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' }}>
              Browse Bus Jobs
            </Link>
          </div>
        ) : (
          <div className="grid-3">
            {savedJobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
