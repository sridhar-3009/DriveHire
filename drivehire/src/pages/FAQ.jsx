import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    cat: 'Getting Started',
    items: [
      { q: 'What is DriveHire?', a: 'DriveHire is India\'s dedicated bus driver job platform. We connect HMV-licensed bus drivers with transport companies, schools, IT firms, and travel operators across India — completely free for drivers.' },
      { q: 'Is DriveHire free for drivers?', a: 'Yes, 100% free. Creating a profile, browsing jobs, and applying are all free for drivers. We will never ask you to pay for a job introduction — if anyone claiming to be DriveHire asks for money, please report it immediately.' },
      { q: 'Who can register as a driver?', a: 'Anyone with a valid HMV (Heavy Motor Vehicle) or transport vehicle license issued by the Indian government. You must be 18+. Even if you\'re looking for your first professional bus job, you can register.' },
      { q: 'How do I register as an employer?', a: 'Click "Get Started" → Select "Employer" → Fill in your company details. You can post jobs immediately after registration. We recommend completing your company profile for better driver response rates.' },
    ],
  },
  {
    cat: 'KYC Verification',
    items: [
      { q: 'Why do I need KYC verification?', a: 'KYC (Know Your Customer) verification gives you a Verified badge on your profile. Verified drivers get priority visibility to employers, are more likely to be shortlisted, and build trust on the platform. It\'s optional but strongly recommended.' },
      { q: 'What documents are needed for KYC?', a: 'You need: (1) Aadhaar card — front and back photos, (2) HMV Driving License — front photo, (3) Live selfie — taken using your device camera. All images are compressed and stored securely.' },
      { q: 'Is my Aadhaar number stored safely?', a: 'Yes. We store only the last 4 digits of your Aadhaar (XXXX-XXXX-1234). The full number is never stored in plain text. Your document photos are encrypted and only accessible to our admin verification team.' },
      { q: 'How long does KYC review take?', a: 'Typically 24–48 hours on business days. You\'ll receive an in-app notification when your KYC is approved or if any document needs resubmission.' },
      { q: 'My KYC was rejected. What should I do?', a: 'Check the rejection reason in your notification. Common reasons: blurry photos, documents cut off in frame, or mismatched name. Retake clear photos and resubmit from the KYC page in your profile.' },
    ],
  },
  {
    cat: 'Applying for Jobs',
    items: [
      { q: 'How do I apply for a job?', a: 'Go to Jobs, find a listing, click the job card, then click "Apply Now". You can add a cover letter explaining why you\'re the right fit. The employer will be notified immediately.' },
      { q: 'Can I withdraw an application?', a: 'Yes, but only if your status is still "Applied". Once an employer has shortlisted or selected you, withdrawal is not possible. Go to My Applications and click "Withdraw" on the relevant application.' },
      { q: 'Can I apply to multiple jobs at once?', a: 'Yes. There\'s no limit. However, only apply to jobs you\'re genuinely interested in — spamming applications may result in account review.' },
      { q: 'What does each application status mean?', a: 'Applied → You\'ve applied, employer hasn\'t acted yet. Shortlisted → Employer wants to interview you. Selected → You got the job! Rejected → Employer chose another candidate (you can apply to other jobs).' },
      { q: 'How will I know if I\'m shortlisted?', a: 'You\'ll receive an in-app notification. If the employer set an interview date, it will be included in the notification. Check Notifications (bell icon) or the My Applications page.' },
    ],
  },
  {
    cat: 'For Employers',
    items: [
      { q: 'How much does it cost to post a job?', a: 'Currently free for all employers. Post unlimited jobs, view all applicants, manage hiring — all at no charge during our launch phase.' },
      { q: 'Can I search for drivers without posting a job?', a: 'Yes! Go to "Search Drivers" (in your employer nav). You can filter by location, experience, availability, and KYC status to find verified drivers directly.' },
      { q: 'How do I know if a driver is genuine?', a: 'Look for the ✅ KYC Verified badge. These drivers have had their Aadhaar, Driving License, and live selfie verified by our team. Always verify their physical documents again before hiring.' },
      { q: 'Can I close a job listing once filled?', a: 'Yes. Go to My Jobs → click "Close Job" on the listing. Closed jobs stop appearing in job search. You can reopen anytime.' },
    ],
  },
  {
    cat: 'Account & Privacy',
    items: [
      { q: 'How do I change my password?', a: 'Go to Profile → Scroll down to Security section → Change Password. You\'ll need your current password to set a new one.' },
      { q: 'How do I delete my account?', a: 'Profile → Security → Delete Account. Enter your password to confirm. This permanently deletes all your data including profile, applications, KYC documents, and notifications. This cannot be undone.' },
      { q: 'Who can see my phone number?', a: 'Employers can see your phone number only when you apply to their job. Your phone number is not publicly listed or searchable.' },
      { q: 'Is my KYC data shared with employers?', a: 'No. Employers can see your KYC verified status (the badge) but never your Aadhaar number, DL number, or document photos. Those are only for our admin team.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden', background: '#fff', transition: 'box-shadow 0.15s', boxShadow: open ? '0 2px 12px rgba(0,0,0,0.06)' : 'none' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', flex: 1 }}>{q}</span>
        {open ? <ChevronUp size={18} style={{ color: '#0284c7', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ padding: '0 18px 16px', fontSize: '14px', color: '#475569', lineHeight: 1.75, borderTop: '1px solid #f1f5f9' }}>
          <p style={{ marginTop: '12px' }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '56px', height: '56px', background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <HelpCircle size={26} style={{ color: '#0284c7' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: '15px', color: '#64748b' }}>Everything you need to know about DriveHire</p>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {FAQS.map((cat, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: activeTab === i ? '#0ea5e9' : '#fff',
              color: activeTab === i ? '#fff' : '#475569',
              boxShadow: activeTab === i ? '0 2px 8px rgba(14,165,233,0.3)' : '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              {cat.cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
          {FAQS[activeTab].items.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: '20px', padding: '28px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Still have questions?</p>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Our support team is ready to help you</p>
          <Link to="/contact" style={{ display: 'inline-block', padding: '12px 28px', background: '#0ea5e9', color: '#fff', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
