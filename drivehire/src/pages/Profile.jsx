import { useState, useEffect, useRef } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { User, AlertCircle, Loader2, Building2, ShieldCheck, Camera, Lock, Trash2, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { useToast } from '../components/Toast';

async function compressAvatar(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const size = 160;
        const canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const KYC_CFG = {
  not_submitted: { label: 'Not Verified', bg: '#f8fafc', border: '#e2e8f0', color: '#64748b', icon: '🔒' },
  pending:       { label: 'KYC Under Review', bg: '#fffbeb', border: '#fde68a', color: '#d97706', icon: '⏳' },
  verified:      { label: 'KYC Verified',     bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: '✅' },
  rejected:      { label: 'KYC Rejected — Resubmit', bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '❌' },
};

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
};

const Field = ({ label, hint, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{label}</label>
    {children}
    {hint && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{hint}</p>}
  </div>
);

const Section = ({ title, icon, children }) => (
  <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
      {icon}
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>{title}</h3>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {children}
    </div>
  </div>
);

export default function Profile() {
  const { user, updateProfile, loading, logout } = useStore();
  const toast = useToast(s => s.show);
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '',
    licenseNumber: '', licenseExpiry: '', experience: 0, location: '', languages: '', availability: 'immediate', bio: '',
    companyName: '', fleetSize: 0, companyLocation: '', companyWebsite: '', companyDesc: '',
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      licenseNumber: user.profile?.licenseNumber || '',
      licenseExpiry: user.profile?.licenseExpiry ? new Date(user.profile.licenseExpiry).toISOString().split('T')[0] : '',
      experience: user.profile?.experience ?? 0,
      location: user.profile?.location || '',
      languages: (user.profile?.languages || []).join(', '),
      availability: user.profile?.availability || 'immediate',
      bio: user.profile?.bio || '',
      companyName: user.company?.name || '',
      fleetSize: user.company?.fleetSize ?? 0,
      companyLocation: user.company?.location || '',
      companyWebsite: user.company?.website || '',
      companyDesc: user.company?.description || '',
    });
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAvatarChange = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setAvatarLoading(true);
    try {
      const avatar = await compressAvatar(file);
      await updateProfile({ avatar });
      toast('Profile photo updated!', 'success');
    } catch { toast('Failed to update photo', 'error'); }
    finally { setAvatarLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.next.length < 8) { toast('Min 8 characters', 'error'); return; }
    if (!/[0-9]/.test(pwForm.next)) { toast('Must contain at least one number', 'error'); return; }
    setPwLoading(true);
    try {
      await api.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      toast('Password changed!', 'success');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) { toast(err.message || 'Failed', 'error'); }
    finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) { toast('Enter your password to confirm', 'error'); return; }
    setDeleteLoading(true);
    try {
      await api.deleteAccount(deleteConfirm);
      logout();
      toast('Account deleted', 'info');
      navigate('/');
    } catch (err) { toast(err.message || 'Failed', 'error'); }
    finally { setDeleteLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = {
        name: form.name,
        phone: form.phone,
      };
      if (user.role === 'driver') {
        body.profile = {
          licenseNumber: form.licenseNumber,
          licenseExpiry: form.licenseExpiry || null,
          experience: Number(form.experience) || 0,
          location: form.location,
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          availability: form.availability,
          bio: form.bio,
        };
      } else {
        body.company = {
          name: form.companyName,
          fleetSize: Number(form.fleetSize) || 0,
          location: form.companyLocation,
          website: form.companyWebsite,
          description: form.companyDesc,
        };
      }
      await updateProfile(body);
      toast('Profile saved!', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to save profile.';
      setError(msg);
      toast(msg, 'error');
    }
  };

  const completion = user.role === 'driver' ? (() => {
    const fields = [form.name, form.phone, form.licenseNumber, String(form.experience), form.location];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })() : 100;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header with avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: '72px', height: '72px', background: '#f0f9ff', border: '2px solid #e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user.avatar
                ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={28} style={{ color: '#0284c7' }} />}
            </div>
            <button
              type="button"
              onClick={() => avatarRef.current?.click()}
              disabled={avatarLoading}
              style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', background: '#0ea5e9', border: '2px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
            >
              {avatarLoading ? <Loader2 size={12} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} /> : <Camera size={12} style={{ color: '#fff' }} />}
            </button>
            <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleAvatarChange(e.target.files[0])} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>{user.name}</h1>
            <p style={{ fontSize: '13px', color: '#64748b', textTransform: 'capitalize' }}>{user.role} · {user.email}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Click camera to update photo</p>
          </div>
        </div>

        {/* Profile completion + KYC (drivers) */}
        {user.role === 'driver' && (() => {
          const kycStatus = user.profile?.kycStatus || 'not_submitted';
          const kyc = KYC_CFG[kycStatus] || KYC_CFG.not_submitted;
          return (
            <>
              <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Profile Completion</p>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7' }}>{completion}%</span>
                </div>
                <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${completion}%`, background: 'linear-gradient(to right, #38bdf8, #0284c7)', borderRadius: '999px', transition: 'width 0.3s' }} />
                </div>
                {completion < 100 && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '7px' }}>Complete your profile to get better job matches</p>}
              </div>

              <Link to="/kyc" style={{ textDecoration: 'none', display: 'block', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: kyc.bg, border: `1.5px solid ${kyc.border}`, borderRadius: '14px', padding: '14px 18px', cursor: 'pointer', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck size={18} style={{ color: kyc.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: kyc.color }}>{kyc.icon} {kyc.label}</p>
                      {kycStatus === 'not_submitted' && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>Complete KYC to get a Verified badge</p>}
                      {kycStatus === 'verified' && <p style={{ fontSize: '12px', color: '#15803d', marginTop: '1px' }}>Your identity is verified</p>}
                    </div>
                  </div>
                  {kycStatus !== 'verified' && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: kyc.color, whiteSpace: 'nowrap' }}>
                      {kycStatus === 'not_submitted' ? 'Start KYC →' : kycStatus === 'rejected' ? 'Resubmit →' : 'View Status →'}
                    </span>
                  )}
                </div>
              </Link>
            </>
          );
        })()}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <Section title="Basic Information" icon={<User size={16} style={{ color: '#0284c7' }} />}>
            <Field label="Full Name">
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" style={inputStyle} />
            </Field>
            <Field label="Phone Number" hint="Used by employers to contact you">
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" style={inputStyle} />
            </Field>
          </Section>

          {/* Driver-specific */}
          {user.role === 'driver' && (
            <Section title="Driver Details" icon={<span style={{ fontSize: '16px' }}>🚌</span>}>
              <Field label="License Number (HMV)" hint="Heavy Motor Vehicle license">
                <input value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} placeholder="e.g. MH02-20181234567" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Years of Experience">
                  <input type="number" min="0" max="50" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="0" style={inputStyle} />
                </Field>
                <Field label="Availability">
                  <select value={form.availability} onChange={e => set('availability', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="immediate">Immediate</option>
                    <option value="2weeks">In 2 weeks</option>
                    <option value="1month">In 1 month</option>
                  </select>
                </Field>
              </div>
              <Field label="Current Location" hint="City, State">
                <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Mumbai, Maharashtra" style={inputStyle} />
              </Field>
              <Field label="Languages Spoken" hint="Comma separated, e.g. Hindi, English, Marathi">
                <input value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="Hindi, English" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="License Expiry Date">
                  <input type="date" value={form.licenseExpiry} onChange={e => set('licenseExpiry', e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Bio" hint="Tell employers about yourself (max 500 chars)">
                <textarea value={form.bio} onChange={e => set('bio', e.target.value.slice(0, 500))} placeholder="Experienced bus driver with clean record..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>{form.bio.length}/500</p>
              </Field>
            </Section>
          )}

          {/* Employer-specific */}
          {user.role === 'employer' && (
            <Section title="Company Details" icon={<Building2 size={16} style={{ color: '#4f46e5' }} />}>
              <Field label="Company Name">
                <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="e.g. BEST Transport Co." style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Fleet Size" hint="Number of buses">
                  <input type="number" min="0" value={form.fleetSize} onChange={e => set('fleetSize', e.target.value)} placeholder="10" style={inputStyle} />
                </Field>
                <Field label="Company Location">
                  <input value={form.companyLocation} onChange={e => set('companyLocation', e.target.value)} placeholder="City, State" style={inputStyle} />
                </Field>
              </div>
              <Field label="Website" hint="Optional">
                <input value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)} placeholder="https://yourcompany.in" style={inputStyle} />
              </Field>
              <Field label="Company Description" hint="Tell drivers about your company (max 500 chars)">
                <textarea value={form.companyDesc} onChange={e => set('companyDesc', e.target.value.slice(0, 500))} placeholder="We operate a fleet of 50 buses across Maharashtra..." rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>{form.companyDesc.length}/500</p>
              </Field>
            </Section>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '15px', background: loading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style> Saving...</> : 'Save Profile'}
          </button>
        </form>

        {/* Change Password */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
            <Lock size={16} style={{ color: '#0284c7' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { key: 'current', label: 'Current Password', ph: 'Your current password' },
              { key: 'next',    label: 'New Password',     ph: 'Min 8 chars + 1 number' },
              { key: 'confirm', label: 'Confirm New Password', ph: 'Repeat new password' },
            ].map(({ key, label, ph }) => (
              <Field key={key} label={label}>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={ph}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                  />
                  {key === 'current' && (
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                      {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  )}
                </div>
              </Field>
            ))}
            <button type="submit" disabled={pwLoading}
              style={{ padding: '12px', background: pwLoading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: pwLoading ? 'not-allowed' : 'pointer' }}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div style={{ background: '#fff', border: '1.5px solid #fecaca', borderRadius: '20px', padding: '24px', marginTop: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #fef2f2' }}>
            <Trash2 size={16} style={{ color: '#dc2626' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#dc2626' }}>Delete Account</h3>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
            Permanently deletes your account, profile, applications, KYC data and all notifications. <strong>This cannot be undone.</strong>
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="password"
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Enter password to confirm"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !deleteConfirm}
              style={{ padding: '11px 18px', background: deleteLoading || !deleteConfirm ? '#fecaca' : '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: deleteLoading || !deleteConfirm ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {deleteLoading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
            </button>
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
