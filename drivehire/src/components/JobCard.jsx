import { MapPin, IndianRupee, Briefcase, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VEHICLE_ICONS, VEHICLE_LABELS } from '../data/jobs';
import useStore from '../store/useStore';

const VEHICLE_COLORS = {
  truck:   { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  bus:     { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  auto:    { bg: '#fefce8', text: '#92400e', border: '#fde68a' },
  cleaner: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
};

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const { user, wishlist, toggleWishlist } = useStore();
  const saved = wishlist.includes(job.id);
  const vc = VEHICLE_COLORS[job.vehicleType] || VEHICLE_COLORS.truck;

  const handleSave = (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    toggleWishlist(job.id);
  };

  return (
    <div
      onClick={() => navigate(`/jobs/${job.id}`)}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = '#7dd3fc';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: vc.bg, border: `1px solid ${vc.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
          }}>
            {VEHICLE_ICONS[job.vehicleType]}
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', lineHeight: 1.3, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {job.title}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          style={{ flexShrink: 0, padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '8px', color: saved ? '#0ea5e9' : '#cbd5e1', transition: 'color 0.15s' }}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: vc.bg, color: vc.text, border: `1px solid ${vc.border}` }}>
          {VEHICLE_LABELS[job.vehicleType]}
        </span>
        {job.urgent && (
          <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            Urgent
          </span>
        )}
        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
          {job.route}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#475569' }}>{job.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IndianRupee size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{job.salary}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#475569' }}>{job.experience} exp.</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
          {job.accommodation && <span>🏠 Accommodation</span>}
          {job.food && <span>🍱 Food</span>}
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
          {(() => { const d = new Date(job.createdAt || job.postedAt); return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); })()}
        </span>
      </div>
    </div>
  );
}
