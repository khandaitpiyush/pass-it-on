import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Calendar,
  Tag,
  Package,
  Trash2,
  Leaf,
  Clock,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

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

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position: 700px 0; }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes imageReveal {
    from { opacity: 0; transform: scale(1.04); }
    to   { opacity: 1; transform: scale(1); }
  }

  .page-enter { animation: fadeUp 0.5s ease both; }
  .page-enter-2 { animation: fadeUp 0.5s 0.08s ease both; }
  .page-enter-3 { animation: fadeUp 0.5s 0.16s ease both; }

  .skeleton-pulse {
    background: linear-gradient(90deg, #f0ece4 25%, #e8e3d8 50%, #f0ece4 75%);
    background-size: 700px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 10px;
  }

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

  .meta-badge {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    font-family: 'DM Sans', sans-serif;
  }

  .tag-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: ${G.green100};
    color: ${G.green800};
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .chat-btn {
    width: 100%;
    padding: 16px;
    background: ${G.green600};
    color: #fff;
    border: none;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    transition: background 0.18s, transform 0.14s, box-shadow 0.18s;
    letter-spacing: 0.01em;
  }
  .chat-btn:hover {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(22,163,74,0.32);
  }
  .chat-btn:active { transform: translateY(0); }

  .delete-btn {
    width: 100%;
    padding: 14px;
    background: transparent;
    color: #dc2626;
    border: 1.5px solid #fca5a5;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.16s, border-color 0.16s, transform 0.12s;
  }
  .delete-btn:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #f87171;
    transform: translateY(-1px);
  }
  .delete-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 13px 0;
    border-bottom: 1px solid ${G.border};
    font-family: 'DM Sans', sans-serif;
  }
  .detail-row:last-child { border-bottom: none; padding-bottom: 0; }

  .image-panel {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    background: ${G.sand};
    border: 1px solid ${G.border};
    aspect-ratio: 1 / 1;
  }
  .image-panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    animation: imageReveal 0.6s ease both;
  }

  .confirm-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(10,46,20,0.35);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    animation: fadeUp 0.2s ease;
  }
  .confirm-modal {
    background: #fff;
    border-radius: 24px;
    padding: 40px 36px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 40px 100px rgba(0,0,0,0.18);
  }
`;

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category?: string;
  semester?: string;
  image?: string;
  createdAt: string;
  seller: {
    _id: string;
    name: string;
    studentVerified: boolean;
    branch?: string;
    year?: string;
  };
}

function conditionStyle(c: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    'Like New': { bg: G.green100, color: G.green800 },
    'Good':     { bg: '#dbeafe', color: '#1e40af' },
    'Fair':     { bg: '#fef3c7', color: '#92400e' },
    'Worn':     { bg: '#fee2e2', color: '#991b1b' },
  };
  return map[c] ?? { bg: G.sand, color: G.muted };
}

function ConfirmModal({
  title, onConfirm, onCancel, loading,
}: {
  title: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: '#fef2f2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '20px',
        }}>
          <Trash2 style={{ width: '24px', height: '24px', color: '#dc2626' }} />
        </div>
        <h3 style={{
          fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 700,
          color: G.charcoal, marginBottom: '10px', letterSpacing: '-0.02em',
        }}>Delete listing?</h3>
        <p style={{
          fontSize: '14px', color: G.muted, lineHeight: 1.65,
          marginBottom: '32px', fontFamily: "'DM Sans', sans-serif",
        }}>
          <em style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: G.ink }}>
            "{title}"
          </em>{' '}
          will be permanently removed from the marketplace.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px',
            border: `1.5px solid ${G.border}`, borderRadius: '100px',
            background: 'transparent', fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', fontWeight: 600, color: G.ink, cursor: 'pointer',
          }}>Keep it</button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: '100px',
            background: '#dc2626', fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', fontWeight: 600, color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.35)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite',
                }} />
                Deleting…
              </>
            ) : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListing(res.data);
      } catch (err: any) {
        if (err?.response?.status === 404) setNotFound(true);
        else setError('Failed to load listing.');
      } finally {
        setIsLoading(false);
      }
    };
    if (itemId) fetchListing();
  }, [itemId]);

  if (!user) return null;

  /* ── LOADING ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{pageStyles}</style>
        <header style={{
          backgroundColor: 'rgba(250,249,246,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${G.border}`, padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{ maxWidth: '1120px', margin: '0 auto', width: '100%' }}>
            <Link to="/browse" className="nav-link">
              <ArrowLeft style={{ width: '18px', height: '18px' }} /> Back to Browse
            </Link>
          </div>
        </header>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            <div className="skeleton-pulse" style={{ aspectRatio: '1 / 1', borderRadius: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '8px' }}>
              <div className="skeleton-pulse" style={{ height: '36px', width: '70%' }} />
              <div className="skeleton-pulse" style={{ height: '44px', width: '35%' }} />
              <div className="skeleton-pulse" style={{ height: '80px' }} />
              <div className="skeleton-pulse" style={{ height: '22px', width: '55%' }} />
              <div className="skeleton-pulse" style={{ height: '52px', borderRadius: '100px', marginTop: '16px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── NOT FOUND ── */
  if (notFound || !listing) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: G.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{pageStyles}</style>
        <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '22px',
            background: G.sand, border: `1px solid ${G.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Package style={{ width: '36px', height: '36px', color: G.muted, opacity: 0.5 }} />
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: '28px', fontWeight: 700,
            color: G.charcoal, letterSpacing: '-0.02em', marginBottom: '10px',
          }}>Item not found</h2>
          <p style={{ fontSize: '15px', color: G.muted, marginBottom: '28px' }}>
            This listing may have been removed by the seller.
          </p>
          <Link to="/browse" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', background: G.green600, color: '#fff',
            borderRadius: '100px', fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px', fontWeight: 600, textDecoration: 'none',
          }}>
            Browse listings
          </Link>
        </div>
      </div>
    );
  }

  /* ── ERROR ── */
  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: G.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{pageStyles}</style>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '15px', color: G.muted, marginBottom: '16px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600,
            color: G.green600, background: 'none', border: 'none',
            cursor: 'pointer', textDecoration: 'underline',
          }}>Try again</button>
        </div>
      </div>
    );
  }

  const isOwnListing = listing.seller._id === user._id;
  const cs = conditionStyle(listing.condition);
  const sellerInitial = listing.seller.name.charAt(0).toUpperCase();

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/listings/${listing._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/my-listings');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete listing.');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{pageStyles}</style>

      {showConfirm && (
        <ConfirmModal
          title={listing.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={isDeleting}
        />
      )}

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(250,249,246,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link to="/browse" className="nav-link">
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
            Back to Browse
          </Link>

          {/* Breadcrumb chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '100px',
            background: G.sand, border: `1px solid ${G.border}`,
          }}>
            <Leaf style={{ width: '12px', height: '12px', color: G.green600 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: G.muted, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em' }}>
              PassItOn Marketplace
            </span>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '56px', alignItems: 'start' }}>

          {/* ── LEFT: IMAGE + SAFETY ── */}
          <div className="page-enter">

            {/* Image */}
            <div className="image-panel" style={{ marginBottom: '20px' }}>
              {listing.image ? (
                <img src={listing.image} alt={listing.title} />
              ) : (
                <div style={{
                  width: '100%', aspectRatio: '1 / 1',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: '12px',
                }}>
                  <Package style={{ width: '48px', height: '48px', color: G.muted, opacity: 0.35 }} />
                  <span style={{ fontSize: '13px', color: G.muted, fontWeight: 500 }}>No photo</span>
                </div>
              )}

              {/* Condition overlay badge */}
              <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <span className="meta-badge" style={{ background: cs.bg, color: cs.color }}>
                  {listing.condition}
                </span>
              </div>

              {/* Price overlay */}
              <div style={{
                position: 'absolute', bottom: '16px', right: '16px',
                background: 'rgba(10,46,20,0.82)',
                backdropFilter: 'blur(8px)',
                borderRadius: '14px', padding: '10px 16px',
              }}>
                <span style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '26px', fontWeight: 700, color: G.green400,
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>₹{listing.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Safety card */}
            <div style={{
              background: G.green50,
              border: `1px solid ${G.green100}`,
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex', gap: '14px', alignItems: 'flex-start',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: G.green100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <MapPin style={{ width: '18px', height: '18px', color: G.green600 }} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: "'Fraunces', serif", fontSize: '15px',
                  fontWeight: 600, color: G.green900, marginBottom: '4px',
                }}>Meet on campus</h3>
                <p style={{ fontSize: '13px', color: G.green700, lineHeight: 1.6 }}>
                  Stick to public spots — library, canteen, or lab corridors. Inspect the item before you pay.
                </p>
              </div>
            </div>

            {/* Posted date */}
            <div style={{
              marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', borderRadius: '12px',
              background: '#fff', border: `1px solid ${G.border}`,
            }}>
              <Calendar style={{ width: '14px', height: '14px', color: G.muted }} />
              <span style={{ fontSize: '13px', color: G.muted, fontFamily: "'DM Sans', sans-serif" }}>
                Posted{' '}
                {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              {listing.category && (
                <>
                  <span style={{ color: G.border }}>·</span>
                  <Tag style={{ width: '14px', height: '14px', color: G.muted }} />
                  <span style={{ fontSize: '13px', color: G.muted }}>{listing.category}</span>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT: DETAILS ── */}
          <div className="page-enter-2">

            {/* Category tag */}
            {listing.category && (
              <div style={{ marginBottom: '16px' }}>
                <span className="tag-pill">
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: G.green600, display: 'inline-block' }} />
                  {listing.category}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(26px, 3.5vw, 38px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: G.charcoal, lineHeight: 1.1,
              marginBottom: '12px',
            }}>{listing.title}</h1>

            {/* Price large */}
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '42px', fontWeight: 700,
              color: G.green600, letterSpacing: '-0.04em',
              lineHeight: 1, marginBottom: '28px',
            }}>
              ₹{listing.price.toLocaleString('en-IN')}
            </div>

            {/* Meta chips row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
              <span className="meta-badge" style={{ background: cs.bg, color: cs.color }}>
                {listing.condition}
              </span>
              {listing.semester && (
                <span className="meta-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                  {listing.semester}
                </span>
              )}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '5px 12px', borderRadius: '100px',
                background: G.sand, border: `1px solid ${G.border}`,
                fontSize: '12px', fontWeight: 600, color: G.muted,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <Clock style={{ width: '11px', height: '11px' }} />
                Sells in &lt; 48h avg
              </span>
            </div>

            {/* Description */}
            <div style={{
              background: '#fff', border: `1px solid ${G.border}`,
              borderRadius: '20px', padding: '24px',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontFamily: "'Fraunces', serif", fontSize: '16px',
                fontWeight: 600, color: G.charcoal, marginBottom: '10px',
                letterSpacing: '-0.01em',
              }}>Description</h2>
              <p style={{ fontSize: '14px', color: G.muted, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                {listing.description}
              </p>
            </div>

            {/* Seller card */}
            <div style={{
              background: '#fff', border: `1px solid ${G.border}`,
              borderRadius: '20px', padding: '24px',
              marginBottom: '24px',
            }}>
              <h2 style={{
                fontFamily: "'Fraunces', serif", fontSize: '16px',
                fontWeight: 600, color: G.charcoal, marginBottom: '18px',
                letterSpacing: '-0.01em',
              }}>Seller</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Avatar */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: `0 0 0 3px ${G.green100}`,
                }}>
                  <span style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: '20px', fontWeight: 700, color: '#fff',
                  }}>{sellerInitial}</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: '17px', fontWeight: 600,
                      color: G.charcoal, letterSpacing: '-0.01em',
                    }}>{listing.seller.name}</span>

                    {listing.seller.studentVerified ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 9px', borderRadius: '100px',
                        background: G.green100, fontSize: '11px',
                        fontWeight: 700, color: G.green800,
                        fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.03em',
                      }}>
                        <ShieldCheck style={{ width: '11px', height: '11px' }} />
                        Verified
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 9px', borderRadius: '100px',
                        background: '#fef3c7', fontSize: '11px',
                        fontWeight: 700, color: '#92400e',
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        <ShieldAlert style={{ width: '11px', height: '11px' }} />
                        Unverified
                      </span>
                    )}
                  </div>

                  {(listing.seller.branch || listing.seller.year) && (
                    <p style={{ fontSize: '13px', color: G.muted }}>
                      {[listing.seller.branch, listing.seller.year].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              {isOwnListing && (
                <div style={{
                  marginTop: '16px', paddingTop: '14px',
                  borderTop: `1px solid ${G.border}`,
                }}>
                  <p style={{
                    fontSize: '13px', color: G.muted, textAlign: 'center',
                    fontStyle: 'italic', fontFamily: "'Fraunces', serif", fontWeight: 300,
                  }}>
                    This is your listing
                  </p>
                </div>
              )}
            </div>

            {/* CTA */}
            {!isOwnListing ? (
              <button
                className="chat-btn"
                onClick={() => navigate(`/chat/${listing.seller._id}?listingId=${listing._id}&listingTitle=${encodeURIComponent(listing.title)}`)}
              >
                <MessageCircle style={{ width: '20px', height: '20px' }} />
                Chat with Seller
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to="/my-listings"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '8px', padding: '14px',
                    border: `1.5px solid ${G.border}`, borderRadius: '100px',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
                    fontWeight: 600, color: G.ink, textDecoration: 'none',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  View all my listings
                </Link>
                <button
                  className="delete-btn"
                  onClick={() => setShowConfirm(true)}
                  disabled={isDeleting}
                >
                  <Trash2 style={{ width: '15px', height: '15px' }} />
                  {isDeleting ? 'Deleting…' : 'Delete this listing'}
                </button>
              </div>
            )}

            {/* Trust note */}
            {!isOwnListing && (
              <p style={{
                marginTop: '14px', textAlign: 'center',
                fontSize: '12px', color: G.muted,
                fontFamily: "'Fraunces', serif", fontStyle: 'italic', fontWeight: 300,
              }}>
                Only verified campus students can list on PassItOn.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}