import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { GoogleLogin } from "@react-oauth/google"
import axios from "axios"

import API from '../config';

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  /* ---------- EMAIL LOGIN ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
    setIsLoading(true)
    try {
      // Assuming your login context returns the backend response
      const res = await login(email, password)
      
      // If the backend indicates campus selection is needed, or campusId is missing
      if (res?.needsCampusSelection || (res?.user && !res?.user?.campusId)) {
        navigate("/select-campus")
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------- GOOGLE LOGIN ---------- */
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError("")
    try {
      const res = await axios.post(`${API}/google-login`, {
        token: credentialResponse.credential,
      })
      
      // Extract the new flag from our updated backend
      const { user, token, needsCampusSelection } = res.data
      
      // Update global auth state
      loginWithGoogle(user, token)

      // Conditional routing based on the backend's instruction
      if (needsCampusSelection) {
        navigate("/select-campus")
      } else {
        navigate("/dashboard")
      }
      
    } catch (err: any) {
      console.error("Google Login Error:", err)
      setError(err?.response?.data?.message || "Google login failed. Please try again.")
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
        }

        .login-left {
          position: relative;
          background: #1a3a2a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
        }

        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(74,180,100,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(34,90,55,0.4) 0%, transparent 60%);
        }

        .left-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
        }
        .blob-1 { width: 400px; height: 400px; background: #4ab464; top: -100px; right: -100px; }
        .blob-2 { width: 300px; height: 300px; background: #86efac; bottom: 50px; left: -80px; }

        .left-brand {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 20px;
        }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 22px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .left-content { position: relative; z-index: 1; }

        .left-tag {
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

        .left-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(32px, 4vw, 48px);
          color: #fff;
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .left-heading em { font-style: italic; color: #86efac; }

        .left-sub {
          font-size: 15px;
          color: rgba(255,255,255,0.55);
          line-height: 1.7;
          max-width: 340px;
          margin-bottom: 40px;
        }

        .left-stats { display: flex; gap: 32px; }

        .stat { display: flex; flex-direction: column; gap: 2px; }

        .stat-number { font-size: 24px; font-weight: 600; color: #fff; }

        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); letter-spacing: 0.5px; }

        .left-footer {
          position: relative;
          z-index: 1;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
        }

        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .login-right.mounted { opacity: 1; transform: translateY(0); }

        .login-card { width: 100%; max-width: 400px; }

        .card-header { margin-bottom: 36px; }

        .card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #111;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
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

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          font-size: 13px;
          color: #b91c1c;
          animation: shake 0.35s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .field-group { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }

        .field { display: flex; flex-direction: column; gap: 6px; }

        .field-label { font-size: 13px; font-weight: 500; color: #444; }

        .field-wrap { position: relative; }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #aaa;
          display: flex;
          align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }

        .field-wrap.focused .field-icon { color: #1a3a2a; }

        .field-input {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #e5e5e5;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #111;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }

        .field-input:focus {
          border-color: #1a3a2a;
          box-shadow: 0 0 0 3px rgba(26,58,42,0.08);
        }

        .field-input::placeholder { color: #ccc; }

        .toggle-pw {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .toggle-pw:hover { color: #555; }

        .field-row { display: flex; justify-content: flex-end; }

        .forgot-link { font-size: 12px; color: #888; text-decoration: none; transition: color 0.2s; }
        .forgot-link:hover { color: #1a3a2a; }

        .btn-submit {
          width: 100%;
          padding: 13px;
          background: #1a3a2a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-bottom: 20px;
        }

        .btn-submit:hover:not(:disabled) { background: #243f30; }
        .btn-submit:active:not(:disabled) { transform: scale(0.99); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }

        .divider-line { flex: 1; height: 1px; background: #e8e8e8; }

        .divider-text { font-size: 12px; color: #bbb; font-weight: 500; letter-spacing: 0.5px; }

        .google-wrap { display: flex; justify-content: center; margin-bottom: 28px; }

        .signup-row { text-align: center; font-size: 13px; color: #888; }

        .signup-row a { color: #1a3a2a; font-weight: 600; text-decoration: none; margin-left: 4px; }
        .signup-row a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">

        {/* LEFT PANEL */}
        <div className="login-left">
          <div className="left-blob blob-1" />
          <div className="left-blob blob-2" />
          <div className="left-brand">
            <div className="brand-icon">🌿</div>
            <span className="brand-name">PassItOn</span>
          </div>
          <div className="left-content">
            <div className="left-tag">College Marketplace</div>
            <h1 className="left-heading">Give things a<br /><em>second life</em></h1>
            <p className="left-sub">
              Buy, sell, and exchange within your college community. Sustainable, affordable, and local.
            </p>
            <div className="left-stats">
              <div className="stat"><span className="stat-number">2.4k+</span><span className="stat-label">Students</span></div>
              <div className="stat"><span className="stat-number">8k+</span><span className="stat-label">Items listed</span></div>
              <div className="stat"><span className="stat-number">50+</span><span className="stat-label">Colleges</span></div>
            </div>
          </div>
          <div className="left-footer">© 2026 PassItOn · All rights reserved</div>
        </div>

        {/* RIGHT PANEL */}
        <div className={`login-right${mounted ? " mounted" : ""}`}>
          <div className="login-card">

            <div className="card-header">
              <h2 className="card-title">Welcome back</h2>
              <p className="card-sub">No account? <Link to="/signup">Create one for free</Link></p>
            </div>

            {error && (
              <div className="error-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="google-wrap">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google login failed. Please try again.")}
                useOneTap={false}
                type="standard"
                theme="outline"
                size="large"
                width="368"
              />
            </div>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or continue with email</span>
              <div className="divider-line" />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-group">

                <div className="field">
                  <label className="field-label">Email address</label>
                  <div className={`field-wrap${focused === "email" ? " focused" : ""}`}>
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                    </span>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="you@college.edu"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="field">
                  <div className="field-row">
                    <label className="field-label" style={{ flex: 1 }}>Password</label>
                    <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                  </div>
                  <div className={`field-wrap${focused === "password" ? " focused" : ""}`}>
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </span>
                    <input
                      className="field-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      autoComplete="current-password"
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      className="toggle-pw"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              <button type="submit" className="btn-submit" disabled={isLoading}>
                <span className="btn-inner">
                  {isLoading && <span className="spinner" />}
                  {isLoading ? "Signing in…" : "Sign in"}
                </span>
              </button>
            </form>

            <div className="signup-row">
              Don't have an account?
              <Link to="/signup">Sign up</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}