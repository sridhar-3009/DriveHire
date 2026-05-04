import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>{title}</h2>
    <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Shield size={28} style={{ color: '#0284c7' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>Privacy Policy</h1>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '36px' }}>Last updated: May 2026 · Effective immediately</p>

        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '32px' }}>

          <Section title="1. Who We Are">
            <p>DriveHire ("we", "us", "our") is an online job platform dedicated to connecting bus drivers with transport employers across India. Our platform is operated from India and governed by Indian law.</p>
            <p style={{ marginTop: '10px' }}>For privacy-related queries, contact us at: <strong>privacy@drivehire.in</strong></p>
          </Section>

          <Section title="2. Information We Collect">
            <p><strong>Account Information:</strong> Name, email address, phone number, and password (hashed using bcrypt — we never store plain-text passwords).</p>
            <p style={{ marginTop: '10px' }}><strong>Driver Profile:</strong> HMV license number, years of experience, location, languages spoken, availability preference.</p>
            <p style={{ marginTop: '10px' }}><strong>KYC Documents (Drivers only):</strong> Aadhaar card number (stored masked as XXXX-XXXX-XXXX — only last 4 digits visible), Aadhaar front/back photos, Driving License number and photo, live selfie. These are stored encrypted in our database and used solely for identity verification.</p>
            <p style={{ marginTop: '10px' }}><strong>Employer Information:</strong> Company name, fleet size, company location.</p>
            <p style={{ marginTop: '10px' }}><strong>Usage Data:</strong> Job applications, job postings, notification reads. We do not use third-party analytics trackers.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Providing and improving our job matching service</li>
              <li style={{ marginBottom: '8px' }}>Verifying driver identity through KYC to ensure platform safety</li>
              <li style={{ marginBottom: '8px' }}>Sending in-app notifications about job applications and status updates</li>
              <li style={{ marginBottom: '8px' }}>Displaying your profile to relevant employers (only after you apply)</li>
              <li style={{ marginBottom: '8px' }}>Preventing fraud and enforcing our Terms of Service</li>
            </ul>
            <p style={{ marginTop: '10px' }}>We <strong>do not sell, rent, or trade</strong> your personal data to third parties for marketing purposes.</p>
          </Section>

          <Section title="4. KYC Data & Aadhaar">
            <p>We collect Aadhaar data voluntarily for identity verification only. We comply with the <strong>Aadhaar (Targeted Delivery) Act, 2016</strong> and UIDAI guidelines. Your Aadhaar number is masked immediately upon storage. KYC documents are accessible only to our admin team for verification review and are never shared with employers.</p>
            <p style={{ marginTop: '10px' }}>You can request deletion of your KYC data at any time by deleting your account or contacting us.</p>
          </Section>

          <Section title="5. Data Sharing">
            <p><strong>With Employers:</strong> When you apply to a job, your name, phone number, experience, location, and KYC verification status are visible to that employer. Your Aadhaar number, DL number, and document photos are never shared.</p>
            <p style={{ marginTop: '10px' }}><strong>Service Providers:</strong> We use MongoDB Atlas (cloud database) for secure data storage. Their privacy policy applies to infrastructure-level processing.</p>
            <p style={{ marginTop: '10px' }}><strong>Legal Requirements:</strong> We may disclose data if required by Indian law or court order.</p>
          </Section>

          <Section title="6. Data Security">
            <p>We implement industry-standard security measures:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Passwords hashed with bcrypt (10 rounds)</li>
              <li style={{ marginBottom: '6px' }}>JWT authentication tokens with 7-day expiry</li>
              <li style={{ marginBottom: '6px' }}>HTTPS/TLS encryption in transit</li>
              <li style={{ marginBottom: '6px' }}>NoSQL injection prevention (mongo-sanitize)</li>
              <li style={{ marginBottom: '6px' }}>HTTP security headers (helmet.js)</li>
              <li style={{ marginBottom: '6px' }}>Rate limiting on authentication endpoints (15 attempts per 15 minutes)</li>
              <li style={{ marginBottom: '6px' }}>Account lockout after 5 failed login attempts</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>Under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and IT Act, 2000, you have the right to:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Access the personal data we hold about you</li>
              <li style={{ marginBottom: '6px' }}>Correct inaccurate data via Profile settings</li>
              <li style={{ marginBottom: '6px' }}>Delete your account and all associated data (Settings → Delete Account)</li>
              <li style={{ marginBottom: '6px' }}>Withdraw consent for KYC processing</li>
            </ul>
            <p style={{ marginTop: '10px' }}>To exercise these rights, use the in-app settings or contact <strong>privacy@drivehire.in</strong>.</p>
          </Section>

          <Section title="8. Cookies & Local Storage">
            <p>We use browser <strong>localStorage</strong> to store your authentication token and saved jobs (wishlist). No third-party cookies or tracking pixels are used. You can clear this data by logging out or clearing browser storage.</p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>DriveHire is intended for users 18 years and older. We do not knowingly collect data from minors. If you believe a minor has registered, contact us immediately.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. Material changes will be notified via in-app notifications. Continued use after changes constitutes acceptance.</p>
          </Section>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
            <Link to="/terms" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Terms of Service →</Link>
            <Link to="/contact" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Contact Us →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
