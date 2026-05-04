import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
  fontSize: '14px', color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
};

const Field = ({ label, children, half }) => (
  <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>{label}</label>
    {children}
  </div>
);

const FormSection = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>
    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>{title}</h3>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {children}
    </div>
  </div>
);

export default function PostJob() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', location: '', salaryMin: '', salaryMax: '',
    route: 'City', experience: '1+ year', accommodation: false, food: false,
    description: '', urgent: false, openings: 1, deadline: '',
  });

  if (!user || user.role !== 'employer') return <Navigate to="/login" />;

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const salary = form.salaryMin && form.salaryMax
        ? `₹${Number(form.salaryMin).toLocaleString('en-IN')} – ₹${Number(form.salaryMax).toLocaleString('en-IN')}/mo`
        : form.salaryMin
        ? `₹${Number(form.salaryMin).toLocaleString('en-IN')}/mo`
        : 'Negotiable';

      await api.postJob({
        title: form.title,
        location: form.location,
        salary,
        route: form.route,
        experience: form.experience,
        accommodation: form.accommodation,
        food: form.food,
        description: form.description || `Looking for an experienced bus driver for ${form.route.toLowerCase()} routes in ${form.location}.`,
        urgent: form.urgent,
        vehicleType: 'bus',
        openings: Number(form.openings) || 1,
        deadline: form.deadline || null,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/manage-jobs'), 2200);
    } catch (err) {
      setError(err.message || 'Failed to post job. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '48px 32px', background: '#fff', borderRadius: '24px', border: '1.5px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', maxWidth: '380px', width: '100%', margin: '0 24px' }}>
        <div style={{ width: '72px', height: '72px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} style={{ color: '#22c55e' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Job Posted!</h2>
        <p style={{ fontSize: '14px', color: '#64748b' }}>Your listing is live. Redirecting to your jobs...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Post a Bus Driver Job</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Fill in the details to attract the right candidates</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormSection title="Job Details">
            <Field label="Job Title">
              <input required value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. City Bus Driver" style={inputStyle} />
            </Field>

            <Field label="Location">
              <input required value={form.location} onChange={e => setField('location', e.target.value)} placeholder="e.g. Mumbai, Maharashtra" style={inputStyle} />
            </Field>

            <Field label="Job Description">
              <textarea
                rows={3} value={form.description}
                onChange={e => setField('description', e.target.value)}
                placeholder="Describe the role and responsibilities..."
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              />
            </Field>

            <Field label="Options">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 14px', border: `1.5px solid ${form.urgent ? '#dc2626' : '#e5e7eb'}`, borderRadius: '10px', background: form.urgent ? '#fef2f2' : '#fff', fontSize: '13px', fontWeight: 500, color: form.urgent ? '#dc2626' : '#374151' }}>
                  <input type="checkbox" checked={form.urgent} onChange={e => setField('urgent', e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#dc2626' }} />
                  🔴 Mark as Urgent
                </label>
              </div>
            </Field>
          </FormSection>

          <FormSection title="Salary & Requirements">
            <Field label="Min Salary (₹/month)" half>
              <input type="number" value={form.salaryMin} onChange={e => setField('salaryMin', e.target.value)} placeholder="15000" style={inputStyle} />
            </Field>
            <Field label="Max Salary (₹/month)" half>
              <input type="number" value={form.salaryMax} onChange={e => setField('salaryMax', e.target.value)} placeholder="25000" style={inputStyle} />
            </Field>

            <Field label="Route Type" half>
              <select value={form.route} onChange={e => setField('route', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>City</option>
                <option>Interstate</option>
                <option>School</option>
                <option>Corporate</option>
                <option>Local</option>
              </select>
            </Field>
            <Field label="Experience Required" half>
              <select value={form.experience} onChange={e => setField('experience', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option>0 years (Fresher)</option>
                <option>1+ year</option>
                <option>2+ years</option>
                <option>3+ years</option>
                <option>5+ years</option>
              </select>
            </Field>

            <Field label="No. of Openings" half>
              <input type="number" min="1" max="100" value={form.openings} onChange={e => setField('openings', e.target.value)} placeholder="1" style={inputStyle} />
            </Field>

            <Field label="Application Deadline" half>
              <input type="date" value={form.deadline} min={new Date().toISOString().split('T')[0]} onChange={e => setField('deadline', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} />
            </Field>

            <Field label="Benefits Provided">
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {[{ k: 'accommodation', e: '🏠', l: 'Accommodation' }, { k: 'food', e: '🍱', l: 'Food / Meals' }].map(b => (
                  <label key={b.k} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 14px', border: `1.5px solid ${form[b.k] ? '#0ea5e9' : '#e5e7eb'}`, borderRadius: '10px', background: form[b.k] ? '#f0f9ff' : '#fff', transition: 'all 0.15s', fontSize: '14px', fontWeight: 500, color: form[b.k] ? '#0284c7' : '#374151' }}>
                    <input type="checkbox" checked={form[b.k]} onChange={e => setField(b.k, e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#0ea5e9' }} />
                    {b.e} {b.l}
                  </label>
                ))}
              </div>
            </Field>
          </FormSection>

          <button
            type="submit" disabled={submitting}
            style={{ width: '100%', padding: '15px', background: submitting ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            {submitting ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style> Posting...</> : 'Post Job Listing →'}
          </button>
        </form>
      </div>
    </div>
  );
}
