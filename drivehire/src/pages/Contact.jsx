import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
};

const TOPICS = ['General Enquiry', 'Job Posting Issue', 'KYC Problem', 'Account Issue', 'Report Fraud', 'Partnership', 'Other'];

export default function Contact() {
  const toast = useToast(s => s.show);
  const [form, setForm] = useState({ name: '', email: '', topic: 'General Enquiry', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast('Fill all required fields', 'error'); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    toast('Message sent! We\'ll reply within 24 hours.', 'success');
  };

  if (sent) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <div style={{ width: '72px', height: '72px', background: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} style={{ color: '#16a34a' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Message Sent!</h2>
        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, marginBottom: '20px' }}>
          Thanks for reaching out. Our team will get back to you at <strong>{form.email}</strong> within 24 business hours.
        </p>
        <button onClick={() => setSent(false)} style={{ padding: '12px 28px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
          Send Another
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <MessageSquare size={26} style={{ color: '#0284c7' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Contact Us</h1>
          <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
            Have a question or issue? We're here to help. Usually respond within 24 hours.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: <Mail size={20} style={{ color: '#0284c7' }} />, label: 'Email', value: 'support@drivehire.in', sub: 'Replies within 24 hours' },
              { icon: <Phone size={20} style={{ color: '#16a34a' }} />, label: 'Phone', value: '+91 80 4567 8900', sub: 'Mon–Sat, 9 AM – 6 PM IST' },
              { icon: <MapPin size={20} style={{ color: '#dc2626' }} />, label: 'Office', value: 'Bangalore, Karnataka', sub: 'India – 560001' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{item.value}</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{item.sub}</p>
                </div>
              </div>
            ))}

            <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '16px', padding: '18px 20px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7', marginBottom: '8px' }}>🚨 Urgent Issues</p>
              <p style={{ fontSize: '13px', color: '#0369a1', lineHeight: 1.6 }}>For fraud reports or account security issues, email <strong>security@drivehire.in</strong> with subject "URGENT".</p>
            </div>
          </div>

          {/* Form */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '28px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>Send a Message</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Your Name *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Raju Kumar" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Email Address *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Topic</label>
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {TOPICS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Message *</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Describe your issue or question..."
                  rows={5} style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '13px', background: loading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
