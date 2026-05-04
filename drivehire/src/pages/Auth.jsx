import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Truck, Eye, EyeOff, User, Building2, AlertCircle } from 'lucide-react';

function pwStrength(pw) {
  if (!pw) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: '#ef4444', pct: 25 };
  if (score === 2) return { label: 'Fair', color: '#f59e0b', pct: 50 };
  if (score === 3) return { label: 'Good', color: '#0ea5e9', pct: 75 };
  return { label: 'Strong', color: '#16a34a', pct: 100 };
}
import useStore from '../store/useStore';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
  fontSize: '14px', color: '#111827', background: '#fff', outline: 'none',
  transition: 'border-color 0.15s', boxSizing: 'border-box',
};

const Field = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '7px' }}>{label}</label>
    {children}
  </div>
);

export default function Auth({ mode = 'login' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, login, loading, error, clearError } = useStore();

  const defaultRole = searchParams.get('role') || 'driver';
  const [role, setRole] = useState(defaultRole);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [localError, setLocalError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isRegister = mode === 'register';
  const errMsg = localError || error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (!form.email || !form.password) { setLocalError('Fill all required fields.'); return; }
    if (isRegister && !form.name) { setLocalError('Name is required.'); return; }
    if (isRegister && form.password.length < 8) { setLocalError('Password must be at least 8 characters.'); return; }
    if (isRegister && !/[0-9]/.test(form.password)) { setLocalError('Password must contain at least one number.'); return; }
    if (isRegister && !agreedToTerms) { setLocalError('Please agree to the Terms and Privacy Policy.'); return; }

    try {
      if (isRegister) {
        await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role });
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch {
      // error shown from store
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '20px' }}>
            <div style={{ width: '44px', height: '44px', background: '#0ea5e9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
              <Truck style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
              Drive<span style={{ color: '#0ea5e9' }}>Hire</span>
            </span>
          </Link>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', marginBottom: '6px' }}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {isRegister ? 'Join India\'s bus driver community' : 'Sign in to continue to DriveHire'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '24px', padding: '28px 28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Role toggle (register only) */}
          {isRegister && (
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '14px', padding: '4px', gap: '4px' }}>
                {[
                  { r: 'driver',   label: '🚌 Bus Driver', Icon: User },
                  { r: 'employer', label: '🏢 Employer',   Icon: Building2 },
                ].map(({ r, label }) => (
                  <button
                    key={r} type="button" onClick={() => setRole(r)}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                      background: role === r ? '#fff' : 'transparent',
                      color: role === r ? '#0284c7' : '#64748b',
                      boxShadow: role === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {role === 'driver' && (
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', textAlign: 'center', background: '#f0f9ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  🚌 DriveHire is a <strong>bus driver</strong> platform — find bus driving jobs across India
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {errMsg && (
            <div style={{ marginBottom: '16px', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <Field label={role === 'employer' ? 'Company / Full Name' : 'Full Name'}>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={role === 'employer' ? 'Sharma Logistics Pvt Ltd' : 'Raju Kumar'} style={inputStyle} />
              </Field>
            )}

            <Field label="Email Address">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com" style={inputStyle} />
            </Field>

            {isRegister && (
              <Field label="Phone Number">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', padding: '11px 12px', background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#475569', fontWeight: 600, flexShrink: 0 }}>
                    +91
                  </span>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210" style={{ ...inputStyle, flex: 1 }} />
                </div>
              </Field>
            )}

            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters + 1 number" style={{ ...inputStyle, paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {isRegister && form.password && (() => {
                const s = pwStrength(form.password);
                return s ? (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Password strength</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: s.color }}>{s.label}</span>
                    </div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: '999px', transition: 'all 0.3s' }} />
                    </div>
                  </div>
                ) : null;
              })()}
            </Field>

            {isRegister && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '4px' }}>
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: '#0ea5e9', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" style={{ color: '#0284c7', fontWeight: 600 }}>Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" target="_blank" style={{ color: '#0284c7', fontWeight: 600 }}>Privacy Policy</Link>
                </span>
              </label>
            )}
            <button
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(14,165,233,0.3)', transition: 'background 0.15s' }}
            >
              {loading ? 'Please wait...' : isRegister
                ? `Create Account as ${role === 'driver' ? 'Bus Driver' : 'Employer'}`
                : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
            {isRegister
              ? <>Already have an account?{' '}<Link to="/login" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link></>
              : <>Don't have an account?{' '}<Link to="/register" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>Register free</Link></>
            }
          </p>
        </div>

        {/* Demo creds */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '12px', color: '#92400e', textAlign: 'center' }}>
          <strong>Demo:</strong> employer@demo.com / demo1234 (Employer) · or register as driver
        </div>
      </div>
    </div>
  );
}
