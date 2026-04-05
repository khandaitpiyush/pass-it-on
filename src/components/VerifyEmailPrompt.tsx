import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const API = "http://localhost:5000/api/auth"

interface Props {
  // "gate"   → full-page block (used in AddListingPage, ChatPage)
  // "banner" → slim top banner (used in ProfilePage, Dashboard)
  variant?: "gate" | "banner"
  feature?: string // e.g. "list items for sale", "contact sellers"
}

export default function VerifyEmailPrompt({ variant = "gate", feature = "list items for sale" }: Props) {
  const { user, updateUser } = useAuth()

  const [step, setStep] = useState<"idle" | "otp">("idle")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  const sendOtp = async () => {
    setError("")
    setIsLoading(true)
    try {
      await axios.post(`${API}/send-otp`, { email: user?.email })
      setStep("otp")
      setCooldown(60)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) document.getElementById(`votp-${index + 1}`)?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`votp-${index - 1}`)?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = [...otp]
    text.split("").forEach((c, i) => { next[i] = c })
    setOtp(next)
    document.getElementById(`votp-${Math.min(text.length, 5)}`)?.focus()
  }

  const verifyOtp = async () => {
    const code = otp.join("")
    if (code.length < 6) { setError("Enter the full 6-digit code"); return }
    setError("")
    setIsLoading(true)
    try {
      await axios.post(`${API}/verify-otp`, { email: user?.email, otp: code })
      updateUser({ emailVerified: true })  // update context + localStorage instantly
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired OTP")
      setOtp(["", "", "", "", "", ""])
      document.getElementById("votp-0")?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  // ── BANNER VARIANT ──
  if (variant === "banner") {
    if (dismissed || user?.emailVerified) return null
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
          .vbanner {
            font-family: 'DM Sans', sans-serif;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border-bottom: 1px solid #fcd34d;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }
          .vbanner-icon { font-size: 18px; flex-shrink: 0; }
          .vbanner-text { flex: 1; font-size: 13.5px; color: #78350f; }
          .vbanner-text strong { font-weight: 600; }
          .vbanner-btn {
            background: #92400e;
            color: #fff;
            border: none;
            border-radius: 7px;
            padding: 6px 14px;
            font-size: 12.5px;
            font-weight: 600;
            font-family: 'DM Sans', sans-serif;
            cursor: pointer;
            transition: background 0.2s;
            white-space: nowrap;
          }
          .vbanner-btn:hover { background: #78350f; }
          .vbanner-close {
            background: none;
            border: none;
            cursor: pointer;
            color: #b45309;
            padding: 4px;
            display: flex;
            align-items: center;
            transition: color 0.2s;
          }
          .vbanner-close:hover { color: #78350f; }
          .vbanner-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 1000;
            display: grid;
            place-items: center;
            padding: 20px;
            animation: fadeIn 0.2s ease;
          }
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        `}</style>

        {/* Banner */}
        {!step || step === "idle" ? (
          <div className="vbanner">
            <span className="vbanner-icon">⚠️</span>
            <span className="vbanner-text">
              <strong>Verify your email</strong> to unlock selling and contacting sellers.
            </span>
            <button className="vbanner-btn" onClick={sendOtp} disabled={isLoading}>
              {isLoading ? "Sending…" : "Verify now"}
            </button>
            <button className="vbanner-close" onClick={() => setDismissed(true)} aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : null}

        {/* OTP Modal (shared between variants) */}
        {step === "otp" && (
          <OtpModal
            email={user?.email || ""}
            otp={otp}
            error={error}
            success={success}
            isLoading={isLoading}
            cooldown={cooldown}
            onOtpChange={handleOtpChange}
            onOtpKeyDown={handleOtpKeyDown}
            onOtpPaste={handleOtpPaste}
            onVerify={verifyOtp}
            onResend={sendOtp}
            onClose={() => setStep("idle")}
          />
        )}
      </>
    )
  }

  // ── GATE VARIANT ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .vgate-wrap {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          font-family: 'DM Sans', sans-serif;
        }
        .vgate-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 20px;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 40px rgba(0,0,0,0.06);
        }
        .vgate-icon {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 20px;
          display: grid;
          place-items: center;
          margin: 0 auto 24px;
          font-size: 32px;
        }
        .vgate-title {
          font-family: 'DM Serif Display', serif;
          font-size: 26px;
          color: #111;
          margin-bottom: 10px;
        }
        .vgate-sub {
          font-size: 14px;
          color: #888;
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .vgate-email {
          display: inline-block;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          font-size: 13px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 28px;
        }
        .vgate-perks {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          text-align: left;
          background: #fafafa;
          border-radius: 12px;
          padding: 16px 20px;
        }
        .vgate-perk {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: #444;
        }
        .vgate-perk-dot {
          width: 22px; height: 22px;
          background: #dcfce7;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          font-size: 11px;
        }
        .vgate-btn {
          width: 100%;
          padding: 13px;
          background: #1a3a2a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .vgate-btn:hover:not(:disabled) { background: #243f30; }
        .vgate-btn:active:not(:disabled) { transform: scale(0.99); }
        .vgate-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .vgate-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .vgate-success-icon {
          width: 64px; height: 64px;
          background: #dcfce7;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 28px;
        }
        .vgate-success-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px;
          color: #111;
        }
        .vgate-success-sub { font-size: 14px; color: #888; }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .verr {
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #b91c1c;
          margin-bottom: 14px;
          text-align: left;
        }
      `}</style>

      <div className="vgate-wrap">
        <div className="vgate-card">

          {success ? (
            <div className="vgate-success">
              <div className="vgate-success-icon">✅</div>
              <div className="vgate-success-title">You're verified!</div>
              <div className="vgate-success-sub">You can now {feature}. Refreshing…</div>
            </div>
          ) : step === "idle" ? (
            <>
              <div className="vgate-icon">🔐</div>
              <h2 className="vgate-title">Verify to {feature}</h2>
              <p className="vgate-sub">
                Verified members keep PassItOn trustworthy. It only takes 30 seconds.
              </p>
              <span className="vgate-email">{user?.email}</span>

              <div className="vgate-perks">
                <div className="vgate-perk">
                  <span className="vgate-perk-dot">📦</span>
                  List items for sale
                </div>
                <div className="vgate-perk">
                  <span className="vgate-perk-dot">💬</span>
                  Contact sellers directly
                </div>
                <div className="vgate-perk">
                  <span className="vgate-perk-dot">✓</span>
                  Get a verified badge on your profile
                </div>
              </div>

              {error && <div className="verr">{error}</div>}

              <button className="vgate-btn" onClick={sendOtp} disabled={isLoading}>
                {isLoading && <span className="spinner" />}
                {isLoading ? "Sending OTP…" : "Send verification code →"}
              </button>
            </>
          ) : (
            <>
              <div className="vgate-icon">📬</div>
              <h2 className="vgate-title">Enter the code</h2>
              <p className="vgate-sub" style={{ marginBottom: "20px" }}>
                Sent to <strong style={{ color: "#333" }}>{user?.email}</strong>
              </p>

              {error && <div className="verr">{error}</div>}

              <OtpInputRow
                otp={otp}
                prefix="votp"
                onChange={handleOtpChange}
                onKeyDown={handleOtpKeyDown}
                onPaste={handleOtpPaste}
              />

              <div style={{ fontSize: "13px", color: "#888", marginBottom: "20px" }}>
                Didn't get it?{" "}
                <button
                  onClick={sendOtp}
                  disabled={cooldown > 0 || isLoading}
                  style={{
                    background: "none", border: "none", padding: 0,
                    fontFamily: "inherit", fontSize: "13px", fontWeight: 600,
                    cursor: cooldown > 0 ? "default" : "pointer",
                    color: cooldown > 0 ? "#bbb" : "#1a3a2a"
                  }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
                </button>
              </div>

              <button
                className="vgate-btn"
                onClick={verifyOtp}
                disabled={isLoading || otp.join("").length < 6}
              >
                {isLoading && <span className="spinner" />}
                {isLoading ? "Verifying…" : "Verify email →"}
              </button>

              <button
                onClick={() => { setStep("idle"); setError("") }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "13px", color: "#aaa",
                  marginTop: "14px", display: "flex", alignItems: "center",
                  gap: "6px", margin: "14px auto 0"
                }}
              >
                ← Back
              </button>
            </>
          )}

        </div>
      </div>
    </>
  )
}

/* ── SHARED OTP INPUT ROW ── */
function OtpInputRow({
  otp, prefix, onChange, onKeyDown, onPaste
}: {
  otp: string[]
  prefix: string
  onChange: (i: number, v: string) => void
  onKeyDown: (i: number, e: React.KeyboardEvent) => void
  onPaste: (e: React.ClipboardEvent) => void
}) {
  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }} onPaste={onPaste}>
      {otp.map((digit, i) => (
        <input
          key={i}
          id={`${prefix}-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoFocus={i === 0}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          style={{
            width: "46px", height: "54px",
            border: `1.5px solid ${digit ? "#1a3a2a" : "#e5e5e5"}`,
            borderRadius: "10px",
            fontSize: "20px",
            fontWeight: 600,
            textAlign: "center",
            color: "#111",
            fontFamily: "inherit",
            outline: "none",
            background: digit ? "rgba(26,58,42,0.04)" : "#fff",
            transition: "border-color 0.2s, box-shadow 0.2s",
            cursor: "text",
          }}
          onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(26,58,42,0.1)")}
          onBlur={e => (e.target.style.boxShadow = "none")}
        />
      ))}
    </div>
  )
}

/* ── OTP MODAL (used by banner variant) ── */
function OtpModal({
  email, otp, error, success, isLoading, cooldown,
  onOtpChange, onOtpKeyDown, onOtpPaste, onVerify, onResend, onClose
}: any) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)", zIndex: 1000,
        display: "grid", placeItems: "center", padding: "20px",
        animation: "fadeIn 0.2s ease",
        fontFamily: "'DM Sans', sans-serif"
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "40px",
        maxWidth: "400px", width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
      }}>
        {success ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "48px" }}>✅</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#111" }}>Verified!</div>
            <div style={{ fontSize: "14px", color: "#888" }}>You now have full access.</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "36px", marginBottom: "16px" }}>📬</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "22px", color: "#111", marginBottom: "8px" }}>
              Check your inbox
            </div>
            <div style={{ fontSize: "13.5px", color: "#888", marginBottom: "4px" }}>
              Code sent to <strong style={{ color: "#333" }}>{email}</strong>
            </div>

            {error && (
              <div style={{
                background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "8px",
                padding: "10px 14px", fontSize: "13px", color: "#b91c1c",
                margin: "16px 0 0", textAlign: "left"
              }}>{error}</div>
            )}

            <OtpInputRow
              otp={otp} prefix="motp"
              onChange={onOtpChange} onKeyDown={onOtpKeyDown} onPaste={onOtpPaste}
            />

            <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
              Didn't get it?{" "}
              <button onClick={onResend} disabled={cooldown > 0}
                style={{
                  background: "none", border: "none", fontFamily: "inherit",
                  fontSize: "13px", fontWeight: 600, cursor: cooldown > 0 ? "default" : "pointer",
                  color: cooldown > 0 ? "#bbb" : "#1a3a2a", padding: 0
                }}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend"}
              </button>
            </div>

            <button
              onClick={onVerify}
              disabled={isLoading || otp.join("").length < 6}
              style={{
                width: "100%", padding: "12px", background: "#1a3a2a", color: "#fff",
                fontFamily: "inherit", fontSize: "14px", fontWeight: 600,
                border: "none", borderRadius: "10px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                opacity: isLoading || otp.join("").length < 6 ? 0.65 : 1
              }}
            >
              {isLoading && (
                <span style={{
                  width: "15px", height: "15px",
                  border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block"
                }} />
              )}
              {isLoading ? "Verifying…" : "Verify →"}
            </button>

            <button onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: "13px", color: "#aaa",
                marginTop: "12px"
              }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}