import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, Mail, GraduationCap,
  Calendar, LogOut, User as UserIcon, Package, CheckCircle,
  RefreshCw, AlertCircle, ChevronRight, Sparkles, Leaf,
} from 'lucide-react';

import API from '../config';
const RESEND_COOLDOWN = 60;

const G = {
  green900: '#0a2e14',
  green800: '#0f4a1f',
  green700: '#155f28',
  green600: '#16a34a',
  green500: '#22c55e',
  green400: '#4ade80',
  green100: '#dcfce7',
  green50:  '#f0fdf4',
  cream:    '#faf9f6',
  sand:     '#f5f0e8',
  charcoal: '#1a1a1a',
  ink:      '#2d2d2d',
  muted:    '#6b6b6b',
  border:   '#e8e3d8',
};

const PERSONAL_DOMAINS = new Set([
  'gmail.com','yahoo.com','yahoo.in','outlook.com','hotmail.com',
  'live.com','icloud.com','me.com','aol.com','protonmail.com',
  'proton.me','rediffmail.com','ymail.com','zoho.com','tutanota.com',
  'mail.com','gmx.com',
]);

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position: 700px 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  @keyframes successPop {
    0%   { transform: scale(0.7); opacity: 0; }
    60%  { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes bannerFloat {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-4px); }
  }

  .profile-enter { animation: fadeUp 0.5s ease both; }
  .profile-enter-2 { animation: fadeUp 0.5s 0.07s ease both; }
  .profile-enter-3 { animation: fadeUp 0.5s 0.14s ease both; }
  .profile-enter-4 { animation: fadeUp 0.5s 0.21s ease both; }
  .profile-enter-5 { animation: fadeUp 0.5s 0.28s ease both; }

  .nav-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: ${G.muted};
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: color 0.15s;
  }
  .nav-link:hover { color: ${G.charcoal}; }

  .card {
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 24px;
    overflow: hidden;
  }

  .stat-card {
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 20px;
    padding: 22px 20px;
    text-align: center;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.07);
    border-color: ${G.green400};
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: '14px';
    padding: 16px 24px;
    border-bottom: 1px solid ${G.sand};
    transition: background 0.15s;
  }
  .detail-row:last-child { border-bottom: none; }
  .detail-row:hover { background: ${G.cream}; }

  .otp-input {
    width: 48px;
    height: 60px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    border-radius: 14px;
    border: 2px solid ${G.border};
    background: ${G.cream};
    color: ${G.charcoal};
    outline: none;
    font-family: 'Fraunces', serif;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .otp-input:focus {
    transform: scale(1.06);
    box-shadow: 0 0 0 4px rgba(34,197,94,0.15);
  }
  .otp-input.filled {
    border-color: ${G.green500};
    background: ${G.green50};
    color: ${G.green800};
  }
  .otp-input.error {
    border-color: #f87171;
    background: #fef2f2;
    color: #b91c1c;
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25%       { transform: translateX(-5px); }
    75%       { transform: translateX(5px); }
  }

  .primary-btn {
    width: 100%;
    padding: 15px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 700;
    background: ${G.green600};
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.16s, transform 0.12s, box-shadow 0.16s;
    letter-spacing: 0.01em;
  }
  .primary-btn:hover:not(:disabled) {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22,163,74,0.3);
  }
  .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .signout-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 16px;
    border-radius: 100px;
    border: 1.5px solid ${G.border};
    background: transparent;
    color: ${G.muted};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .signout-btn:hover {
    border-color: #fca5a5;
    color: #dc2626;
    background: #fef2f2;
  }

  .email-input-wrap {
    display: flex;
    align-items: center;
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .email-input-wrap:focus-within {
    box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
  }

  .verify-cta {
    width: 100%;
    background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
    color: #fff;
    border-radius: 20px;
    padding: 20px 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    text-align: left;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .verify-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(180,83,9,0.3);
  }
  .verify-cta::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
  }
  .verify-cta::after {
    content: '';
    position: absolute;
    bottom: -30px; left: -20px;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
  }
`;

/* ── 6-box OTP ── */
function OtpBoxes({ value, onChange, disabled, hasError }: {
  value: string; onChange: (v: string) => void;
  disabled?: boolean; hasError?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = char.slice(-1) || ' ';
    const next = arr.join('').trimEnd();
    onChange(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const arr = value.padEnd(6, ' ').split('');
      if (!value[i] || value[i] === ' ') {
        if (i > 0) { arr[i - 1] = ' '; onChange(arr.join('').trimEnd()); refs.current[i - 1]?.focus(); }
      } else {
        arr[i] = ' '; onChange(arr.join('').trimEnd());
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = !!value[i] && value[i] !== ' ';
        const cls = ['otp-input', hasError ? 'error' : filled ? 'filled' : ''].join(' ');
        return (
          <input
            key={i}
            ref={el => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled ? value[i] : ''}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onFocus={e => e.target.select()}
            className={cls}
            style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
          />
        );
      })}
    </div>
  );
}

/* ── Main ── */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [showOtpFlow, setShowOtpFlow] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [emailTouched, setEmailTouched] = useState(false);
  const [listingCount, setListingCount] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const clean = otp.replace(/ /g, '');
    if (clean.length === 6 && step === 'otp' && !isVerifying) handleVerifyOtp(clean);
  }, [otp]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListingCount(res.data.filter((l: any) =>
          l.seller._id === user._id || l.seller === user._id
        ).length);
      } catch { setListingCount(0); }
    })();
  }, [user]);

  if (!user) return null;

  const emailValidationError = (e: string) => {
    if (!e) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address.';
    const domain = e.toLowerCase().split('@')[1];
    if (PERSONAL_DOMAINS.has(domain)) return 'Personal emails not accepted. Use your college email.';
    return '';
  };

  const emailErr = emailTouched ? emailValidationError(collegeEmail) : '';
  const emailOk  = !!collegeEmail && !emailValidationError(collegeEmail);

  const startTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current!); return 0; } return t - 1; });
    }, 1000);
  };

  const resetFlow = () => {
    setShowOtpFlow(false); setStep('email'); setCollegeEmail('');
    setOtp(''); setError(''); setSuccess(''); setEmailTouched(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(0);
  };

  const handleSendOtp = async () => {
    setEmailTouched(true);
    const err = emailValidationError(collegeEmail);
    if (err) { setError(err); return; }
    setError(''); setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/send-otp`, { email: collegeEmail }, { headers: { Authorization: `Bearer ${token}` } });
      setStep('otp'); setOtp(''); setSuccess(''); startTimer();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally { setIsSending(false); }
  };

  const handleVerifyOtp = async (code?: string) => {
    const c = (code ?? otp).replace(/ /g, '');
    if (c.length !== 6) { setError('Enter all 6 digits.'); return; }
    setError(''); setIsVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/verify-otp`,
        { email: collegeEmail, otp: c },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.user) updateUser(res.data.user);
      else updateUser({ studentVerified: true, emailVerified: true });
      setSuccess('College email verified! You can now list items for sale.');
      setTimeout(resetFlow, 2500);
    } catch (e: any) {
      setOtp('');
      setError(e?.response?.data?.message || 'Invalid or expired OTP. Try again.');
    } finally { setIsVerifying(false); }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isSending) return;
    setError(''); setOtp('');
    await handleSendOtp();
  };

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{pageStyles}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(250,249,246,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{
          maxWidth: '680px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/dashboard" className="nav-link">
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
              Dashboard
            </Link>
            <div style={{ width: '1px', height: '20px', background: G.border }} />
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '19px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>Profile</span>
          </div>

          {/* Logo chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '100px',
            background: G.sand, border: `1px solid ${G.border}`,
          }}>
            <Leaf style={{ width: '12px', height: '12px', color: G.green600 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: G.muted, letterSpacing: '0.03em' }}>
              PassItOn
            </span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '36px 24px 80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── PROFILE HERO CARD ── */}
        <div className="card profile-enter">
          {/* Banner */}
          <div style={{
            height: '110px',
            background: `linear-gradient(135deg, ${G.green900} 0%, ${G.green700} 100%)`,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative circles */}
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.1)',
            }} />
            <div style={{
              position: 'absolute', bottom: '-20px', left: '40px',
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.07)',
            }} />
            {/* Leaf watermark */}
            <div style={{ position: 'absolute', top: '16px', left: '20px', opacity: 0.2 }}>
              <Leaf style={{ width: '28px', height: '28px', color: G.green400 }} />
            </div>
          </div>

          <div style={{ padding: '0 24px 28px' }}>
            {/* Avatar row */}
            <div style={{
              marginTop: '-36px', marginBottom: '16px',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            }}>
              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '20px',
                  background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
                  border: `4px solid ${G.cream}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}>
                  <span style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '28px', fontWeight: 700, color: '#fff',
                    lineHeight: 1, userSelect: 'none',
                  }}>{userInitial}</span>
                </div>
                {/* Verification badge */}
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px',
                  width: '26px', height: '26px', borderRadius: '8px',
                  border: `3px solid ${G.cream}`,
                  backgroundColor: user.studentVerified ? G.green600 : '#f59e0b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}>
                  {user.studentVerified
                    ? <ShieldCheck style={{ width: '12px', height: '12px', color: '#fff' }} />
                    : <ShieldAlert style={{ width: '12px', height: '12px', color: '#fff' }} />}
                </div>
              </div>

              {/* Sign out */}
              <button className="signout-btn" onClick={() => { logout(); navigate('/'); }}>
                <LogOut style={{ width: '14px', height: '14px' }} />
                Sign out
              </button>
            </div>

            {/* Name + email */}
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '24px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
              margin: '0 0 4px',
            }}>{user.name}</h2>
            <p style={{ fontSize: '14px', color: G.muted, margin: '0 0 16px' }}>{user.email}</p>

            {/* Badge chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {user.studentVerified ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '100px',
                  background: G.green100, color: G.green800,
                  fontSize: '12px', fontWeight: 700, letterSpacing: '0.03em',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <ShieldCheck style={{ width: '12px', height: '12px' }} />
                  Verified Student
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '100px',
                  background: '#fef3c7', color: '#92400e',
                  fontSize: '12px', fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <ShieldAlert style={{ width: '12px', height: '12px' }} />
                  Unverified
                </span>
              )}
              {user.emailVerified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', borderRadius: '100px',
                  background: '#dbeafe', color: '#1e40af',
                  fontSize: '12px', fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <CheckCircle style={{ width: '12px', height: '12px' }} />
                  Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="profile-enter-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="stat-card">
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: G.green50, border: `1px solid ${G.green100}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Package style={{ width: '20px', height: '20px', color: G.green600 }} />
            </div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '32px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.03em', lineHeight: 1,
              marginBottom: '4px',
            }}>
              {listingCount === null ? '—' : listingCount}
            </div>
            <div style={{ fontSize: '12px', color: G.muted, fontWeight: 500 }}>Active Listings</div>
          </div>

          <div className="stat-card">
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px',
              background: user.studentVerified ? G.green50 : G.sand,
              border: `1px solid ${user.studentVerified ? G.green100 : G.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Sparkles style={{
                width: '20px', height: '20px',
                color: user.studentVerified ? G.green600 : G.muted,
              }} />
            </div>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '22px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em', lineHeight: 1,
              marginBottom: '4px',
            }}>
              {user.studentVerified ? 'Seller' : 'Buyer'}
            </div>
            <div style={{ fontSize: '12px', color: G.muted, fontWeight: 500 }}>Account Type</div>
          </div>
        </div>

        {/* ── VERIFY CTA ── */}
        {!user.studentVerified && !showOtpFlow && (
          <button className="verify-cta profile-enter-3" onClick={() => setShowOtpFlow(true)}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, position: 'relative', zIndex: 1,
            }}>
              <GraduationCap style={{ width: '22px', height: '22px', color: '#fff' }} />
            </div>
            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
              <p style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '17px', fontWeight: 700,
                margin: '0 0 3px', letterSpacing: '-0.01em',
              }}>Become a Verified Seller</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                Verify your college email to start listing items
              </p>
            </div>
            <ChevronRight style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)', flexShrink: 0, position: 'relative', zIndex: 1 }} />
          </button>
        )}

        {/* ── OTP FLOW ── */}
        {!user.studentVerified && showOtpFlow && (
          <div className="card profile-enter-3" style={{ padding: '28px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                {/* Step indicator */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {['email', 'otp'].map((s, i) => (
                    <div key={s} style={{
                      height: '3px', width: '32px', borderRadius: '100px',
                      background: (step === 'email' && i === 0) || (step === 'otp')
                        ? G.green600 : G.border,
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <h3 style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '20px', fontWeight: 700,
                  color: G.charcoal, letterSpacing: '-0.02em',
                  margin: '0 0 5px',
                }}>
                  {step === 'email' ? 'Verify college email' : 'Enter the code'}
                </h3>
                <p style={{ fontSize: '13px', color: G.muted, margin: 0, lineHeight: 1.55 }}>
                  {step === 'email'
                    ? "We'll send a 6-digit code to confirm your student status."
                    : <span>Code sent to <strong style={{ color: G.ink }}>{collegeEmail}</strong></span>
                  }
                </p>
              </div>
              <button onClick={resetFlow} style={{
                fontSize: '12px', color: G.muted, background: 'none',
                border: 'none', cursor: 'pointer', paddingTop: '4px',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                transition: 'color 0.15s',
              }}>Cancel</button>
            </div>

            {/* Step 1 — email */}
            {step === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: '11px', fontWeight: 700,
                    color: G.muted, textTransform: 'uppercase', letterSpacing: '0.07em',
                    marginBottom: '8px', fontFamily: "'DM Sans', sans-serif",
                  }}>
                    College / Institutional Email
                  </label>
                  <div className="email-input-wrap" style={{
                    border: `2px solid ${emailErr ? '#f87171' : emailOk ? G.green500 : G.border}`,
                    background: emailErr ? '#fef2f2' : emailOk ? G.green50 : '#fff',
                  }}>
                    <Mail style={{
                      width: '15px', height: '15px', marginLeft: '16px', flexShrink: 0,
                      color: emailErr ? '#f87171' : emailOk ? G.green500 : G.muted,
                    }} />
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={e => { setCollegeEmail(e.target.value); setError(''); }}
                      onBlur={() => setEmailTouched(true)}
                      onKeyDown={e => e.key === 'Enter' && emailOk && handleSendOtp()}
                      placeholder="yourname@college.edu.in"
                      style={{
                        flex: 1, padding: '13px 14px', fontSize: '14px',
                        background: 'transparent', border: 'none',
                        outline: 'none', color: G.charcoal,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                    {emailOk && <CheckCircle style={{ width: '16px', height: '16px', color: G.green500, marginRight: '14px', flexShrink: 0 }} />}
                  </div>

                  {emailErr ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px' }}>
                      <AlertCircle style={{ width: '13px', height: '13px', color: '#ef4444', flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: '#dc2626', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{emailErr}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: G.muted, marginTop: '7px', fontFamily: "'DM Sans', sans-serif" }}>
                      e.g.{' '}
                      <span style={{ fontFamily: 'monospace', color: G.ink }}>name@dbit.in</span>,{' '}
                      <span style={{ fontFamily: 'monospace', color: G.ink }}>name@vjti.ac.in</span>
                    </p>
                  )}
                </div>

                {error && !emailErr && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: '#fef2f2', border: '1px solid #fecaca',
                    color: '#b91c1c', fontSize: '13px',
                    borderRadius: '14px', padding: '13px 16px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                <button className="primary-btn" onClick={handleSendOtp} disabled={isSending || !emailOk}>
                  {isSending
                    ? <><RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 0.8s linear infinite' }} /> Sending code…</>
                    : <>Send verification code <ChevronRight style={{ width: '15px', height: '15px' }} /></>
                  }
                </button>
              </div>
            )}

            {/* Step 2 — OTP */}
            {step === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {success ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '14px', padding: '28px 0', textAlign: 'center',
                  }}>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: G.green100,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      animation: 'successPop 0.4s ease both',
                    }}>
                      <CheckCircle style={{ width: '36px', height: '36px', color: G.green600 }} />
                    </div>
                    <div>
                      <p style={{
                        fontFamily: "'Fraunces', serif",
                        fontWeight: 700, color: G.green800,
                        fontSize: '18px', margin: '0 0 6px', letterSpacing: '-0.01em',
                      }}>You're verified!</p>
                      <p style={{ fontSize: '13px', color: G.muted, margin: 0 }}>{success}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <OtpBoxes value={otp} onChange={setOtp} disabled={isVerifying} hasError={!!error} />

                    {error && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: '#fef2f2', border: '1px solid #fecaca',
                        color: '#b91c1c', fontSize: '13px',
                        borderRadius: '14px', padding: '13px 16px',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                        {error}
                      </div>
                    )}

                    <button
                      className="primary-btn"
                      onClick={() => handleVerifyOtp()}
                      disabled={isVerifying || otp.replace(/ /g, '').length !== 6}
                    >
                      {isVerifying
                        ? <><RefreshCw style={{ width: '15px', height: '15px', animation: 'spin 0.8s linear infinite' }} /> Verifying…</>
                        : <><ShieldCheck style={{ width: '15px', height: '15px' }} /> Verify &amp; unlock selling</>
                      }
                    </button>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '16px', fontSize: '13px',
                    }}>
                      <button onClick={handleResend} disabled={resendTimer > 0 || isSending} style={{
                        fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                        color: resendTimer > 0 || isSending ? G.muted : G.green700,
                        cursor: resendTimer > 0 || isSending ? 'not-allowed' : 'pointer',
                        background: 'none', border: 'none', fontSize: '13px',
                        transition: 'color 0.15s',
                      }}>
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                      </button>
                      <span style={{ color: G.border }}>·</span>
                      <button onClick={() => { setStep('email'); setOtp(''); setError(''); }} style={{
                        color: G.muted, background: 'none', border: 'none',
                        fontSize: '13px', cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                      }}>
                        Change email
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── VERIFIED SELLER BANNER ── */}
        {user.studentVerified && (
          <div className="profile-enter-3" style={{
            background: G.green900, borderRadius: '20px', padding: '22px 24px',
            display: 'flex', alignItems: 'center', gap: '16px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30px', right: '-30px',
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.08)',
            }} />
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: `rgba(74,222,128,0.15)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, position: 'relative', zIndex: 1,
            }}>
              <ShieldCheck style={{ width: '22px', height: '22px', color: G.green400 }} />
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 600, color: '#fff',
                fontSize: '16px', margin: '0 0 3px', letterSpacing: '-0.01em',
              }}>Verified Seller</p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                Student status confirmed · You can list items for sale
              </p>
            </div>
            <div style={{ marginLeft: 'auto', position: 'relative', zIndex: 1 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '100px',
                background: 'rgba(74,222,128,0.15)',
                border: '1px solid rgba(74,222,128,0.2)',
                fontSize: '11px', fontWeight: 700, color: G.green400,
                fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: G.green400, display: 'inline-block',
                  animation: 'pulse-dot 2s infinite',
                }} />
                Active
              </span>
            </div>
          </div>
        )}

        {/* ── MY LISTINGS SHORTCUT ── */}
        <Link to="/my-listings" style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '18px 20px',
          background: '#fff', border: `1px solid ${G.border}`,
          borderRadius: '20px', textDecoration: 'none',
          transition: 'border-color 0.18s, box-shadow 0.18s, transform 0.18s',
        }}
          className="profile-enter-4"
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = G.green400;
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(22,163,74,0.08)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = G.border;
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: G.green50, border: `1px solid ${G.green100}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Package style={{ width: '20px', height: '20px', color: G.green600 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: G.charcoal, marginBottom: '2px' }}>My Listings</div>
            <div style={{ fontSize: '13px', color: G.muted }}>
              {listingCount === null ? 'Loading…' : `${listingCount} item${listingCount !== 1 ? 's' : ''} listed`}
            </div>
          </div>
          <ChevronRight style={{ width: '18px', height: '18px', color: G.muted }} />
        </Link>

        {/* ── ACCOUNT DETAILS ── */}
        <div className="card profile-enter-5">
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${G.sand}` }}>
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '16px', fontWeight: 600,
              color: G.charcoal, letterSpacing: '-0.01em', margin: 0,
            }}>Account details</h3>
          </div>

          {[
            {
              icon: <UserIcon style={{ width: '15px', height: '15px', color: G.muted }} />,
              label: 'User ID',
              value: <span style={{ fontSize: '12px', fontFamily: 'monospace', color: G.ink, wordBreak: 'break-all' }}>{user._id}</span>,
            },
            {
              icon: <Mail style={{ width: '15px', height: '15px', color: G.muted }} />,
              label: 'Email',
              value: <span style={{ fontSize: '14px', fontWeight: 500, color: G.ink }}>{user.email}</span>,
            },
            ...(user.branch ? [{
              icon: <GraduationCap style={{ width: '15px', height: '15px', color: G.muted }} />,
              label: 'Branch',
              value: <span style={{ fontSize: '14px', fontWeight: 500, color: G.ink }}>{user.branch}</span>,
            }] : []),
            ...(user.year ? [{
              icon: <Calendar style={{ width: '15px', height: '15px', color: G.muted }} />,
              label: 'Year',
              value: <span style={{ fontSize: '14px', fontWeight: 500, color: G.ink }}>{user.year}</span>,
            }] : []),
          ].map((row, idx, arr) => (
            <div key={row.label} className="detail-row" style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '15px 24px',
              borderBottom: idx < arr.length - 1 ? `1px solid ${G.sand}` : 'none',
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: G.sand, border: `1px solid ${G.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {row.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '11px', color: G.muted, margin: '0 0 2px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {row.label}
                </p>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.value}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}