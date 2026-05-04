import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, Upload, CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import useStore from '../store/useStore';
import { useToast } from '../components/Toast';

async function compressImage(file, maxDim = 800) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        } else {
          if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const STEPS = ['Aadhaar', 'License', 'Selfie', 'Review'];

const inputStyle = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px',
  fontSize: '14px', color: '#111827', background: '#fff', outline: 'none', boxSizing: 'border-box',
};

function UploadBox({ label, hint, value, onChange }) {
  const inputRef = useRef(null);
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{label}</label>
      {hint && <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>{hint}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${value ? '#86efac' : '#cbd5e1'}`, borderRadius: '12px', padding: '16px',
          cursor: 'pointer', background: value ? '#f0fdf4' : '#f8fafc', textAlign: 'center', transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!value) e.currentTarget.style.borderColor = '#94a3b8'; }}
        onMouseLeave={e => { if (!value) e.currentTarget.style.borderColor = value ? '#86efac' : '#cbd5e1'; }}
      >
        {value ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src={value} alt="" style={{ width: '64px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>✓ Uploaded</p>
              <p style={{ fontSize: '11px', color: '#4ade80' }}>Click to replace</p>
            </div>
          </div>
        ) : (
          <div>
            <Upload size={22} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Click to upload</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>JPG · PNG · WEBP</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => onChange(e.target.files[0])} onClick={e => { e.target.value = ''; }} />
    </div>
  );
}

function ReviewRow({ label, value, ok }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px' }}>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: ok === false ? '#ef4444' : ok === true ? '#15803d' : '#0f172a' }}>
        {value}
      </span>
    </div>
  );
}

export default function KYC() {
  const { user, initAuth } = useStore();
  const navigate = useNavigate();
  const toast = useToast(s => s.show);

  const [step, setStep] = useState(0);
  const [kycData, setKycData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState('');
  const [aadhaarBack, setAadhaarBack] = useState('');

  const [dlNumber, setDlNumber] = useState('');
  const [dlFront, setDlFront] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [selfie, setSelfie] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    if (!user) return;
    api.kycStatus()
      .then(setKycData)
      .catch(() => setKycData({ status: 'not_submitted' }))
      .finally(() => setLoadingStatus(false));
  }, [user]);

  useEffect(() => () => stopCamera(), []);

  if (!user || user.role !== 'driver') return <Navigate to="/login" />;

  const validateAadhaar = (n) => /^[2-9][0-9]{11}$/.test(n.replace(/[\s-]/g, ''));
  const validateDL = (d) => /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$/.test(d.replace(/[\s-]/g, '').toUpperCase());

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setCameraOn(true);
    } catch {
      setCameraError('Camera access denied. Allow camera permission and try again.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraOn(false);
  };

  const captureSelfie = () => {
    const v = videoRef.current, c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    setSelfie(c.toDataURL('image/jpeg', 0.75));
    stopCamera();
  };

  const handleFile = async (file, setter) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please upload an image file'); return; }
    setter(await compressImage(file));
    setError('');
  };

  const goNext = () => {
    setError('');
    if (step === 0) {
      if (!validateAadhaar(aadhaarNumber)) { setError('Invalid Aadhaar number (12 digits, first digit 2–9)'); return; }
      if (!aadhaarFront || !aadhaarBack) { setError('Upload both sides of Aadhaar card'); return; }
    }
    if (step === 1) {
      if (!validateDL(dlNumber)) { setError('Invalid DL format (e.g. MH0220001234567)'); return; }
      if (!dlFront) { setError('Upload DL front photo'); return; }
    }
    if (step === 2 && !selfie) { setError('Please capture your selfie'); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.kycSubmit({ aadhaarNumber, aadhaarFront, aadhaarBack, dlNumber, dlFront, selfie });
      await initAuth();
      toast('KYC submitted! Under review (24–48 hrs).', 'success');
      navigate('/profile');
    } catch (err) {
      const msg = err.message || 'Submission failed';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#0284c7' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const status = kycData?.status;

  if (status && status !== 'not_submitted') {
    const CFG = {
      pending:  { icon: '⏳', color: '#d97706', bg: '#fffbeb', border: '#fde68a', title: 'Under Review', msg: 'Your KYC is under review. We\'ll notify you within 24–48 hours.' },
      verified: { icon: '✅', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', title: 'Verified',     msg: 'Your KYC is verified! You now have a Verified badge on your profile.' },
      rejected: { icon: '❌', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', title: 'Rejected',     msg: `Reason: ${kycData.rejectionReason || 'Documents unclear'}. Please resubmit with clear photos.` },
    };
    const c = CFG[status] || CFG.pending;
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '32px 24px' }}>
          <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748b', marginBottom: '24px', padding: 0 }}>
            <ArrowLeft size={16} /> Back to Profile
          </button>
          <div style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: '24px', padding: '40px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: '56px', marginBottom: '12px' }}>{c.icon}</p>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: c.color, marginBottom: '12px' }}>KYC {c.title}</h2>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, marginBottom: '16px' }}>{c.msg}</p>
            {kycData.aadhaarNumber && (
              <p style={{ fontSize: '13px', color: '#64748b', background: '#fff', padding: '8px 14px', borderRadius: '8px', display: 'inline-block' }}>
                Aadhaar: <strong style={{ fontFamily: 'monospace' }}>{kycData.aadhaarNumber}</strong>
              </p>
            )}
            {status === 'rejected' && (
              <button
                onClick={() => setKycData({ status: 'not_submitted' })}
                style={{ marginTop: '20px', display: 'block', width: '100%', padding: '13px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
              >
                Resubmit KYC
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stepDone = [
    validateAadhaar(aadhaarNumber) && !!aadhaarFront && !!aadhaarBack,
    validateDL(dlNumber) && !!dlFront,
    !!selfie,
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }}>

        <button onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748b', marginBottom: '24px', padding: 0 }}>
          <ArrowLeft size={16} /> Back to Profile
        </button>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <ShieldCheck size={26} style={{ color: '#0284c7' }} />
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>KYC Verification</h1>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Verify your identity to get a Verified badge and unlock more opportunities</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
                  background: i < step ? '#0ea5e9' : i === step ? '#0f172a' : '#e2e8f0',
                  color: i <= step ? '#fff' : '#94a3b8',
                  boxShadow: i === step ? '0 0 0 3px #bae6fd' : 'none',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '10px', fontWeight: i === step ? 700 : 400, color: i === step ? '#0f172a' : i < step ? '#0284c7' : '#94a3b8', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: i < step ? '#0ea5e9' : '#e2e8f0', margin: '0 6px', marginBottom: '18px', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', marginBottom: '16px', color: '#dc2626', fontSize: '14px' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginBottom: '16px' }}>

          {/* STEP 0: Aadhaar */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Aadhaar Card</h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>12-digit Aadhaar number + photos of both sides</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Aadhaar Number *</label>
                <input
                  value={aadhaarNumber}
                  onChange={e => setAadhaarNumber(e.target.value.replace(/[^0-9\s]/g, '').slice(0, 14))}
                  placeholder="1234 5678 9012"
                  style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '2px', fontSize: '16px' }}
                />
                {aadhaarNumber.replace(/\s/g, '').length > 0 && (
                  <p style={{ fontSize: '12px', marginTop: '5px', color: validateAadhaar(aadhaarNumber) ? '#15803d' : '#ef4444' }}>
                    {validateAadhaar(aadhaarNumber) ? '✓ Valid format' : 'Must be 12 digits, first digit 2–9'}
                  </p>
                )}
              </div>
              <UploadBox label="Aadhaar Front *" hint="Photo of front side (name and DOB visible)" value={aadhaarFront} onChange={f => handleFile(f, setAadhaarFront)} />
              <UploadBox label="Aadhaar Back *" hint="Photo of back side (address visible)" value={aadhaarBack} onChange={f => handleFile(f, setAadhaarBack)} />
            </div>
          )}

          {/* STEP 1: Driving License */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Driving License</h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>HMV (Heavy Motor Vehicle) license required</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>DL Number *</label>
                <input
                  value={dlNumber}
                  onChange={e => setDlNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))}
                  placeholder="MH0220001234567"
                  style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '1px' }}
                />
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>State (2) + RTO (2) + Year (4) + Serial (7) = 15 chars</p>
                {dlNumber.length > 0 && (
                  <p style={{ fontSize: '12px', marginTop: '3px', color: validateDL(dlNumber) ? '#15803d' : '#ef4444' }}>
                    {validateDL(dlNumber) ? '✓ Valid format' : 'Invalid format (e.g. MH0220001234567)'}
                  </p>
                )}
              </div>
              <UploadBox label="DL Front Photo *" hint="Clear photo of the front of your driving license" value={dlFront} onChange={f => handleFile(f, setDlFront)} />
            </div>
          )}

          {/* STEP 2: Live Selfie */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Live Selfie</h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Take a photo with your face clearly visible</p>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                {selfie ? (
                  <>
                    <div style={{ position: 'relative' }}>
                      <img src={selfie} alt="Selfie" style={{ width: '220px', height: '165px', objectFit: 'cover', borderRadius: '16px', border: '2.5px solid #bbf7d0', display: 'block' }} />
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#16a34a', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={15} style={{ color: '#fff' }} />
                      </div>
                    </div>
                    <button onClick={() => { setSelfie(''); startCamera(); }} style={{ padding: '8px 20px', background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Retake Selfie
                    </button>
                  </>
                ) : cameraOn ? (
                  <>
                    <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '2.5px solid #bae6fd', width: '100%', maxWidth: '340px' }}>
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(14,165,233,0.35)', borderRadius: '13px', pointerEvents: 'none' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={captureSelfie} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.3)' }}>
                        <Camera size={15} /> Capture Photo
                      </button>
                      <button onClick={stopCamera} style={{ padding: '11px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: '80px', height: '80px', background: '#f0f9ff', border: '2px dashed #bae6fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Camera size={30} style={{ color: '#0284c7' }} />
                    </div>
                    {cameraError && <p style={{ fontSize: '13px', color: '#ef4444', textAlign: 'center', maxWidth: '280px' }}>{cameraError}</p>}
                    <button onClick={startCamera} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                      <Camera size={15} /> Open Camera
                    </button>
                  </>
                )}
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e' }}>
                <strong>Tips:</strong> Good lighting · Face centered · No hat or sunglasses · Look directly at camera
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Review & Submit</h2>
                <p style={{ fontSize: '13px', color: '#64748b' }}>Verify all details before submitting</p>
              </div>
              <ReviewRow label="Aadhaar Number" value={aadhaarNumber.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()} />
              <ReviewRow label="Aadhaar Front" value={aadhaarFront ? '✓ Uploaded' : '—'} ok={!!aadhaarFront} />
              <ReviewRow label="Aadhaar Back" value={aadhaarBack ? '✓ Uploaded' : '—'} ok={!!aadhaarBack} />
              <ReviewRow label="DL Number" value={dlNumber.toUpperCase()} />
              <ReviewRow label="DL Front" value={dlFront ? '✓ Uploaded' : '—'} ok={!!dlFront} />
              <ReviewRow label="Live Selfie" value={selfie ? '✓ Captured' : '—'} ok={!!selfie} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                {aadhaarFront && <img src={aadhaarFront} alt="Aadhaar F" style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #e2e8f0' }} />}
                {aadhaarBack && <img src={aadhaarBack} alt="Aadhaar B" style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #e2e8f0' }} />}
                {dlFront && <img src={dlFront} alt="DL" style={{ width: '72px', height: '54px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid #e2e8f0' }} />}
                {selfie && <img src={selfie} alt="Selfie" style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #bbf7d0' }} />}
              </div>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>
                By submitting you confirm these documents are yours and authentic. False documents may result in account suspension.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          {step > 0 ? (
            <button onClick={() => { setError(''); setStep(s => s - 1); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              <ArrowLeft size={14} /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button onClick={goNext} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}>
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: submitting ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(14,165,233,0.25)' }}>
              {submitting ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</> : <><ShieldCheck size={14} /> Submit KYC</>}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
