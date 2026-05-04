import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>{title}</h2>
    <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.8 }}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <FileText size={28} style={{ color: '#0284c7' }} />
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>Terms of Service</h1>
        </div>
        <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '36px' }}>Last updated: May 2026 · Please read carefully before using DriveHire</p>

        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '32px' }}>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px', marginBottom: '28px', fontSize: '13px', color: '#92400e' }}>
            <strong>Summary:</strong> DriveHire is a job-matching platform for bus drivers and employers in India. By using our service, you agree to use it honestly and lawfully. We are an intermediary platform — we do not employ drivers or guarantee job placements.
          </div>

          <Section title="1. Acceptance of Terms">
            <p>By registering or using DriveHire ("Platform", "Service"), you agree to be bound by these Terms. If you disagree, please do not use the Platform. These Terms are governed by the laws of India, specifically the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.</p>
          </Section>

          <Section title="2. Eligibility">
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>You must be <strong>18 years or older</strong> to use DriveHire</li>
              <li style={{ marginBottom: '8px' }}>Bus Drivers must hold a valid HMV (Heavy Motor Vehicle) driving license issued by the Government of India</li>
              <li style={{ marginBottom: '8px' }}>Employers must be a legally registered business or individual with authority to hire</li>
              <li style={{ marginBottom: '8px' }}>One account per person — creating multiple accounts is prohibited</li>
            </ul>
          </Section>

          <Section title="3. Driver Obligations">
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Provide accurate, current, and complete information in your profile</li>
              <li style={{ marginBottom: '8px' }}>Only submit genuine KYC documents — submitting fraudulent documents is illegal and may result in criminal liability</li>
              <li style={{ marginBottom: '8px' }}>Apply only to jobs you intend to pursue; spamming applications is grounds for suspension</li>
              <li style={{ marginBottom: '8px' }}>Keep your license and KYC documents updated</li>
              <li style={{ marginBottom: '8px' }}>DriveHire does not guarantee employment or interview calls</li>
            </ul>
          </Section>

          <Section title="4. Employer Obligations">
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>Post only genuine, legal job openings — fake listings are strictly prohibited</li>
              <li style={{ marginBottom: '8px' }}>Do not collect fees from drivers in exchange for jobs — this is illegal under Indian labor law</li>
              <li style={{ marginBottom: '8px' }}>Salary information must be accurate. Misleading salary ranges are grounds for account suspension</li>
              <li style={{ marginBottom: '8px' }}>Treat applicants with dignity; harassment or discrimination is prohibited</li>
              <li style={{ marginBottom: '8px' }}>Comply with all applicable Indian labor laws including Minimum Wages Act, PF/ESI requirements</li>
            </ul>
          </Section>

          <Section title="5. KYC Verification">
            <p>KYC verification is voluntary but increases trust and visibility. By submitting KYC:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>You confirm all submitted documents are genuine and belong to you</li>
              <li style={{ marginBottom: '6px' }}>You consent to DriveHire reviewing the documents for verification purposes</li>
              <li style={{ marginBottom: '6px' }}>Submitting forged documents violates Section 468 of IPC (forgery for fraud purposes) and may result in legal action</li>
            </ul>
          </Section>

          <Section title="6. Prohibited Activities">
            <p>You must not:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Use the platform for any illegal purpose</li>
              <li style={{ marginBottom: '6px' }}>Attempt to hack, scrape, or reverse-engineer the platform</li>
              <li style={{ marginBottom: '6px' }}>Submit false, misleading, or fraudulent information</li>
              <li style={{ marginBottom: '6px' }}>Harass other users</li>
              <li style={{ marginBottom: '6px' }}>Create fake accounts or impersonate others</li>
              <li style={{ marginBottom: '6px' }}>Post jobs that require upfront payment from candidates</li>
            </ul>
          </Section>

          <Section title="7. Platform as Intermediary">
            <p>DriveHire is an <strong>intermediary platform</strong> as defined under the IT Act, 2000. We do not:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Employ or contract any drivers directly</li>
              <li style={{ marginBottom: '6px' }}>Guarantee job placements or hiring outcomes</li>
              <li style={{ marginBottom: '6px' }}>Verify employer credentials beyond registration</li>
              <li style={{ marginBottom: '6px' }}>Take responsibility for employment disputes between drivers and employers</li>
            </ul>
            <p style={{ marginTop: '10px' }}>Any employment contract is solely between the driver and employer. We strongly recommend verifying employer credentials before joining.</p>
          </Section>

          <Section title="8. Account Suspension & Termination">
            <p>We reserve the right to suspend or permanently terminate accounts that:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li style={{ marginBottom: '6px' }}>Violate these Terms</li>
              <li style={{ marginBottom: '6px' }}>Submit fraudulent KYC documents</li>
              <li style={{ marginBottom: '6px' }}>Post fraudulent job listings</li>
              <li style={{ marginBottom: '6px' }}>Engage in spam or abusive behavior</li>
            </ul>
            <p style={{ marginTop: '10px' }}>You may delete your account at any time via Profile Settings.</p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>To the maximum extent permitted under Indian law, DriveHire shall not be liable for: lost employment opportunities, salary disputes, workplace injuries, or any indirect, incidental, or consequential damages arising from use of the Platform.</p>
          </Section>

          <Section title="10. Governing Law & Disputes">
            <p>These Terms are governed by Indian law. Any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996, with proceedings in Bangalore, Karnataka, India. You may also approach consumer forums as applicable.</p>
          </Section>

          <Section title="11. Contact">
            <p>For Terms-related queries: <strong>legal@drivehire.in</strong></p>
            <p style={{ marginTop: '6px' }}>DriveHire, Bangalore, Karnataka, India — 560001</p>
          </Section>

          <div style={{ paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
            <Link to="/privacy" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy →</Link>
            <Link to="/contact" style={{ fontSize: '13px', color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>Contact Us →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
