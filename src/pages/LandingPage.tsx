import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageCircle, Handshake, ShieldCheck, Leaf, Users } from 'lucide-react';

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

const fadeIn = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes floatA {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-12px) rotate(3deg); }
  }
  @keyframes floatB {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-8px) rotate(-2deg); }
  }
  @keyframes leafSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); }
    50%       { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
  }

  .anim-1 { animation: fadeUp 0.7s ease forwards; }
  .anim-2 { animation: fadeUp 0.7s 0.12s ease both; }
  .anim-3 { animation: fadeUp 0.7s 0.24s ease both; }
  .anim-4 { animation: fadeUp 0.7s 0.36s ease both; }
  .anim-fade { animation: fadeIn 1.2s ease forwards; }

  .hover-lift {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.1);
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    background: ${G.green600};
    color: #fff;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  }
  .btn-primary:hover {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22,163,74,0.35);
  }
  .btn-primary:active { transform: translateY(0); }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 13px 28px;
    background: transparent;
    color: ${G.ink};
    border: 1.5px solid ${G.border};
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: border-color 0.18s, background 0.18s, transform 0.15s;
  }
  .btn-secondary:hover {
    border-color: ${G.green500};
    background: ${G.green50};
    transform: translateY(-2px);
  }

  .nav-link {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: ${G.muted};
    text-decoration: none;
    transition: color 0.15s;
    letter-spacing: 0.01em;
  }
  .nav-link:hover { color: ${G.charcoal}; }

  .step-card {
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 20px;
    padding: 32px 28px;
    transition: transform 0.22s, box-shadow 0.22s, border-color 0.22s;
  }
  .step-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 60px rgba(0,0,0,0.08);
    border-color: ${G.green400};
  }

  .feature-row {
    display: flex;
    gap: 20px;
    padding: 28px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid ${G.border};
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .feature-row:hover {
    border-color: ${G.green400};
    box-shadow: 0 8px 32px rgba(22,163,74,0.08);
  }

  .stat-num {
    font-family: 'Fraunces', serif;
    font-size: 42px;
    font-weight: 700;
    color: ${G.green600};
    line-height: 1;
  }

  .tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: ${G.green100};
    color: ${G.green800};
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .testimonial-card {
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 20px;
    padding: 28px;
    transition: transform 0.22s, box-shadow 0.22s;
  }
  .testimonial-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.07);
  }
`;

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: G.cream, color: G.charcoal, overflowX: 'hidden' }}>
      <style>{fadeIn}</style>

      {/* ── NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'rgba(250,249,246,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: `linear-gradient(135deg, ${G.green600}, ${G.green800})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '22px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>PassItOn</span>
          </div>

          {/* Nav links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#how" className="nav-link">How it works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#community" className="nav-link">Community</a>
          </nav>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '10px 22px', fontSize: '14px' }}>
              Sign up free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: '1120px', margin: '0 auto',
        padding: '100px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '64px',
        alignItems: 'center',
      }}>
        {/* Left */}
        <div>
          <div className="anim-1" style={{ marginBottom: '24px' }}>
            <span className="tag-pill">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: G.green600, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Now live on campus
            </span>
          </div>

          <h1 className="anim-2" style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(42px, 5vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: G.charcoal,
            marginBottom: '24px',
          }}>
            Your campus.<br />
            <em style={{ color: G.green600, fontStyle: 'italic', fontWeight: 300 }}>Their</em> old books.<br />
            Your savings.
          </h1>

          <p className="anim-3" style={{
            fontSize: '17px',
            lineHeight: 1.65,
            color: G.muted,
            marginBottom: '40px',
            maxWidth: '440px',
          }}>
            Buy and sell textbooks, calculators, and lab equipment within your verified college community. No strangers. No shipping. Just classmates.
          </p>

          <div className="anim-4" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn-primary">
              Get started free <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
            <Link to="/browse" className="btn-secondary">
              Browse listings
            </Link>
          </div>

          {/* Social proof */}
          <div className="anim-4" style={{
            marginTop: '48px', paddingTop: '32px',
            borderTop: `1px solid ${G.border}`,
            display: 'flex', gap: '40px',
          }}>
            {[['500+', 'Active listings'], ['12', 'Colleges'], ['₹0', 'Platform fee']].map(([num, label]) => (
              <div key={label}>
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '28px', fontWeight: 700,
                  color: G.charcoal, lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}>{num}</div>
                <div style={{ fontSize: '13px', color: G.muted, marginTop: '4px', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — decorative card stack */}
        <div className="anim-fade" style={{ position: 'relative', height: '480px' }}>
          {/* Background blob */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${G.green100} 0%, transparent 70%)`,
            borderRadius: '50%',
          }} />

          {/* Card 1 — back */}
          <div style={{
            position: 'absolute', top: '20px', right: '0', left: '60px',
            background: G.sand,
            border: `1px solid ${G.border}`,
            borderRadius: '20px',
            padding: '20px',
            transform: 'rotate(4deg)',
            animation: 'floatB 5s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '48px', height: '60px', borderRadius: '8px',
                background: `linear-gradient(160deg, ${G.green700}, ${G.green500})`,
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: '15px', fontWeight: 600, color: G.charcoal }}>Engineering Physics</div>
                <div style={{ fontSize: '12px', color: G.muted, marginTop: '3px' }}>H.D. Young · 14th Ed.</div>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 700, color: G.green600 }}>₹280</span>
                  <span style={{ fontSize: '11px', color: G.muted, textDecoration: 'line-through' }}>₹950</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — front */}
          <div className="hover-lift" style={{
            position: 'absolute', top: '120px', left: '0', right: '40px',
            background: '#fff',
            border: `1px solid ${G.border}`,
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.09)',
            animation: 'floatA 6s ease-in-out infinite',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 600 }}>Scientific Calculator</div>
              <span style={{
                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '4px 10px', borderRadius: '100px',
                background: G.green100, color: G.green800,
              }}>Available</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              {['#f0fdf4', G.sand, '#fef3c7'].map((bg, i) => (
                <div key={i} style={{ width: '52px', height: '52px', borderRadius: '12px', background: bg, border: `1px solid ${G.border}` }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 700, color: G.green600 }}>₹450</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: G.muted,
              }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: G.green100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: G.green700 }}>R</span>
                </div>
                Rahul M. · VJTI
              </div>
            </div>
          </div>

          {/* Chat bubble */}
          <div style={{
            position: 'absolute', bottom: '60px', right: '0',
            background: G.green600,
            color: '#fff',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 16px',
            fontSize: '13px', fontWeight: 500,
            boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
            maxWidth: '200px',
            animation: 'floatB 4s 1s ease-in-out infinite',
          }}>
            Is the Casio FX-991 still available? 👀
          </div>

          {/* Verified badge */}
          <div style={{
            position: 'absolute', bottom: '24px', left: '20px',
            background: '#fff',
            border: `1px solid ${G.border}`,
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
            fontSize: '13px', fontWeight: 600, color: G.charcoal,
          }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: G.green600 }} />
            College verified
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ backgroundColor: G.sand, padding: '96px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="tag-pill">Simple process</span>
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: 700,
              color: G.charcoal,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}>
              Three steps to done
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              {
                num: '01',
                icon: <BookOpen style={{ width: '24px', height: '24px', color: G.green600 }} />,
                title: 'List your item',
                desc: 'Snap a photo, set a price, and publish in under 2 minutes.',
                bg: G.green50,
                iconBg: G.green100,
              },
              {
                num: '02',
                icon: <MessageCircle style={{ width: '24px', height: '24px', color: '#2563eb' }} />,
                title: 'Chat directly',
                desc: 'Message verified classmates from your own college instantly.',
                bg: '#eff6ff',
                iconBg: '#dbeafe',
              },
              {
                num: '03',
                icon: <Handshake style={{ width: '24px', height: '24px', color: '#7c3aed' }} />,
                title: 'Meet on campus',
                desc: 'Exchange safely at your library, canteen, or wherever works.',
                bg: '#faf5ff',
                iconBg: '#ede9fe',
              },
            ].map((s) => (
              <div key={s.num} className="step-card" style={{ background: '#fff' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '24px',
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '12px', fontWeight: 400, color: G.muted,
                  letterSpacing: '0.1em', marginBottom: '8px',
                }}>
                  STEP {s.num}
                </div>
                <h3 style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '22px', fontWeight: 600,
                  color: G.charcoal, marginBottom: '10px',
                  letterSpacing: '-0.02em',
                }}>{s.title}</h3>
                <p style={{ fontSize: '15px', lineHeight: 1.6, color: G.muted }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '96px 24px', backgroundColor: G.cream }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

          {/* Left — text */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <span className="tag-pill">Why PassItOn</span>
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(30px, 3.5vw, 44px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: G.charcoal, lineHeight: 1.1,
              marginBottom: '48px',
            }}>
              Built for students,<br/>
              <em style={{ color: G.green600, fontWeight: 300, fontStyle: 'italic' }}>by students</em>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                {
                  icon: <ShieldCheck style={{ width: '22px', height: '22px', color: G.green600 }} />,
                  title: 'College-verified only',
                  desc: 'Only students with a verified college email can access listings. Zero strangers.',
                },
                {
                  icon: <Users style={{ width: '22px', height: '22px', color: '#2563eb' }} />,
                  title: 'Campus community',
                  desc: 'Your campus, your peers. Listings from people who sat in the same lectures.',
                },
                {
                  icon: <Leaf style={{ width: '22px', height: '22px', color: G.green600 }} />,
                  title: 'Sustainable & affordable',
                  desc: 'Save up to 70% vs. new. Reduce academic waste. Better for wallets and the planet.',
                },
              ].map((f) => (
                <div key={f.title} className="feature-row">
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: G.green50, border: `1px solid ${G.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: G.charcoal, marginBottom: '4px' }}>{f.title}</h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: G.muted }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — stats block */}
          <div style={{
            background: G.green900,
            borderRadius: '28px',
            padding: '48px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* decorative circle */}
            <div style={{
              position: 'absolute', top: '-60px', right: '-60px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: `rgba(34,197,94,0.1)`,
            }} />
            <div style={{
              position: 'absolute', bottom: '-40px', left: '-40px',
              width: '140px', height: '140px', borderRadius: '50%',
              background: `rgba(34,197,94,0.06)`,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: '32px' }}>
                <Leaf style={{ width: '32px', height: '32px', color: G.green400 }} />
              </div>

              <h3 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '26px', fontWeight: 600,
                color: '#fff', lineHeight: 1.25,
                marginBottom: '40px', letterSpacing: '-0.02em',
              }}>
                Students are already saving — a lot.
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                {[
                  ['₹1.2L+', 'Saved by students'],
                  ['500+', 'Items listed'],
                  ['70%', 'Average discount'],
                  ['< 48h', 'Avg. time to sell'],
                ].map(([val, label]) => (
                  <div key={label}>
                    <div style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: '34px', fontWeight: 700, color: G.green400,
                      lineHeight: 1, letterSpacing: '-0.03em',
                    }}>{val}</div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontWeight: 400 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', fontFamily: "'Fraunces', serif" }}>
                  "PassItOn saved me ₹4,000 in my first semester alone."
                </p>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: G.green700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 700, color: G.green300 || '#86efac',
                  }}>P</div>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>Priya S. · DBIT, Mumbai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY / TESTIMONIALS ── */}
      <section id="community" style={{ backgroundColor: G.sand, padding: '96px 24px' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ marginBottom: '16px' }}>
              <span className="tag-pill">Real students</span>
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(30px, 4vw, 44px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: G.charcoal, lineHeight: 1.1,
            }}>
              Loved by campus communities
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              {
                quote: "Sold my entire first-year textbook collection in 3 days. Couldn't believe how smooth it was.",
                name: 'Arjun K.', college: 'VJTI Mumbai', init: 'A',
                accent: G.green600,
              },
              {
                quote: "Got my Engg Drawing kit for ₹200 instead of ₹800 from the bookstore. This app is a lifesaver.",
                name: 'Sneha R.', college: 'DBIT Mumbai', init: 'S',
                accent: '#7c3aed',
              },
              {
                quote: "Love that everyone is from my campus. Feels safe and familiar, unlike other selling apps.",
                name: 'Mihir P.', college: 'Thadomal', init: 'M',
                accent: '#2563eb',
              },
            ].map((t) => (
              <div key={t.name} className="testimonial-card">
                <div style={{
                  fontSize: '32px', lineHeight: 1,
                  color: t.accent, opacity: 0.25,
                  fontFamily: 'Georgia, serif',
                  marginBottom: '12px',
                }}>"</div>
                <p style={{
                  fontSize: '15px', lineHeight: 1.65,
                  color: G.ink, marginBottom: '24px',
                  fontStyle: 'italic',
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 300,
                }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: t.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: '#fff',
                  }}>{t.init}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: G.charcoal }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: G.muted }}>{t.college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          background: `linear-gradient(135deg, ${G.green900} 0%, ${G.green700} 100%)`,
          borderRadius: '28px',
          padding: '80px 64px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '48px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative */}
          <div style={{
            position: 'absolute', top: '-80px', right: '160px',
            width: '280px', height: '280px', borderRadius: '50%',
            background: 'rgba(74,222,128,0.07)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-60px', right: '-40px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(74,222,128,0.05)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(28px, 3.5vw, 44px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: '#fff', lineHeight: 1.1,
              marginBottom: '16px',
            }}>
              Your next semester is going<br/>to cost a lot less.
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Join PassItOn and start buying smarter from day one.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '16px 32px',
              background: '#fff', color: G.green800,
              borderRadius: '100px', fontWeight: 700, fontSize: '15px',
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'; }}
            >
              Create free account <ArrowRight style={{ width: '16px', height: '16px' }} />
            </Link>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>
              No credit card · Free forever
            </span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${G.border}`,
        padding: '40px 24px',
        backgroundColor: G.cream,
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${G.green600}, ${G.green800})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf style={{ width: '14px', height: '14px', color: '#fff' }} />
            </div>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 600, color: G.charcoal }}>PassItOn</span>
          </div>

          <p style={{ fontSize: '13px', color: G.muted }}>
            © 2026 PassItOn · Campus academic resource marketplace
          </p>

          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <a key={l} href="#" className="nav-link" style={{ fontSize: '13px' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}