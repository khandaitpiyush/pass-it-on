import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Mail,
  GraduationCap,
  Calendar,
  LogOut,
  User as UserIcon,
  Package,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const API = 'http://localhost:5000/api/auth';
const RESEND_COOLDOWN = 60;

// ── 6-box OTP input ──────────────────────────────────────────────────────────
function OtpBoxes({
  value,
  onChange,
  disabled,
  hasError,
}: {
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
      if (!value[i] && i > 0) {
        const arr = value.padEnd(6, ' ').split('');
        arr[i - 1] = ' ';
        onChange(arr.join('').trimEnd());
        refs.current[i - 1]?.focus();
      } else {
        const arr = value.padEnd(6, ' ').split('');
        arr[i] = ' ';
        onChange(arr.join('').trimEnd());
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
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => {
        const filled = !!value[i] && value[i] !== ' ';
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={filled ? value[i] : ''}
            disabled={disabled}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={[
              'w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-150',
              disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
              hasError
                ? 'border-red-400 bg-red-50 text-red-700'
                : filled
                  ? 'border-green-500 bg-green-50 text-green-800'
                  : 'border-gray-200 text-gray-900 focus:border-green-500 focus:bg-white',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // auto-verify when all 6 digits typed
  useEffect(() => {
    if (otp.replace(/ /g, '').length === 6 && step === 'otp' && !isVerifying) {
      handleVerifyOtp(otp.replace(/ /g, ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/listings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListingCount(
          res.data.filter((l: any) => l.seller._id === user._id || l.seller === user._id).length
        );
      } catch {
        setListingCount(0);
      }
    })();
  }, [user]);

  if (!user) return null;

  // ── email validation ──────────────────────────────────────────────────────
  const PERSONAL = new Set(['gmail.com','yahoo.com','yahoo.in','outlook.com',
    'hotmail.com','live.com','icloud.com','me.com','aol.com','protonmail.com',
    'proton.me','rediffmail.com','ymail.com','zoho.com','tutanota.com',
    'mail.com','gmx.com']);

  const emailValidationError = (e: string) => {
    if (!e) return '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address.';
    if (PERSONAL.has(e.toLowerCase().split('@')[1]))
      return 'Personal emails not accepted. Use your college/institutional email.';
    return '';
  };

  const emailErr = emailTouched ? emailValidationError(collegeEmail) : '';
  const emailOk  = !!collegeEmail && !emailValidationError(collegeEmail);

  const startTimer = () => {
    setResendTimer(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
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

  // ── send OTP ──────────────────────────────────────────────────────────────
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

  // ── verify OTP ────────────────────────────────────────────────────────────
  const handleVerifyOtp = async (code?: string) => {
    const c = (code ?? otp).replace(/ /g, '');
    if (c.length !== 6) { setError('Enter all 6 digits.'); return; }
    setError('');
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/verify-otp`, { email: collegeEmail, otp: c }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser({ studentVerified: true, emailVerified: true, email: collegeEmail });
      setSuccess('Verified! Your college email is now your primary email.');
      setTimeout(resetFlow, 2000);
    } catch (e: any) {
      setOtp('');
      setError(e?.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isSending) return;
    setError(''); setOtp('');
    await handleSendOtp();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Profile card ── */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {/* green banner */}
          <div className="h-28 bg-gradient-to-r from-green-600 to-green-700" />

          <div className="px-6 pb-6">
            {/* avatar sits just below the banner */}
            <div className="-mt-10 mb-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
                  <span className="text-3xl font-black text-green-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-lg border-2 border-white flex items-center justify-center shadow-sm ${
                  user.studentVerified ? 'bg-green-600' : 'bg-amber-500'
                }`}>
                  {user.studentVerified
                    ? <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    : <ShieldAlert className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-0.5">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{user.email}</p>

            <div className="flex flex-wrap gap-2">
              {user.studentVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Student
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <ShieldAlert className="w-3.5 h-3.5" /> Unverified
                </span>
              )}
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  <CheckCircle className="w-3.5 h-3.5" /> Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-5 text-center">
            <div className="flex justify-center mb-2">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {listingCount === null ? '—' : listingCount}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">My Listings</p>
          </div>
          <div className="bg-white rounded-xl border p-5 text-center">
            <div className="flex justify-center mb-2">
              <Sparkles className={`w-5 h-5 ${user.studentVerified ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {user.studentVerified ? 'Seller' : 'Buyer'}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">Account Type</p>
          </div>
        </div>

        {/* ── Account Details ── */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          <div className="divide-y divide-gray-50">

            <div className="flex items-center gap-3 py-3.5">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">User ID</p>
                <p className="text-xs font-mono font-medium text-gray-800 break-all">{user._id}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-3.5">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{user.email}</p>
              </div>
            </div>

            {user.branch && (
              <div className="flex items-center gap-3 py-3.5">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Branch</p>
                  <p className="text-sm font-medium text-gray-800">{user.branch}</p>
                </div>
              </div>
            )}

            {user.year && (
              <div className="flex items-center gap-3 py-3.5">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Year</p>
                  <p className="text-sm font-medium text-gray-800">{user.year}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Verification Section ── */}
        {!user.studentVerified && (
          <div className={`rounded-xl border overflow-hidden ${
            showOtpFlow ? 'bg-white border-gray-200' : 'bg-amber-50 border-amber-200'
          }`}>

            {/* collapsed banner */}
            {!showOtpFlow && (
              <button
                onClick={() => setShowOtpFlow(true)}
                className="w-full p-5 flex items-center gap-4 text-left group hover:bg-amber-100 transition"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition">
                  <GraduationCap className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 text-sm">Become a Verified Seller</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Verify your college email to list items on the marketplace
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* expanded flow */}
            {showOtpFlow && (
              <div className="p-6">

                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {step === 'email' ? 'Enter your college email' : 'Enter verification code'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {step === 'email'
                        ? "We'll send a 6-digit OTP to verify your student status."
                        : <span>Code sent to <span className="font-medium text-gray-700">{collegeEmail}</span></span>}
                    </p>
                  </div>
                  <button
                    onClick={resetFlow}
                    className="text-xs text-gray-400 hover:text-gray-600 transition mt-0.5"
                  >
                    Cancel
                  </button>
                </div>

                {/* step 1: email */}
                {step === 'email' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        College / Institutional Email
                      </label>
                      <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${
                        emailErr
                          ? 'border-red-400 bg-red-50'
                          : emailOk
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-white focus-within:border-green-400'
                      }`}>
                        <Mail className={`w-4 h-4 ml-3.5 shrink-0 ${
                          emailErr ? 'text-red-400' : emailOk ? 'text-green-500' : 'text-gray-400'
                        }`} />
                        <input
                          type="email"
                          value={collegeEmail}
                          onChange={(e) => { setCollegeEmail(e.target.value); setError(''); }}
                          onBlur={() => setEmailTouched(true)}
                          onKeyDown={(e) => e.key === 'Enter' && emailOk && handleSendOtp()}
                          placeholder="yourname@college.edu.in"
                          className="flex-1 px-3 py-3 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
                        />
                        {emailOk && <CheckCircle className="w-4 h-4 text-green-500 mr-3 shrink-0" />}
                      </div>

                      {emailErr ? (
                        <div className="flex items-center gap-1.5 mt-2">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <p className="text-xs text-red-600">{emailErr}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2">
                          e.g.{' '}
                          <span className="font-mono">name@dbit.in</span>,{' '}
                          <span className="font-mono">name@mu.ac.in</span>
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                      </div>
                    )}

                    <button
                      onClick={handleSendOtp}
                      disabled={isSending || !emailOk}
                      className="w-full py-3 rounded-xl text-sm font-semibold transition-all
                        bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed
                        flex items-center justify-center gap-2"
                    >
                      {isSending
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</>
                        : <>Send verification code <ChevronRight className="w-4 h-4" /></>
                      }
                    </button>
                  </div>
                )}

                {/* step 2: OTP boxes */}
                {step === 'otp' && (
                  <div className="space-y-5">

                    {success ? (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="font-bold text-green-800 text-center">{success}</p>
                      </div>
                    ) : (
                      <>
                        <OtpBoxes
                          value={otp}
                          onChange={setOtp}
                          disabled={isVerifying}
                          hasError={!!error}
                        />

                        {error && (
                          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                          </div>
                        )}

                        <button
                          onClick={() => handleVerifyOtp()}
                          disabled={isVerifying || otp.replace(/ /g, '').length !== 6}
                          className="w-full py-3 rounded-xl text-sm font-semibold transition-all
                            bg-green-600 text-white hover:bg-green-700 active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2"
                        >
                          {isVerifying
                            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying…</>
                            : <><ShieldCheck className="w-4 h-4" /> Verify &amp; Continue</>
                          }
                        </button>

                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                          <button
                            onClick={handleResend}
                            disabled={resendTimer > 0 || isSending}
                            className="font-semibold text-green-700 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                          >
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
                          </button>
                          <span className="text-gray-300">·</span>
                          <button
                            onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                            className="hover:text-gray-700 transition"
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
          </div>
        )}

        {/* ── Verified banner ── */}
        {user.studentVerified && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-green-900">Verified Seller</p>
              <p className="text-sm text-green-700 mt-0.5">
                Your student status is verified. You can list items for sale.
              </p>
            </div>
          </div>
        )}

        {/* ── Logout ── */}
        <div className="bg-white rounded-xl border p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Danger Zone</p>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600
              hover:bg-red-50 hover:border-red-300 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

      </div>
    </div>
  );
}