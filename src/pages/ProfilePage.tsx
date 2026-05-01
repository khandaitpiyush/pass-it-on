import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft, ShieldCheck, ShieldAlert, Mail, GraduationCap,
  Calendar, LogOut, User as UserIcon, Package, CheckCircle,
  RefreshCw, AlertCircle, ChevronRight, Sparkles,
} from 'lucide-react';

const API = 'http://localhost:5000/api/auth';
const RESEND_COOLDOWN = 60;

const PERSONAL_DOMAINS = new Set([
  'gmail.com','yahoo.com','yahoo.in','outlook.com','hotmail.com',
  'live.com','icloud.com','me.com','aol.com','protonmail.com',
  'proton.me','rediffmail.com','ymail.com','zoho.com','tutanota.com',
  'mail.com','gmx.com',
]);

/* ── 6-box OTP input ── */
function OtpBoxes({ value, onChange, disabled, hasError }: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  hasError?: boolean;
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
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = !!value[i] && value[i] !== ' ';
        let borderColor = '#e5e7eb';
        let backgroundColor = '#ffffff';
        let color = '#111827';
        if (hasError) { borderColor = '#f87171'; backgroundColor = '#fef2f2'; color = '#b91c1c'; }
        else if (filled) { borderColor = '#22c55e'; backgroundColor = '#f0fdf4'; color = '#166534'; }
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
            style={{
              width: '44px',
              height: '56px',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 700,
              borderRadius: '12px',
              border: `2px solid ${borderColor}`,
              backgroundColor,
              color,
              outline: 'none',
              transition: 'all 0.15s',
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? 'not-allowed' : 'text',
            }}
          />
        );
      })}
    </div>
  );
}

/* ── Main component ── */
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
    if (clean.length === 6 && step === 'otp' && !isVerifying) {
      handleVerifyOtp(clean);
    }
  }, [otp]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/listings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListingCount(
          res.data.filter((l: any) =>
            l.seller._id === user._id || l.seller === user._id
          ).length
        );
      } catch {
        setListingCount(0);
      }
    })();
  }, [user]);

  if (!user) return null;

  const emailValidationError = (e: string) => {
    if (!e) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address.';
    const domain = e.toLowerCase().split('@')[1];
    if (PERSONAL_DOMAINS.has(domain))
      return 'Personal emails not accepted. Use your college email.';
    return '';
  };

  const emailErr = emailTouched ? emailValidationError(collegeEmail) : '';
  const emailOk = !!collegeEmail && !emailValidationError(collegeEmail);

  const startTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
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
    setError('');
    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/send-otp`, { email: collegeEmail }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStep('otp'); setOtp(''); setSuccess(''); startTimer();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const c = (code ?? otp).replace(/ /g, '');
    if (c.length !== 6) { setError('Enter all 6 digits.'); return; }
    setError('');
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API}/verify-otp`,
        { email: collegeEmail, otp: c },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.user) {
        updateUser(res.data.user);
      } else {
        updateUser({ studentVerified: true, emailVerified: true });
      }
      setSuccess('College email verified! You can now list items for sale.');
      setTimeout(resetFlow, 2500);
    } catch (e: any) {
      setOtp('');
      setError(e?.response?.data?.message || 'Invalid or expired OTP. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isSending) return;
    setError(''); setOtp('');
    await handleSendOtp();
  };

  /* ── Render ── */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Link to="/dashboard" style={{
            padding: '6px',
            borderRadius: '8px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}>
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
          </Link>
          <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>Profile</h1>
        </div>
      </div>

      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '24px 16px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>

        {/* ── Profile card ── */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}>
          {/* GREEN BANNER — fix #1: inline background instead of Tailwind gradient */}
          <div style={{
            height: '96px',
            background: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)',
          }} />

          <div style={{ padding: '0 20px 20px' }}>
            {/* Avatar row — fix #2: explicit content, no cursor */}
            <div style={{
              marginTop: '-32px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#ffffff',
                  border: '4px solid #ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#15803d',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                {/* Verification badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  border: '2px solid #ffffff',
                  backgroundColor: user.studentVerified ? '#16a34a' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {user.studentVerified
                    ? <ShieldCheck style={{ width: '11px', height: '11px', color: '#ffffff' }} />
                    : <ShieldAlert style={{ width: '11px', height: '11px', color: '#ffffff' }} />}
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={() => { logout(); navigate('/'); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <LogOut style={{ width: '14px', height: '14px' }} />
                Sign out
              </button>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{user.name}</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '0 0 12px' }}>{user.email}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {user.studentVerified ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: 600,
                  backgroundColor: '#dcfce7', color: '#166534',
                }}>
                  <ShieldCheck style={{ width: '12px', height: '12px' }} /> Verified Student
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: 600,
                  backgroundColor: '#fef3c7', color: '#92400e',
                }}>
                  <ShieldAlert style={{ width: '12px', height: '12px' }} /> Unverified
                </span>
              )}
              {user.emailVerified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '999px',
                  fontSize: '12px', fontWeight: 600,
                  backgroundColor: '#dbeafe', color: '#1e40af',
                }}>
                  <CheckCircle style={{ width: '12px', height: '12px' }} /> Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #e5e7eb', padding: '16px', textAlign: 'center',
          }}>
            <Package style={{ width: '20px', height: '20px', color: '#16a34a', margin: '0 auto 6px' }} />
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {listingCount === null ? '—' : listingCount}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>My Listings</p>
          </div>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #e5e7eb', padding: '16px', textAlign: 'center',
          }}>
            <Sparkles style={{
              width: '20px', height: '20px', margin: '0 auto 6px',
              color: user.studentVerified ? '#16a34a' : '#d1d5db',
            }} />
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: 0 }}>
              {user.studentVerified ? 'Seller' : 'Buyer'}
            </p>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Account Type</p>
          </div>
        </div>

        {/* ── Verification CTA — fix #3: always renders when unverified + no OTP flow ── */}
        {!user.studentVerified && !showOtpFlow && (
          <button
            onClick={() => setShowOtpFlow(true)}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <GraduationCap style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '14px', margin: 0 }}>Become a Verified Seller</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>
                Verify your college email to list items
              </p>
            </div>
            <ChevronRight style={{ width: '20px', height: '20px', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
          </button>
        )}

        {/* ── OTP Flow card ── */}
        {!user.studentVerified && showOtpFlow && (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            border: '1px solid #e5e7eb', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '16px', margin: '0 0 4px' }}>
                  {step === 'email' ? 'Verify college email' : 'Enter the code'}
                </h3>
                <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                  {step === 'email'
                    ? "We'll send a 6-digit code to confirm your student status."
                    : <span>Sent to <span style={{ fontWeight: 500, color: '#6b7280' }}>{collegeEmail}</span></span>
                  }
                </p>
              </div>
              <button
                onClick={resetFlow}
                style={{
                  fontSize: '12px', color: '#9ca3af', background: 'none',
                  border: 'none', cursor: 'pointer', paddingTop: '2px',
                }}
              >
                Cancel
              </button>
            </div>

            {/* Step 1 — email input */}
            {step === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{
                    display: 'block', fontSize: '11px', fontWeight: 600,
                    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: '6px',
                  }}>
                    College / Institutional Email
                  </label>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    border: `2px solid ${emailErr ? '#f87171' : emailOk ? '#22c55e' : '#e5e7eb'}`,
                    borderRadius: '12px', overflow: 'hidden',
                    backgroundColor: emailErr ? '#fef2f2' : emailOk ? '#f0fdf4' : '#ffffff',
                    transition: 'border-color 0.15s',
                  }}>
                    <Mail style={{
                      width: '16px', height: '16px', marginLeft: '14px', flexShrink: 0,
                      color: emailErr ? '#f87171' : emailOk ? '#22c55e' : '#9ca3af',
                    }} />
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={e => { setCollegeEmail(e.target.value); setError(''); }}
                      onBlur={() => setEmailTouched(true)}
                      onKeyDown={e => e.key === 'Enter' && emailOk && handleSendOtp()}
                      placeholder="yourname@college.edu.in"
                      style={{
                        flex: 1, padding: '12px', fontSize: '14px',
                        backgroundColor: 'transparent', border: 'none',
                        outline: 'none', color: '#111827',
                      }}
                    />
                    {emailOk && <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e', marginRight: '12px', flexShrink: 0 }} />}
                  </div>

                  {emailErr ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                      <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444', flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>{emailErr}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                      e.g. <span style={{ fontFamily: 'monospace' }}>name@dbit.in</span>, <span style={{ fontFamily: 'monospace' }}>name@vjti.ac.in</span>
                    </p>
                  )}
                </div>

                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                    color: '#b91c1c', fontSize: '14px',
                    borderRadius: '12px', padding: '12px 16px',
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} /> {error}
                  </div>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={isSending || !emailOk}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: 600,
                    backgroundColor: '#16a34a', color: '#ffffff',
                    border: 'none', cursor: isSending || !emailOk ? 'not-allowed' : 'pointer',
                    opacity: isSending || !emailOk ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {isSending
                    ? <><RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Sending…</>
                    : <>Send verification code <ChevronRight style={{ width: '16px', height: '16px' }} /></>
                  }
                </button>
              </div>
            )}

            {/* Step 2 — OTP boxes */}
            {step === 'otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {success ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '12px', padding: '24px 0', textAlign: 'center',
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle style={{ width: '32px', height: '32px', color: '#16a34a' }} />
                    </div>
                    <p style={{ fontWeight: 700, color: '#166534', margin: 0 }}>{success}</p>
                    <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Redirecting…</p>
                  </div>
                ) : (
                  <>
                    <OtpBoxes value={otp} onChange={setOtp} disabled={isVerifying} hasError={!!error} />

                    {error && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        backgroundColor: '#fef2f2', border: '1px solid #fecaca',
                        color: '#b91c1c', fontSize: '14px',
                        borderRadius: '12px', padding: '12px 16px',
                      }}>
                        <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} /> {error}
                      </div>
                    )}

                    <button
                      onClick={() => handleVerifyOtp()}
                      disabled={isVerifying || otp.replace(/ /g, '').length !== 6}
                      style={{
                        width: '100%', padding: '12px', borderRadius: '12px',
                        fontSize: '14px', fontWeight: 600,
                        backgroundColor: '#16a34a', color: '#ffffff',
                        border: 'none',
                        cursor: isVerifying || otp.replace(/ /g, '').length !== 6 ? 'not-allowed' : 'pointer',
                        opacity: isVerifying || otp.replace(/ /g, '').length !== 6 ? 0.5 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      }}
                    >
                      {isVerifying
                        ? <><RefreshCw style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Verifying…</>
                        : <><ShieldCheck style={{ width: '16px', height: '16px' }} /> Verify &amp; Unlock Selling</>
                      }
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                      <button
                        onClick={handleResend}
                        disabled={resendTimer > 0 || isSending}
                        style={{
                          fontWeight: 600,
                          color: resendTimer > 0 || isSending ? '#9ca3af' : '#15803d',
                          cursor: resendTimer > 0 || isSending ? 'not-allowed' : 'pointer',
                          background: 'none', border: 'none', fontSize: '12px',
                        }}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                      </button>
                      <span style={{ color: '#d1d5db' }}>·</span>
                      <button
                        onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                        style={{ color: '#9ca3af', background: 'none', border: 'none', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Change email
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Verified seller banner ── */}
        {user.studentVerified && (
          <div style={{
            backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '16px', padding: '16px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              backgroundColor: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ShieldCheck style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#14532d', fontSize: '14px', margin: 0 }}>Verified Seller</p>
              <p style={{ fontSize: '12px', color: '#166534', margin: '2px 0 0' }}>
                Your student status is verified. You can list items for sale.
              </p>
            </div>
          </div>
        )}

        {/* ── Account details ── */}
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          border: '1px solid #e5e7eb', overflow: 'hidden',
        }}>
          {[
            {
              icon: <UserIcon style={{ width: '16px', height: '16px', color: '#9ca3af' }} />,
              label: 'User ID',
              value: <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#374151' }}>{user._id}</span>,
            },
            {
              icon: <Mail style={{ width: '16px', height: '16px', color: '#9ca3af' }} />,
              label: 'Email',
              value: <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{user.email}</span>,
            },
            ...(user.branch ? [{
              icon: <GraduationCap style={{ width: '16px', height: '16px', color: '#9ca3af' }} />,
              label: 'Branch',
              value: <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{user.branch}</span>,
            }] : []),
            ...(user.year ? [{
              icon: <Calendar style={{ width: '16px', height: '16px', color: '#9ca3af' }} />,
              label: 'Year',
              value: <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>{user.year}</span>,
            }] : []),
          ].map((row, idx, arr) => (
            <div
              key={row.label}
              style={{
                padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: '12px',
                borderBottom: idx < arr.length - 1 ? '1px solid #f9fafb' : 'none',
              }}
            >
              <div style={{
                width: '32px', height: '32px', backgroundColor: '#f3f4f6',
                borderRadius: '8px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                {row.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{row.label}</p>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.value}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}