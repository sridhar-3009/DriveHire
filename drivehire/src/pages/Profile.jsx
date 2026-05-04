import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, AlertCircle, Loader2, Building2 } from 'lucide-react';
import useStore from '../store/useStore';
import { useToast } from '../components/Toast';

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
  const { user, updateProfile, loading } = useStore();
  const toast = useToast(s => s.show);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '',
    licenseNumber: '', experience: 0, location: '', languages: '', availability: 'immediate',
    companyName: '', fleetSize: 0, companyLocation: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      licenseNumber: user.profile?.licenseNumber || '',
      experience: user.profile?.experience ?? 0,
      location: user.profile?.location || '',
      languages: (user.profile?.languages || []).join(', '),
      availability: user.profile?.availability || 'immediate',
      companyName: user.company?.name || '',
      fleetSize: user.company?.fleetSize ?? 0,
      companyLocation: user.company?.location || '',
    });
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
          experience: Number(form.experience) || 0,
          location: form.location,
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          availability: form.availability,
        };
      } else {
        body.company = {
          name: form.companyName,
          fleetSize: Number(form.fleetSize) || 0,
          location: form.companyLocation,
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: '#f0f9ff', border: '2px solid #e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={24} style={{ color: '#0284c7' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: 800, color: '#0f172a' }}>{user.name}</h1>
            <p style={{ fontSize: '13px', color: '#64748b', textTransform: 'capitalize' }}>{user.role} · {user.email}</p>
          </div>
        </div>

        {/* Profile completion (drivers) */}
        {user.role === 'driver' && (
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Profile Completion</p>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0284c7' }}>{completion}%</span>
            </div>
            <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${completion}%`, background: 'linear-gradient(to right, #38bdf8, #0284c7)', borderRadius: '999px', transition: 'width 0.3s' }} />
            </div>
            {completion < 100 && <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '7px' }}>Complete your profile to get better job matches</p>}
          </div>
        )}

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
            </Section>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '15px', background: loading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style> Saving...</> : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
