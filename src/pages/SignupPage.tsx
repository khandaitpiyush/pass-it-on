import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { COLLEGES, BRANCHES, YEARS } from '../utils/mockData'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    collegeCode: '', branch: '', year: '',
  })

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

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
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
        }

        /* ── LEFT ── */
        .su-left {
          position: relative;
          background: #1a3a2a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .su-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(74,180,100,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(34,90,55,0.4) 0%, transparent 60%);
        }

        .su-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.15; }
        .su-blob-1 { width: 400px; height: 400px; background: #4ab464; top: -100px; right: -100px; }
        .su-blob-2 { width: 300px; height: 300px; background: #86efac; bottom: 50px; left: -80px; }

        .su-brand { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; }

        .su-brand-icon {
          width: 40px; height: 40px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          display: grid; place-items: center;
          font-size: 20px;
        }

        .su-brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; color: #fff; letter-spacing: -0.3px;
        }

        .su-left-body { position: relative; z-index: 1; }

        .su-tag {
          display: inline-block;
          background: rgba(134,239,172,0.15);
          border: 1px solid rgba(134,239,172,0.3);
          color: #86efac;
          font-size: 11px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 5px 12px; border-radius: 100px; margin-bottom: 24px;
        }

        .su-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          color: #fff; line-height: 1.15; margin-bottom: 20px;
        }
        .su-heading em { font-style: italic; color: #86efac; }

        .su-sub {
          font-size: 15px; color: rgba(255,255,255,0.55);
          line-height: 1.7; max-width: 340px; margin-bottom: 40px;
        }

        .su-steps { display: flex; flex-direction: column; gap: 18px; }

        .su-step { display: flex; align-items: flex-start; gap: 14px; }

        .su-step-num {
          width: 28px; height: 28px;
          background: rgba(134,239,172,0.15);
          border: 1px solid rgba(134,239,172,0.3);
          border-radius: 50%;
          display: grid; place-items: center;
          font-size: 12px; font-weight: 600;
          color: #86efac; flex-shrink: 0; margin-top: 1px;
        }

        .su-step-title { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 2px; }
        .su-step-desc { font-size: 12px; color: rgba(255,255,255,0.4); }

        .su-left-footer { position: relative; z-index: 1; font-size: 12px; color: rgba(255,255,255,0.3); }

        /* ── RIGHT ── */
        .su-right {
          display: flex; align-items: center; justify-content: center;
          padding: 40px; overflow-y: auto;
          opacity: 0; transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .su-right.mounted { opacity: 1; transform: translateY(0); }

        .su-card { width: 100%; max-width: 420px; }

        .su-card-header { margin-bottom: 28px; }

        .su-card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 30px; color: #111; letter-spacing: -0.5px; margin-bottom: 6px;
        }

        .su-card-sub { font-size: 14px; color: #888; }
        .su-card-sub a {
          color: #1a3a2a; font-weight: 500; text-decoration: none;
          border-bottom: 1px solid rgba(26,58,42,0.3); transition: border-color 0.2s;
        }
        .su-card-sub a:hover { border-color: #1a3a2a; }

        /* Notice */
        .su-notice {
          display: flex; align-items: flex-start; gap: 10px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;
          font-size: 13px; color: #166534; line-height: 1.5;
        }
        .su-notice-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }

        /* Error */
        .su-error {
          display: flex; align-items: center; gap: 10px;
          background: #fff5f5; border: 1px solid #fecaca;
          border-radius: 10px; padding: 12px 14px; margin-bottom: 18px;
          font-size: 13px; color: #b91c1c;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        /* Fields */
        .su-fields { display: flex; flex-direction: column; gap: 13px; margin-bottom: 20px; }
        .su-field { display: flex; flex-direction: column; gap: 5px; }
        .su-label { font-size: 13px; font-weight: 500; color: #444; }
        .su-hint { font-size: 11px; color: #aaa; margin-top: 2px; }
        .su-req { color: #e53e3e; }

        .su-field-wrap { position: relative; }

        .su-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: #bbb; display: flex; align-items: center;
          pointer-events: none; transition: color 0.2s;
        }
        .su-field-wrap.focused .su-icon { color: #1a3a2a; }

        .su-input, .su-select {
          width: 100%; padding: 10px 13px 10px 38px;
          border: 1.5px solid #e5e5e5; border-radius: 10px;
          font-size: 13.5px; font-family: 'DM Sans', sans-serif;
          color: #111; background: #fff; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .su-select { cursor: pointer; }
        .su-input:focus, .su-select:focus {
          border-color: #1a3a2a;
          box-shadow: 0 0 0 3px rgba(26,58,42,0.08);
        }
        .su-input::placeholder { color: #ccc; }

        .su-toggle {
          position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #bbb; padding: 4px; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .su-toggle:hover { color: #555; }

        .su-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .su-btn {
          width: 100%; padding: 13px;
          background: #1a3a2a; color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          border: none; border-radius: 10px; cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 16px;
        }
        .su-btn:hover:not(:disabled) { background: #243f30; }
        .su-btn:active:not(:disabled) { transform: scale(0.99); }
        .su-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .su-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .su-login-row { text-align: center; font-size: 13px; color: #888; }
        .su-login-row a { color: #1a3a2a; font-weight: 600; text-decoration: none; margin-left: 4px; }
        .su-login-row a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .su-root { grid-template-columns: 1fr; }
          .su-left { display: none; }
          .su-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="su-root">

        {/* ── LEFT ── */}
        <div className="su-left">
          <div className="su-blob su-blob-1" />
          <div className="su-blob su-blob-2" />

          <div className="su-brand">
            <div className="su-brand-icon">🌿</div>
            <span className="su-brand-name">PassItOn</span>
          </div>

          <div className="su-left-body">
            <div className="su-tag">Free to join</div>
            <h1 className="su-heading">Your campus,<br /><em>reimagined</em></h1>
            <p className="su-sub">
              Trade textbooks, gadgets, furniture and more — all within your trusted college network.
            </p>
            <div className="su-steps">
              <div className="su-step">
                <div className="su-step-num">1</div>
                <div>
                  <div className="su-step-title">Sign up free</div>
                  <div className="su-step-desc">Browse and buy instantly</div>
                </div>
              </div>
              <div className="su-step">
                <div className="su-step-num">2</div>
                <div>
                  <div className="su-step-title">Verify your email</div>
                  <div className="su-step-desc">Unlock selling &amp; contacting sellers</div>
                </div>
              </div>
              <div className="su-step">
                <div className="su-step-num">3</div>
                <div>
                  <div className="su-step-title">Start trading</div>
                  <div className="su-step-desc">List items, earn trust, build rep</div>
                </div>
              </div>
            </div>
          </div>

          <div className="su-left-footer">© 2025 PassItOn · All rights reserved</div>
        </div>

        {/* ── RIGHT ── */}
        <div className={`su-right${mounted ? ' mounted' : ''}`}>
          <div className="su-card">

            <div className="su-card-header">
              <h2 className="su-card-title">Create account</h2>
              <p className="su-card-sub">
                Already have one? <Link to="/login">Sign in</Link>
              </p>
            </div>

            {/* Info notice */}
            <div className="su-notice">
              <span className="su-notice-icon">💡</span>
              <span>
                You can <strong>browse and buy</strong> right away. Verify your email later to <strong>sell items</strong> and contact sellers.
              </span>
            </div>

            {error && (
              <div className="su-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="su-fields">

                {/* Name */}
                <div className="su-field">
                  <label className="su-label">Full name <span className="su-req">*</span></label>
                  <div className={`su-field-wrap${focused === 'name' ? ' focused' : ''}`}>
                    <span className="su-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <input className="su-input" type="text" placeholder="John Doe"
                      value={formData.name} onChange={e => set('name', e.target.value)}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                      autoComplete="name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="su-field">
                  <label className="su-label">Email address <span className="su-req">*</span></label>
                  <div className={`su-field-wrap${focused === 'email' ? ' focused' : ''}`}>
                    <span className="su-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
                      </svg>
                    </span>
                    <input className="su-input" type="email" placeholder="you@college.edu"
                      value={formData.email} onChange={e => set('email', e.target.value)}
                      onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                      autoComplete="email"
                    />
                  </div>
                  <span className="su-hint">Use college email to get a verified badge ✓</span>
                </div>

                {/* Password */}
                <div className="su-field">
                  <label className="su-label">Password <span className="su-req">*</span></label>
                  <div className={`su-field-wrap${focused === 'password' ? ' focused' : ''}`}>
                    <span className="su-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                    <input className="su-input" type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={formData.password} onChange={e => set('password', e.target.value)}
                      onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                      autoComplete="new-password" style={{ paddingRight: '38px' }}
                    />
                    <button type="button" className="su-toggle"
                      onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                      {showPassword ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* College */}
                <div className="su-field">
                  <label className="su-label">College <span className="su-req">*</span></label>
                  <div className={`su-field-wrap${focused === 'college' ? ' focused' : ''}`}>
                    <span className="su-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </span>
                    <select className="su-select"
                      value={formData.collegeCode} onChange={e => set('collegeCode', e.target.value)}
                      onFocus={() => setFocused('college')} onBlur={() => setFocused(null)}>
                      <option value="">Choose your college</option>
                      {COLLEGES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Branch + Year */}
                <div className="su-grid2">
                  <div className="su-field">
                    <label className="su-label">Branch</label>
                    <div className={`su-field-wrap${focused === 'branch' ? ' focused' : ''}`}>
                      <span className="su-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                      </span>
                      <select className="su-select"
                        value={formData.branch} onChange={e => set('branch', e.target.value)}
                        onFocus={() => setFocused('branch')} onBlur={() => setFocused(null)}>
                        <option value="">Select</option>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="su-field">
                    <label className="su-label">Year</label>
                    <div className={`su-field-wrap${focused === 'year' ? ' focused' : ''}`}>
                      <span className="su-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                      </span>
                      <select className="su-select"
                        value={formData.year} onChange={e => set('year', e.target.value)}
                        onFocus={() => setFocused('year')} onBlur={() => setFocused(null)}>
                        <option value="">Select</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              <button type="submit" className="su-btn" disabled={isLoading}>
                {isLoading && <span className="su-spinner" />}
                {isLoading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>

            <div className="su-login-row">
              Already have an account?
              <Link to="/login">Sign in</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}