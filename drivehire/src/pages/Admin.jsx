import { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
};

export default function Admin() {
  const toast = useToast(s => s.show);
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kycs, setKycs] = useState([]);
  const [updating, setUpdating] = useState(null);
  const [rejectReasons, setRejectReasons] = useState({});
  const [expanded, setExpanded] = useState({});

  const load = async (s) => {
    setLoading(true);
    try {
      const data = await api.kycPending(s);
      setKycs(data);
      setAuthed(true);
    } catch (err) {
      toast(err.message || 'Invalid admin secret', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (userId, status) => {
    const reason = rejectReasons[userId] || '';
    if (status === 'rejected' && !reason.trim()) {
      toast('Provide a rejection reason', 'error');
      return;
    }
    setUpdating(userId);
    try {
      await api.kycReview(userId, status, reason, secret);
      setKycs(prev => prev.filter(k => k.userId?._id !== userId));
      toast(status === 'verified' ? 'KYC approved ✅' : 'KYC rejected', status === 'verified' ? 'success' : 'info');
    } catch (err) {
      toast(err.message || 'Failed', 'error');
    } finally {
      setUpdating(null);
    }
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '24px', padding: '36px 32px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '44px', height: '44px', background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} style={{ color: '#0284c7' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Admin Panel</h1>
              <p style={{ fontSize: '13px', color: '#64748b' }}>KYC Review Dashboard</p>
            </div>
          </div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Admin Secret Key</label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type={showSecret ? 'text' : 'password'}
              value={secret}
              onChange={e => setSecret(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && secret && load(secret)}
              placeholder="Enter ADMIN_SECRET"
              style={{ ...inputStyle, paddingRight: '44px' }}
            />
            <button onClick={() => setShowSecret(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            onClick={() => secret && load(secret)}
            disabled={!secret || loading}
            style={{ width: '100%', padding: '13px', background: !secret || loading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: !secret || loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : 'Access Dashboard'}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={24} style={{ color: '#0284c7' }} />
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>KYC Review Panel</h1>
              <p style={{ fontSize: '13px', color: '#64748b' }}>{kycs.length} pending submission{kycs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button onClick={() => load(secret)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>

        {kycs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '1.5px solid #e2e8f0' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>✅</p>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>All caught up!</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>No pending KYC submissions</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {kycs.map(kyc => {
              const u = kyc.userId || {};
              const isExpanded = expanded[kyc._id];
              const isUpdating = updating === u._id;
              return (
                <div key={kyc._id} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{u.name}</p>
                        <span style={{ padding: '2px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '999px', fontSize: '11px', fontWeight: 700, color: '#d97706' }}>⏳ Pending</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b' }}>{u.email} · {u.phone || 'No phone'}</p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                        <span>Aadhaar: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{kyc.aadhaarNumber}</strong></span>
                        <span>DL: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{kyc.dlNumber}</strong></span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                        Submitted: {new Date(kyc.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(kyc.submittedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button onClick={() => setExpanded(e => ({ ...e, [kyc._id]: !e[kyc._id] }))}
                      style={{ padding: '8px 16px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      {isExpanded ? 'Hide Docs' : 'View Docs'}
                    </button>
                  </div>

                  {/* Documents */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ paddingTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Aadhaar Front', src: kyc.aadhaarFront },
                          { label: 'Aadhaar Back', src: kyc.aadhaarBack },
                          { label: 'DL Front', src: kyc.dlFront },
                          { label: 'Live Selfie', src: kyc.selfie, round: true },
                        ].map(doc => doc.src ? (
                          <div key={doc.label} style={{ textAlign: 'center' }}>
                            <img
                              src={doc.src} alt={doc.label}
                              style={{ width: doc.round ? '90px' : '120px', height: doc.round ? '90px' : '80px', objectFit: 'cover', borderRadius: doc.round ? '50%' : '10px', border: '2px solid #e2e8f0', display: 'block', marginBottom: '4px' }}
                            />
                            <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{doc.label}</p>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  {/* Review actions */}
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <input
                        value={rejectReasons[u._id] || ''}
                        onChange={e => setRejectReasons(r => ({ ...r, [u._id]: e.target.value }))}
                        placeholder="Rejection reason (required if rejecting)"
                        style={{ flex: 1, minWidth: '200px', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', outline: 'none', background: '#fff' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleReview(u._id, 'verified')}
                          disabled={isUpdating}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: isUpdating ? '#a7f3d0' : '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: isUpdating ? 'not-allowed' : 'pointer' }}
                        >
                          {isUpdating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />} Approve
                        </button>
                        <button
                          onClick={() => handleReview(u._id, 'rejected')}
                          disabled={isUpdating}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: isUpdating ? '#fecaca' : '#fef2f2', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: isUpdating ? 'not-allowed' : 'pointer' }}
                        >
                          {isUpdating ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={13} />} Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
