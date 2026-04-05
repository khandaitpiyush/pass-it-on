import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { COLLEGES, BRANCHES, YEARS } from '../utils/mockData'
import axios from 'axios'

const API = 'http://localhost:5000/api/auth'

type Step = 'form' | 'otp'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [step, setStep] = useState<Step>('form')
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendCooldown, setResendCooldown] = useState(0)
  const [focused, setFocused] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeCode: '',
    branch: '',
    year: '',
  })

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  /* ---------- STEP 1: SIGNUP + SEND OTP ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.collegeCode) {
      setError('Please fill in all required fields')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await signup(formData)
      // Send OTP via Brevo
      await axios.post(`${API}/send-otp`, { email: formData.email })
      setStep('otp')
      setResendCooldown(60)
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- STEP 2: VERIFY OTP ---------- */
  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) {
      setError('Please enter the full 6-digit code')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await axios.post(`${API}/verify-otp`, { email: formData.email, otp: code })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid or expired OTP')
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- RESEND OTP ---------- */
  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError('')
    try {
      await axios.post(`${API}/send-otp`, { email: formData.email })
      setResendCooldown(60)
    } catch {
      setError('Failed to resend OTP. Try again.')
    }
  }

  /* ---------- OTP INPUT HANDLING ---------- */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otp]
    text.split('').forEach((char, i) => { next[i] = char })
    setOtp(next)
    document.getElementById(`otp-${Math.min(text.length, 5)}`)?.focus()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
        }

        /* ── LEFT PANEL ── */
        .signup-left {
          position: relative;
          background: #1a3a2a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .signup-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(74,180,100,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(34,90,55,0.4) 0%, transparent 60%);
        }

        .s-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
        }
        .s-blob-1 { width: 400px; height: 400px; background: #4ab464; top: -100px; right: -100px; }
        .s-blob-2 { width: 300px; height: 300px; background: #86efac; bottom: 50px; left: -80px; }

        .s-brand {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .s-brand-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 20px;
        }

        .s-brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .s-left-content { position: relative; z-index: 1; }

        .s-tag {
          display: inline-block;
          background: rgba(134,239,172,0.15);
          border: 1px solid rgba(134,239,172,0.3);
          color: #86efac;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 100px;
          margin-bottom: 24px;
        }

        .s-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          color: #fff;
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .s-heading em { font-style: italic; color: #86efac; }

        .s-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 40px;
        }

        .s-steps { display: flex; flex-direction: column; gap: 16px; }

        .s-step {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .s-step-num {
          width: 28px; height: 28px;
          background: rgba(134,239,172,0.15);
          border: 1px solid rgba(134,239,172,0.3);
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 600;
          color: #86efac;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .s-step-text strong {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }

        .s-step-text span {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }

        .s-left-footer {
          position: relative;
          z-index: 1;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }

        /* ── RIGHT PANEL ── */
        .signup-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow-y: auto;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .signup-right.mounted { opacity: 1; transform: translateY(0); }

        .signup-card { width: 100%; max-width: 420px; }

        .card-header { margin-bottom: 28px; }

        .card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px;
          color: #111;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }

        .card-sub { font-size: 14px; color: #888; }

        .card-sub a {
          color: #1a3a2a;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid rgba(26,58,42,0.3);
          transition: border-color 0.2s;
        }
        .card-sub a:hover { border-color: #1a3a2a; }

        /* Error */
        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #b91c1c;
          animation: shake 0.35s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Fields */
        .field-group { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }

        .field { display: flex; flex-direction: column; gap: 5px; }

        .field-label { font-size: 13px; font-weight: 500; color: #444; }

        .field-hint { font-size: 11px; color: #aaa; margin-top: 3px; }

        .field-wrap { position: relative; }

        .field-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #bbb;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .field-wrap.focused .field-icon { color: #1a3a2a; }

        .field-input, .field-select {
          width: 100%;
          padding: 10px 13px 10px 38px;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #111;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }

        .field-select { cursor: pointer; }

        .field-input:focus, .field-select:focus {
          border-color: #1a3a2a;
          box-shadow: 0 0 0 3px rgba(26,58,42,0.08);
        }

        .field-input::placeholder { color: #ccc; }

        .toggle-pw {
          position: absolute;
          right: 11px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #bbb;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .toggle-pw:hover { color: #555; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* Submit */
        .btn-submit {
          width: 100%;
          padding: 12px;
          background: #1a3a2a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-submit:hover:not(:disabled) { background: #243f30; }
        .btn-submit:active:not(:disabled) { transform: scale(0.99); }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── OTP STEP ── */
        .otp-header { text-align: center; margin-bottom: 28px; }

        .otp-icon {
          width: 56px; height: 56px;
          background: rgba(26,58,42,0.08);
          border-radius: 16px;
          display: grid;
          place-items: center;
          margin: 0 auto 16px;
          font-size: 26px;
        }

        .otp-title {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #111;
          margin-bottom: 8px;
        }

        .otp-sub { font-size: 14px; color: #888; line-height: 1.5; }

        .otp-sub strong { color: #333; font-weight: 600; }

        .otp-inputs {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 24px 0;
        }

        .otp-box {
          width: 48px; height: 56px;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          font-size: 20px;
          font-weight: 600;
          text-align: center;
          color: #111;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.1s;
          background: #fff;
        }

        .otp-box:focus {
          border-color: #1a3a2a;
          box-shadow: 0 0 0 3px rgba(26,58,42,0.1);
          transform: scale(1.05);
        }

        .otp-box.filled { border-color: #1a3a2a; background: rgba(26,58,42,0.04); }

        .otp-resend {
          text-align: center;
          font-size: 13px;
          color: #888;
          margin-bottom: 20px;
        }

        .resend-btn {
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          transition: color 0.2s;
        }

        .resend-btn:not(:disabled) { color: #1a3a2a; }
        .resend-btn:not(:disabled):hover { text-decoration: underline; }
        .resend-btn:disabled { color: #bbb; cursor: default; }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #888;
          cursor: pointer;
          padding: 0;
          margin: 16px auto 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #333; }

        /* Login row */
        .login-row {
          text-align: center;
          font-size: 13px;
          color: #888;
          margin-top: 20px;
        }
        .login-row a {
          color: #1a3a2a;
          font-weight: 600;
          text-decoration: none;
          margin-left: 4px;
        }
        .login-row a:hover { text-decoration: underline; }

        /* Progress indicator */
        .progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
        }
        .progress-step {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        .progress-dot {
          width: 20px; height: 20px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 10px;
          font-weight: 700;
          transition: all 0.3s;
        }
        .progress-dot.active { background: #1a3a2a; color: #fff; }
        .progress-dot.done { background: #4ab464; color: #fff; }
        .progress-dot.idle { background: #e8e8e8; color: #aaa; }
        .progress-label.active { color: #111; }
        .progress-label.done { color: #4ab464; }
        .progress-label.idle { color: #bbb; }
        .progress-line { flex: 1; height: 1px; background: #e8e8e8; }
        .progress-line.done { background: #4ab464; }

        @media (max-width: 768px) {
          .signup-root { grid-template-columns: 1fr; }
          .signup-left { display: none; }
          .signup-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="signup-root">

        {/* ── LEFT PANEL ── */}
        <div className="signup-left">
          <div className="s-blob s-blob-1" />
          <div className="s-blob s-blob-2" />

          <div className="s-brand">
            <div className="s-brand-icon">🌿</div>
            <span className="s-brand-name">PassItOn</span>
          </div>

          <div className="s-left-content">
            <div className="s-tag">Join the community</div>
            <h1 className="s-heading">
              Your campus,<br /><em>reimagined</em>
            </h1>
            <p className="s-sub">
              Trade textbooks, gadgets, furniture and more — all within your college network.
            </p>
            <div className="s-steps">
              <div className="s-step">
                <div className="s-step-num">1</div>
                <div className="s-step-text">
                  <strong>Create your account</strong>
                  <span>Fill in your college details</span>
                </div>
              </div>
              <div className="s-step">
                <div className="s-step-num">2</div>
                <div className="s-step-text">
                  <strong>Verify your email</strong>
                  <span>Enter the OTP we send you</span>
                </div>
              </div>
              <div className="s-step">
                <div className="s-step-num">3</div>
                <div className="s-step-text">
                  <strong>Start trading</strong>
                  <span>Browse, list, and connect</span>
                </div>
              </div>
            </div>
          </div>

          <div className="s-left-footer">© 2025 PassItOn · All rights reserved</div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className={`signup-right${mounted ? ' mounted' : ''}`}>
          <div className="signup-card">

            {/* Progress */}
            <div className="progress">
              <div className="progress-step">
                <div className={`progress-dot ${step === 'form' ? 'active' : 'done'}`}>
                  {step === 'otp' ? '✓' : '1'}
                </div>
                <span className={`progress-label ${step === 'form' ? 'active' : 'done'}`}>Details</span>
              </div>
              <div className={`progress-line ${step === 'otp' ? 'done' : ''}`} />
              <div className="progress-step">
                <div className={`progress-dot ${step === 'otp' ? 'active' : 'idle'}`}>2</div>
                <span className={`progress-label ${step === 'otp' ? 'active' : 'idle'}`}>Verify</span>
              </div>
            </div>

            {/* ── STEP 1: FORM ── */}
            {step === 'form' && (
              <>
                <div className="card-header">
                  <h2 className="card-title">Create account</h2>
                  <p className="card-sub">
                    Already have one? <Link to="/login">Sign in</Link>
                  </p>
                </div>

                {error && (
                  <div className="error-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="field-group">

                    {/* Name */}
                    <div className="field">
                      <label className="field-label">Full name <span style={{color:'#e53e3e'}}>*</span></label>
                      <div className={`field-wrap${focused === 'name' ? ' focused' : ''}`}>
                        <span className="field-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          className="field-input"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={e => set('name', e.target.value)}
                          onFocus={() => setFocused('name')}
                          onBlur={() => setFocused(null)}
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="field">
                      <label className="field-label">Email address <span style={{color:'#e53e3e'}}>*</span></label>
                      <div className={`field-wrap${focused === 'email' ? ' focused' : ''}`}>
                        <span className="field-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                        </span>
                        <input
                          className="field-input"
                          type="email"
                          placeholder="you@college.edu"
                          value={formData.email}
                          onChange={e => set('email', e.target.value)}
                          onFocus={() => setFocused('email')}
                          onBlur={() => setFocused(null)}
                          autoComplete="email"
                        />
                      </div>
                      <p className="field-hint">College email gets you a verified badge ✓</p>
                    </div>

                    {/* Password */}
                    <div className="field">
                      <label className="field-label">Password <span style={{color:'#e53e3e'}}>*</span></label>
                      <div className={`field-wrap${focused === 'password' ? ' focused' : ''}`}>
                        <span className="field-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </span>
                        <input
                          className="field-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={formData.password}
                          onChange={e => set('password', e.target.value)}
                          onFocus={() => setFocused('password')}
                          onBlur={() => setFocused(null)}
                          autoComplete="new-password"
                          style={{ paddingRight: '38px' }}
                        />
                        <button
                          type="button"
                          className="toggle-pw"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* College */}
                    <div className="field">
                      <label className="field-label">College <span style={{color:'#e53e3e'}}>*</span></label>
                      <div className={`field-wrap${focused === 'college' ? ' focused' : ''}`}>
                        <span className="field-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        </span>
                        <select
                          className="field-select"
                          value={formData.collegeCode}
                          onChange={e => set('collegeCode', e.target.value)}
                          onFocus={() => setFocused('college')}
                          onBlur={() => setFocused(null)}
                        >
                          <option value="">Choose your college</option>
                          {COLLEGES.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Branch + Year */}
                    <div className="grid-2">
                      <div className="field">
                        <label className="field-label">Branch</label>
                        <div className={`field-wrap${focused === 'branch' ? ' focused' : ''}`}>
                          <span className="field-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                          </span>
                          <select
                            className="field-select"
                            value={formData.branch}
                            onChange={e => set('branch', e.target.value)}
                            onFocus={() => setFocused('branch')}
                            onBlur={() => setFocused(null)}
                          >
                            <option value="">Select</option>
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="field">
                        <label className="field-label">Year</label>
                        <div className={`field-wrap${focused === 'year' ? ' focused' : ''}`}>
                          <span className="field-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          </span>
                          <select
                            className="field-select"
                            value={formData.year}
                            onChange={e => set('year', e.target.value)}
                            onFocus={() => setFocused('year')}
                            onBlur={() => setFocused(null)}
                          >
                            <option value="">Select</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading && <span className="spinner" />}
                    {isLoading ? 'Creating account…' : 'Continue →'}
                  </button>
                </form>

                <div className="login-row">
                  Already have an account?
                  <Link to="/login">Sign in</Link>
                </div>
              </>
            )}

            {/* ── STEP 2: OTP ── */}
            {step === 'otp' && (
              <>
                <div className="otp-header">
                  <div className="otp-icon">📬</div>
                  <h2 className="otp-title">Check your inbox</h2>
                  <p className="otp-sub">
                    We sent a 6-digit code to<br />
                    <strong>{formData.email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="error-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <div className="otp-inputs" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      className={`otp-box${digit ? ' filled' : ''}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                <div className="otp-resend">
                  Didn't receive it?
                  <button
                    className="resend-btn"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>

                <button
                  className="btn-submit"
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.join('').length < 6}
                >
                  {isLoading && <span className="spinner" />}
                  {isLoading ? 'Verifying…' : 'Verify & continue →'}
                </button>

                <button className="back-btn" onClick={() => { setStep('form'); setError('') }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back to details
                </button>
              </>
            )}

          </div>
        </div>

      </div>
    </>
  )
}