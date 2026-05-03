import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

import API from '../config';

const BRANCHES = [
  'Computer Engineering', 'Information Technology',
  'Electronics & Telecommunication', 'Mechanical Engineering',
  'Civil Engineering', 'Electrical Engineering',
  'Chemical Engineering', 'Biomedical Engineering', 'Other',
]
const YEARS = ['FE', 'SE', 'TE', 'BE']

const C = {
  dark:      '#0f2318',
  green:     '#1a3a2a',
  green2:    '#243f30',
  accent:    '#86efac',
  cream:     '#faf9f7',
  border:    '#e8e8e8',
  muted:     '#999999',
  text:      '#111111',
  subtext:   '#444444',
  red:       '#b91c1c',
  redbg:     '#fff5f5',
  redbdr:    '#fecaca',
  greenbg:   '#f0fdf4',
  greenbdr:  '#bbf7d0',
  greentxt:  '#15803d',
  greentxt2: '#166534',
}

// ─── OTP 6-box input ──────────────────────────────────────────────────────────
function OtpInput({ value, onChange, disabled }: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '')

  const focus = (i: number) => {
    const el = inputs.current[i]
    if (el) { el.focus(); el.select() }
  }

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      const next = digits.map((d, j) => j === i ? '' : d).join('')
      onChange(next.trimEnd())
      return
    }
    // multi-digit paste into one box
    if (raw.length > 1) {
      const arr = digits.slice()
      for (let k = 0; k < raw.length && i + k < 6; k++) arr[i + k] = raw[k]
      onChange(arr.join('').trimEnd())
      focus(Math.min(i + raw.length, 5))
      return
    }
    const arr = digits.slice()
    arr[i] = raw
    onChange(arr.join('').trimEnd())
    if (i < 5) setTimeout(() => focus(i + 1), 0)
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const arr = digits.slice()
      if (arr[i]) {
        arr[i] = ''
        onChange(arr.join('').trimEnd())
      } else if (i > 0) {
        arr[i - 1] = ''
        onChange(arr.join('').trimEnd())
        focus(i - 1)
      }
      return
    }
    if (e.key === 'ArrowLeft'  && i > 0) { e.preventDefault(); focus(i - 1) }
    if (e.key === 'ArrowRight' && i < 5) { e.preventDefault(); focus(i + 1) }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    onChange(pasted)
    focus(Math.min(pasted.length, 5))
  }

  return (
    <div onPaste={handlePaste} style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={2}
          value={digit}
          disabled={disabled}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
          style={{
            width: '48px',
            height: '56px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 700,
            fontFamily: 'Georgia, "Times New Roman", serif',
            border: `2px solid ${digit ? C.green : C.border}`,
            borderRadius: '12px',
            background: digit ? C.greenbg : '#ffffff',
            color: '#111111',                // always explicit black — never inherit
            WebkitTextFillColor: '#111111',  // override Safari/Chrome autofill
            outline: 'none',
            caretColor: C.green,
            transition: 'border-color 0.15s, background 0.15s',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  )
}

// ─── Resend timer ─────────────────────────────────────────────────────────────
function useResendTimer(initial = 60) {
  const [seconds, setSeconds] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback((s = initial) => {
    setSeconds(s)
    if (ref.current) clearInterval(ref.current)
    ref.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(ref.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [initial])

  useEffect(() => () => { if (ref.current) clearInterval(ref.current) }, [])
  return { seconds, start, canResend: seconds === 0 }
}

// ─── Tiny shared components ───────────────────────────────────────────────────
const Spinner = ({ dark }: { dark?: boolean }) => (
  <span style={{
    display: 'inline-block', width: '14px', height: '14px', flexShrink: 0,
    border: dark ? '2px solid rgba(0,0,0,0.12)' : '2px solid rgba(255,255,255,0.3)',
    borderTopColor: dark ? '#333' : '#fff',
    borderRadius: '50%', animation: 'pioSpin 0.7s linear infinite',
  }} />
)

const IconUser    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconMail    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
const IconLock    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconFolder  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
const IconCal     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconEye     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconEyeOff  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const IconBack    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
const IconCheck   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
const IconAlert   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px 11px 36px',
  border: `1.5px solid ${C.border}`,
  borderRadius: '10px',
  fontSize: '13.5px',
  fontFamily: 'inherit',
  color: C.text,
  background: '#ffffff',
  outline: 'none',
  appearance: 'none',
  WebkitAppearance: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()

  const [step, setStep]           = useState<'form' | 'otp'>('form')
  const [mounted, setMounted]     = useState(false)
  const [error, setError]         = useState('')
  const [info, setInfo]           = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPwd, setShowPwd]     = useState(false)
  const [otp, setOtp]             = useState('')
  const { seconds, start: startTimer, canResend } = useResendTimer(60)

  const [form, setForm] = useState({ name: '', email: '', password: '', branch: '', year: '' })

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t) }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (!form.name.trim() || !form.email.trim() || !form.password) { setError('Please fill in all required fields.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setIsLoading(true)
    try {
      await axios.post(`${API}/auth/send-signup-otp`, { name: form.name.trim(), email: form.email.trim(), password: form.password, branch: form.branch, year: form.year })
      setStep('otp'); setError(''); startTimer()
    } catch (err: any) {
      const d = err?.response?.data
      if (err?.response?.status === 429 && d?.waitSeconds) { startTimer(d.waitSeconds); setStep('otp') }
      else setError(d?.message || 'Failed to send code. Please try again.')
    } finally { setIsLoading(false) }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (otp.length !== 6) { setError('Please enter the full 6-digit code.'); return }
    setIsLoading(true)
    try {
      const { data } = await axios.post(`${API}/auth/verify-signup-otp`, { email: form.email.trim(), otp })
      authLogin(data.token, data.user)
      navigate(data.needsCampusSelection || !data.campusId ? '/select-campus' : '/dashboard')
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Verification failed. Please try again.'
      setError(msg)
      if (msg.includes('new one') || msg.includes('expired')) setOtp('')
    } finally { setIsLoading(false) }
  }

  const handleResend = async () => {
    if (!canResend || isLoading) return
    setError(''); setInfo(''); setOtp(''); setIsLoading(true)
    try {
      await axios.post(`${API}/auth/send-signup-otp`, { name: form.name.trim(), email: form.email.trim(), password: form.password, branch: form.branch, year: form.year })
      setInfo('New code sent! Check your inbox.'); startTimer()
    } catch (err: any) {
      const d = err?.response?.data
      if (err?.response?.status === 429 && d?.waitSeconds) startTimer(d.waitSeconds)
      setError(d?.message || 'Failed to resend. Please try again.')
    } finally { setIsLoading(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes pioSpin   { to { transform: rotate(360deg); } }
        @keyframes pioFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pioShake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        .pio-input:focus { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(26,58,42,0.08) !important; }
        .pio-otp:focus   { border-color: ${C.green} !important; box-shadow: 0 0 0 3px rgba(26,58,42,0.1) !important; }
        .pio-btn-primary:hover:not(:disabled) { background: ${C.green2} !important; box-shadow: 0 8px 24px rgba(26,58,42,0.22) !important; }
        .pio-back:hover  { color: ${C.text} !important; }
        .pio-link:hover  { border-bottom-color: ${C.green} !important; }
        @media (max-width: 768px) {
          .pio-root { grid-template-columns: 1fr !important; }
          .pio-left { display: none !important; }
          .pio-right { padding: 32px 20px !important; }
        }
      `}</style>

      <div className="pio-root" style={{
        minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        background: C.cream,
      }}>

        {/* ── LEFT ─────────────────────────────────────────────────────────── */}
        <div className="pio-left" style={{
          position: 'relative', background: C.dark, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px',
        }}>
          {/* blobs */}
          <div style={{ position:'absolute', width:400, height:400, background:'#4ade80', top:'-120px', right:'-120px', borderRadius:'50%', filter:'blur(72px)', opacity:0.1, pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:260, height:260, background:'#86efac', bottom:'40px', left:'-70px', borderRadius:'50%', filter:'blur(72px)', opacity:0.1, pointerEvents:'none' }} />

          {/* brand */}
          <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'38px', height:'38px', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:'10px', display:'grid', placeItems:'center', fontSize:'18px' }}>🌿</div>
            <span style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:'20px', color:'#fff', letterSpacing:'-0.3px' }}>PassItOn</span>
          </div>

          {/* body */}
          <div style={{ position:'relative', zIndex:1 }}>
            <div style={{ display:'inline-block', background:'rgba(134,239,172,0.12)', border:'1px solid rgba(134,239,172,0.28)', color:C.accent, fontSize:'10px', fontWeight:600, letterSpacing:'1.8px', textTransform:'uppercase', padding:'5px 12px', borderRadius:'100px', marginBottom:'22px' }}>Free to join</div>
            <h1 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:'clamp(26px, 3.2vw, 42px)', color:'#fff', lineHeight:1.12, marginBottom:'16px', letterSpacing:'-0.5px' }}>
              Your campus,<br /><em style={{ fontStyle:'italic', color:C.accent }}>reimagined.</em>
            </h1>
            <p style={{ fontSize:'14px', color:'rgba(255,255,255,0.45)', lineHeight:1.75, maxWidth:'300px', marginBottom:'36px' }}>
              Trade textbooks, gadgets, and more — all within your trusted college network.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              {[
                { n:'1', t:'Create your account',     d:'Name, email, password' },
                { n:'2', t:'Verify your email',       d:'OTP sent to your inbox' },
                { n:'3', t:'Start trading on campus', d:'List items, earn trust' },
              ].map(s => (
                <div key={s.n} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                  <div style={{ width:'26px', height:'26px', background:'rgba(134,239,172,0.12)', border:'1px solid rgba(134,239,172,0.28)', borderRadius:'50%', display:'grid', placeItems:'center', fontSize:'11px', fontWeight:600, color:C.accent, flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:600, color:'#fff', marginBottom:'2px' }}>{s.t}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position:'relative', zIndex:1, fontSize:'11px', color:'rgba(255,255,255,0.25)' }}>© 2026 PassItOn · Campus marketplace for students</div>
        </div>

        {/* ── RIGHT ────────────────────────────────────────────────────────── */}
        <div className="pio-right" style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'40px 36px', overflowY:'auto',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(14px)',
          transition:'opacity 0.45s ease, transform 0.45s ease',
        }}>
          <div style={{ width:'100%', maxWidth:'400px' }}>

            {/* step dots */}
            <div style={{ display:'flex', gap:'8px', marginBottom:'28px' }}>
              {(['form','otp'] as const).map((s, i) => (
                <div key={s} style={{
                  height:'3px', borderRadius:'100px',
                  flex: step === s ? 2 : 1,
                  background: step === s ? C.green : (step === 'otp' && i === 0 ? '#86efac' : C.border),
                  transition:'flex 0.3s ease, background 0.3s ease',
                }} />
              ))}
            </div>

            {/* ── FORM STEP ── */}
            {step === 'form' && (
              <div style={{ animation:'pioFadeUp 0.35s ease both' }}>
                <div style={{ marginBottom:'22px' }}>
                  <h2 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:'28px', color:C.text, letterSpacing:'-0.5px', marginBottom:'5px' }}>Create account</h2>
                  <p style={{ fontSize:'13px', color:C.muted }}>
                    Already have one?{' '}
                    <Link to="/login" className="pio-link" style={{ color:C.green, fontWeight:600, textDecoration:'none', borderBottom:`1px solid rgba(26,58,42,0.25)` }}>Sign in</Link>
                  </p>
                </div>

                <div style={{ display:'flex', alignItems:'flex-start', gap:'10px', background:C.greenbg, border:`1px solid ${C.greenbdr}`, borderRadius:'10px', padding:'11px 13px', marginBottom:'18px', fontSize:'12.5px', color:C.greentxt, lineHeight:1.55 }}>
                  <span style={{ flexShrink:0 }}>💡</span>
                  <span>Use your <strong>college email</strong> to get auto-verified and unlock selling instantly.</span>
                </div>

                {error && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'9px', background:C.redbg, border:`1px solid ${C.redbdr}`, borderRadius:'10px', padding:'11px 13px', marginBottom:'16px', fontSize:'13px', color:C.red, lineHeight:1.5, animation:'pioShake 0.3s ease' }}>
                    <span style={{ flexShrink:0, marginTop:'1px' }}><IconAlert /></span>{error}
                  </div>
                )}

                <form onSubmit={handleSendOtp}>
                  <div style={{ display:'flex', flexDirection:'column', gap:'13px', marginBottom:'18px' }}>

                    {/* Name */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      <label style={{ fontSize:'12px', fontWeight:600, color:C.subtext }}>Full name *</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#c0c0c0', display:'flex', pointerEvents:'none' }}><IconUser /></span>
                        <input className="pio-input" type="text" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" style={inputBase} />
                      </div>
                    </div>

                    {/* Email */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      <label style={{ fontSize:'12px', fontWeight:600, color:C.subtext }}>Email address *</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#c0c0c0', display:'flex', pointerEvents:'none' }}><IconMail /></span>
                        <input className="pio-input" type="email" placeholder="you@college.edu" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" style={inputBase} />
                      </div>
                      <span style={{ fontSize:'11px', color:C.muted }}>College email = instant verified seller ✓</span>
                    </div>

                    {/* Password */}
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      <label style={{ fontSize:'12px', fontWeight:600, color:C.subtext }}>Password *</label>
                      <div style={{ position:'relative' }}>
                        <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#c0c0c0', display:'flex', pointerEvents:'none' }}><IconLock /></span>
                        <input className="pio-input" type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" style={{ ...inputBase, paddingRight:'40px' }} />
                        <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#aaa', display:'flex', padding:'4px' }}>
                          {showPwd ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    {/* Branch + Year */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                      {[
                        { key:'branch', label:'Branch', icon:<IconFolder />, opts:BRANCHES },
                        { key:'year',   label:'Year',   icon:<IconCal />,    opts:YEARS   },
                      ].map(f => (
                        <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                          <label style={{ fontSize:'12px', fontWeight:600, color:C.subtext }}>{f.label}</label>
                          <div style={{ position:'relative' }}>
                            <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#c0c0c0', display:'flex', pointerEvents:'none' }}>{f.icon}</span>
                            <select className="pio-input" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                              style={{ ...inputBase, paddingRight:'28px',
                                backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                                backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
                              }}>
                              <option value="">Select</option>
                              {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>

                  <button type="submit" className="pio-btn-primary" disabled={isLoading} style={{ width:'100%', padding:'13px', background: isLoading ? '#6b7280' : C.green, color:'#fff', fontFamily:'inherit', fontSize:'14px', fontWeight:600, border:'none', borderRadius:'10px', cursor: isLoading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'14px', transition:'background 0.2s, box-shadow 0.2s' }}>
                    {isLoading ? <><Spinner />Sending code…</> : 'Continue →'}
                  </button>
                </form>

                <p style={{ textAlign:'center', fontSize:'13px', color:C.muted }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color:C.green, fontWeight:600, textDecoration:'none' }}>Sign in</Link>
                </p>
              </div>
            )}

            {/* ── OTP STEP ── */}
            {step === 'otp' && (
              <div style={{ animation:'pioFadeUp 0.35s ease both' }}>
                <button type="button" className="pio-back" onClick={() => { setStep('form'); setError(''); setInfo(''); setOtp('') }}
                  style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontFamily:'inherit', fontSize:'13px', color:C.muted, padding:0, marginBottom:'22px' }}>
                  <IconBack /> Back
                </button>

                <div style={{ width:'58px', height:'58px', borderRadius:'16px', background:C.greenbg, border:`1px solid ${C.greenbdr}`, display:'grid', placeItems:'center', fontSize:'26px', margin:'0 auto 18px' }}>✉️</div>
                <h2 style={{ fontFamily:"'DM Serif Display', Georgia, serif", fontSize:'26px', color:C.text, letterSpacing:'-0.4px', textAlign:'center', marginBottom:'6px' }}>Check your inbox</h2>
                <p style={{ fontSize:'13.5px', color:C.muted, textAlign:'center', lineHeight:1.6, marginBottom:'26px' }}>
                  We sent a 6-digit code to<br />
                  <strong style={{ color:C.green }}>{form.email}</strong>
                </p>

                {error && (
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'9px', background:C.redbg, border:`1px solid ${C.redbdr}`, borderRadius:'10px', padding:'11px 13px', marginBottom:'16px', fontSize:'13px', color:C.red, lineHeight:1.5, animation:'pioShake 0.3s ease' }}>
                    <span style={{ flexShrink:0, marginTop:'1px' }}><IconAlert /></span>{error}
                  </div>
                )}
                {info && !error && (
                  <div style={{ display:'flex', alignItems:'center', gap:'9px', background:C.greenbg, border:`1px solid ${C.greenbdr}`, borderRadius:'10px', padding:'11px 13px', marginBottom:'16px', fontSize:'13px', color:C.greentxt2 }}>
                    <IconCheck />{info}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div style={{ marginBottom:'24px' }}>
                    <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
                  </div>

                  <button type="submit" className="pio-btn-primary" disabled={isLoading || otp.length !== 6}
                    style={{ width:'100%', padding:'13px', background:(isLoading || otp.length !== 6) ? '#6b7280' : C.green, color:'#fff', fontFamily:'inherit', fontSize:'14px', fontWeight:600, border:'none', borderRadius:'10px', cursor:(isLoading || otp.length !== 6) ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'14px', transition:'background 0.2s, box-shadow 0.2s' }}>
                    {isLoading ? <><Spinner />Verifying…</> : <><IconCheck />Verify &amp; Create Account</>}
                  </button>
                </form>

                {/* Resend row */}
                <div style={{ textAlign:'center', fontSize:'13px', color:C.muted }}>
                  Didn't receive it?{' '}
                  {canResend ? (
                    <button type="button" onClick={handleResend} disabled={isLoading} style={{ background:'none', border:'none', fontFamily:'inherit', fontSize:'13px', fontWeight:600, color: isLoading ? C.muted : C.green, cursor: isLoading ? 'not-allowed' : 'pointer', padding:0, marginLeft:'4px', textDecoration:'underline' }}>
                      {isLoading ? <Spinner dark /> : 'Resend code'}
                    </button>
                  ) : (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'100px', background:'#f4f4f4', fontSize:'12px', fontWeight:600, color:'#666', marginLeft:'6px' }}>
                      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:C.green, display:'inline-block', animation:'pioSpin 2s ease-in-out infinite' }} />
                      Resend in {seconds}s
                    </span>
                  )}
                </div>

                <p style={{ textAlign:'center', fontSize:'11.5px', color:'#bbb', marginTop:'16px', lineHeight:1.6 }}>
                  Check your spam folder if you don't see it.<br />Code expires in 10 minutes.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}