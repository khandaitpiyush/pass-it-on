import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ShieldCheck, ShieldAlert, Package, MessageCircle,
  User, Store, ArrowRight, Leaf, TrendingUp, Plus,
  AlertCircle, ChevronRight,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const G = {
  green900: '#0a2e14',
  green800: '#0f4a1f',
  green700: '#155f28',
  green600: '#16a34a',
  green500: '#22c55e',
  green400: '#4ade80',
  green200: '#bbf7d0',
  green100: '#dcfce7',
  green50:  '#f0fdf4',
  cream:    '#faf9f6',
  sand:     '#f5f0e8',
  charcoal: '#1a1a1a',
  ink:      '#2d2d2d',
  muted:    '#6b6b6b',
  border:   '#e8e3d8',
  white:    '#ffffff',
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-5px); }
  }

  .dash-body { font-family: 'DM Sans', sans-serif; background: ${G.cream}; min-height: 100vh; }

  .a1 { animation: fadeUp 0.55s 0.05s ease both; }
  .a2 { animation: fadeUp 0.55s 0.12s ease both; }
  .a3 { animation: fadeUp 0.55s 0.19s ease both; }
  .a4 { animation: fadeUp 0.55s 0.26s ease both; }
  .a5 { animation: fadeUp 0.55s 0.33s ease both; }
  .a6 { animation: fadeUp 0.55s 0.40s ease both; }

  .quick-card {
    background: ${G.white};
    border: 1px solid ${G.border};
    border-radius: 18px;
    padding: 24px;
    text-decoration: none;
    display: block;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .quick-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.08);
    border-color: ${G.green400};
  }

  .listing-card {
    display: block;
    text-decoration: none;
    border-radius: 16px;
    overflow: hidden;
    background: ${G.white};
    border: 1px solid ${G.border};
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .listing-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 48px rgba(0,0,0,0.09);
  }
  .listing-card:hover .listing-img {
    transform: scale(1.05);
  }
  .listing-img {
    transition: transform 0.35s ease;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .shimmer-box {
    background: linear-gradient(90deg, ${G.sand} 25%, #ede8df 50%, ${G.sand} 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 12px;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: ${G.green600};
    color: #fff;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: background 0.17s, transform 0.15s, box-shadow 0.17s;
  }
  .btn-primary:hover:not(:disabled) {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22,163,74,0.3);
  }
  .btn-primary:disabled {
    background: #d1d5db;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: ${G.green100};
    color: ${G.green800};
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
`;

interface Listing {
  _id: string;
  title: string;
  price: number;
  condition: string;
  image?: string;
  category?: string;
  seller: { name: string; studentVerified: boolean };
}

const conditionColor: Record<string, { bg: string; color: string }> = {
  'Like New': { bg: '#dcfce7', color: '#166534' },
  'Good':     { bg: '#dbeafe', color: '#1e40af' },
  'Fair':     { bg: '#fef3c7', color: '#92400e' },
  'Poor':     { bg: '#fee2e2', color: '#991b1b' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentListings(res.data.slice(0, 3));
      } catch {
        setError('Could not load listings.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (!user) return null;

  const firstName = user.name?.split(' ')[0] || user.name;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dash-body">
      <style>{styles}</style>

      {/* ── TOP NAV ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(250,249,246,0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          padding: '0 24px', height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: `linear-gradient(135deg, ${G.green600}, ${G.green800})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf style={{ width: '15px', height: '15px', color: '#fff' }} />
            </div>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '19px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>PassItOn</span>
          </Link>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: '4px' }}>
            {[
              { to: '/browse', label: 'Browse' },
              { to: '/my-listings', label: 'My Listings' },
              { to: '/chat', label: 'Chats' },
            ].map(n => (
              <Link key={n.to} to={n.to} style={{
                padding: '7px 14px', borderRadius: '100px',
                fontSize: '14px', fontWeight: 500,
                color: G.muted, textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = G.sand; (e.currentTarget as HTMLElement).style.color = G.charcoal; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = G.muted; }}
              >{n.label}</Link>
            ))}
          </nav>

          {/* Right: avatar + list btn */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user.studentVerified ? (
              <Link to="/add-listing" className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> List Item
              </Link>
            ) : (
              <button className="btn-primary" disabled style={{ padding: '9px 18px', fontSize: '13px' }}>
                <Plus style={{ width: '14px', height: '14px' }} /> List Item
              </button>
            )}
            <Link to="/profile" style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${G.green600}, ${G.green800})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: '#fff',
              textDecoration: 'none', flexShrink: 0,
            }}>
              {firstName.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      {/* ── VERIFICATION BANNER ── */}
      {!user.studentVerified && (
        <div style={{
          background: 'linear-gradient(90deg, #fffbeb, #fef3c7)',
          borderBottom: `1px solid #fde68a`,
          padding: '0',
        }}>
          <div style={{
            maxWidth: '1120px', margin: '0 auto',
            padding: '14px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#fef3c7', border: '1px solid #fde68a',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <AlertCircle style={{ width: '16px', height: '16px', color: '#d97706' }} />
              </div>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#92400e' }}>
                  Verify your college email to start selling
                </span>
                <span style={{ fontSize: '14px', color: '#a16207', marginLeft: '8px' }}>
                  You can browse and buy — but can't list until verified.
                </span>
              </div>
            </div>
            <Link to="/profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '100px',
              background: '#d97706', color: '#fff',
              fontSize: '13px', fontWeight: 600, textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s',
            }}>
              Verify now <ChevronRight style={{ width: '14px', height: '14px' }} />
            </Link>
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* ── HERO WELCOME ── */}
        <div className="a1" style={{
          background: `linear-gradient(135deg, ${G.green900} 0%, ${G.green700} 100%)`,
          borderRadius: '24px',
          padding: '40px 48px',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '32px',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative blobs */}
          <div style={{
            position: 'absolute', top: '-60px', right: '200px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(74,222,128,0.08)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', right: '80px',
            width: '140px', height: '140px', borderRadius: '50%',
            background: 'rgba(74,222,128,0.05)', pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: '8px', textTransform: 'uppercase' }}>
              {greeting}
            </p>
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(26px, 3vw, 38px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: '#fff', lineHeight: 1.1, marginBottom: '12px',
            }}>
              {firstName},
              <em style={{ fontWeight: 300, fontStyle: 'italic', color: G.green400 }}> welcome back.</em>
            </h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
              {user.studentVerified
                ? 'Your campus marketplace is waiting. See what\'s new today.'
                : 'Verify your college email to unlock selling and join the full community.'}
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            {user.studentVerified ? (
              <>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', borderRadius: '100px',
                  background: 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.3)',
                  fontSize: '13px', fontWeight: 600, color: G.green400,
                }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: G.green400, animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
                  <ShieldCheck style={{ width: '14px', height: '14px' }} /> Verified Student
                </span>
                <Link to="/add-listing" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 24px', borderRadius: '100px',
                  background: '#fff', color: G.green800,
                  fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <Plus style={{ width: '15px', height: '15px' }} /> List an item
                </Link>
              </>
            ) : (
              <Link to="/profile" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '13px 24px', borderRadius: '100px',
                background: '#fff', color: '#92400e',
                fontSize: '14px', fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}>
                <ShieldAlert style={{ width: '15px', height: '15px' }} /> Verify college email
              </Link>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="a2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
          {[
            {
              to: '/browse',
              icon: <Store style={{ width: '22px', height: '22px', color: G.green600 }} />,
              iconBg: G.green100,
              label: 'Browse Items',
              sub: 'Find resources',
              accent: G.green600,
            },
            {
              to: '/my-listings',
              icon: <Package style={{ width: '22px', height: '22px', color: '#2563eb' }} />,
              iconBg: '#dbeafe',
              label: 'My Listings',
              sub: 'Manage items',
              accent: '#2563eb',
            },
            {
              to: '/chat',
              icon: <MessageCircle style={{ width: '22px', height: '22px', color: '#7c3aed' }} />,
              iconBg: '#ede9fe',
              label: 'Chats',
              sub: 'Your messages',
              accent: '#7c3aed',
            },
            {
              to: '/profile',
              icon: <User style={{ width: '22px', height: '22px', color: '#d97706' }} />,
              iconBg: '#fef3c7',
              label: 'Profile',
              sub: 'Your account',
              accent: '#d97706',
            },
          ].map((c) => (
            <Link key={c.to} to={c.to} className="quick-card">
              <div style={{
                width: '46px', height: '46px', borderRadius: '13px',
                background: c.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                {c.icon}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: G.charcoal, marginBottom: '3px' }}>{c.label}</div>
              <div style={{ fontSize: '13px', color: G.muted }}>{c.sub}</div>
            </Link>
          ))}
        </div>

        {/* ── RECENT LISTINGS ── */}
        <div className="a3" style={{
          background: G.white,
          border: `1px solid ${G.border}`,
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '20px',
        }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '28px',
          }}>
            <div>
              <h2 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '22px', fontWeight: 700,
                color: G.charcoal, letterSpacing: '-0.02em',
                margin: 0,
              }}>
                Recent from your campus
              </h2>
              <p style={{ fontSize: '13px', color: G.muted, marginTop: '4px' }}>
                Latest items listed by verified students
              </p>
            </div>
            <Link to="/browse" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '100px',
              border: `1px solid ${G.border}`,
              fontSize: '13px', fontWeight: 600, color: G.green700,
              textDecoration: 'none', background: G.green50,
              transition: 'background 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = G.green100; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = G.green50; }}
            >
              View all <ArrowRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <div className="shimmer-box" style={{ aspectRatio: '1', marginBottom: '12px', borderRadius: '14px' }} />
                  <div className="shimmer-box" style={{ height: '16px', marginBottom: '8px' }} />
                  <div className="shimmer-box" style={{ height: '14px', width: '60%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '16px', borderRadius: '12px',
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#b91c1c', fontSize: '14px',
            }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && recentListings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: G.sand, margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'float 3s ease-in-out infinite',
              }}>
                <Package style={{ width: '28px', height: '28px', color: '#c4b99a' }} />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: G.charcoal, marginBottom: '6px' }}>
                No listings yet
              </p>
              <p style={{ fontSize: '14px', color: G.muted, marginBottom: '20px' }}>
                Be the first to list something on your campus
              </p>
              {user.studentVerified && (
                <Link to="/add-listing" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '11px 22px', borderRadius: '100px',
                  background: G.green600, color: '#fff',
                  fontSize: '14px', fontWeight: 600, textDecoration: 'none',
                }}>
                  <Plus style={{ width: '15px', height: '15px' }} /> List first item
                </Link>
              )}
            </div>
          )}

          {/* Listings grid */}
          {!isLoading && !error && recentListings.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {recentListings.map((listing) => {
                const cond = conditionColor[listing.condition] || { bg: G.sand, color: G.muted };
                return (
                  <Link key={listing._id} to={`/item/${listing._id}`} className="listing-card">
                    {/* Image */}
                    <div style={{ aspectRatio: '1', overflow: 'hidden', background: G.sand, position: 'relative' }}>
                      {listing.image ? (
                        <img src={listing.image} alt={listing.title} className="listing-img" />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Package style={{ width: '36px', height: '36px', color: '#c4b99a' }} />
                        </div>
                      )}
                      {/* Condition badge */}
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        padding: '4px 10px', borderRadius: '100px',
                        background: cond.bg, color: cond.color,
                        fontSize: '11px', fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}>
                        {listing.condition}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '15px', fontWeight: 600, color: G.charcoal,
                        marginBottom: '8px', lineHeight: 1.3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {listing.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{
                          fontFamily: "'Fraunces', serif",
                          fontSize: '20px', fontWeight: 700,
                          color: G.green700, letterSpacing: '-0.02em',
                        }}>
                          ₹{listing.price}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ fontSize: '12px', color: G.muted }}>{listing.seller.name}</span>
                          {listing.seller.studentVerified && (
                            <ShieldCheck style={{ width: '13px', height: '13px', color: G.green600 }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── BOTTOM ROW: Stats + Safety ── */}
        <div className="a4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Activity summary */}
          <div style={{
            background: G.white, border: `1px solid ${G.border}`,
            borderRadius: '20px', padding: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: G.green100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp style={{ width: '18px', height: '18px', color: G.green600 }} />
              </div>
              <h3 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '17px', fontWeight: 600,
                color: G.charcoal, margin: 0,
              }}>Your Activity</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Account type', value: user.studentVerified ? 'Seller' : 'Buyer', color: G.green600 },
                { label: 'Status', value: user.studentVerified ? 'Verified' : 'Unverified', color: user.studentVerified ? G.green600 : '#d97706' },
                { label: 'Email', value: user.email?.split('@')[1] || '—', color: G.charcoal },
                { label: 'Member since', value: 'Today', color: G.charcoal },
              ].map(s => (
                <div key={s.label} style={{
                  background: G.cream, borderRadius: '12px', padding: '14px',
                  border: `1px solid ${G.border}`,
                }}>
                  <div style={{ fontSize: '11px', color: G.muted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety card */}
          <div style={{
            background: `linear-gradient(145deg, ${G.green900}, ${G.green800})`,
            borderRadius: '20px', padding: '28px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{
              position: 'absolute', top: '-40px', right: '-40px',
              width: '140px', height: '140px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.07)',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '11px',
                background: 'rgba(74,222,128,0.15)',
                border: '1px solid rgba(74,222,128,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <ShieldCheck style={{ width: '20px', height: '20px', color: G.green400 }} />
              </div>

              <h3 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '17px', fontWeight: 600,
                color: '#fff', marginBottom: '10px',
              }}>
                Campus Safety Reminder
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '20px' }}>
                Always meet in public campus locations — library, canteen, or common areas during daytime hours.
              </p>
            </div>

            <Link to="/browse" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '100px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff', fontSize: '13px', fontWeight: 600,
              textDecoration: 'none', alignSelf: 'flex-start',
              transition: 'background 0.15s',
              position: 'relative', zIndex: 1,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
            >
              Browse safely <ArrowRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}