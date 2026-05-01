import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft,
  Package,
  Trash2,
  Eye,
  ShieldAlert,
  Plus,
  Lightbulb,
  Tag,
  Clock,
  Layers,
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
  green50: '#f0fdf4',
  cream: '#faf9f6',
  sand: '#f5f0e8',
  charcoal: '#1a1a1a',
  ink: '#2d2d2d',
  muted: '#6b6b6b',
  border: '#e8e3d8',
};

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

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
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .ml-fade-1 { animation: fadeUp 0.55s ease both; }
  .ml-fade-2 { animation: fadeUp 0.55s 0.08s ease both; }
  .ml-fade-3 { animation: fadeUp 0.55s 0.16s ease both; }
  .ml-fade-list > * {
    animation: fadeUp 0.45s ease both;
  }
  .ml-fade-list > *:nth-child(1) { animation-delay: 0.05s; }
  .ml-fade-list > *:nth-child(2) { animation-delay: 0.12s; }
  .ml-fade-list > *:nth-child(3) { animation-delay: 0.19s; }
  .ml-fade-list > *:nth-child(4) { animation-delay: 0.26s; }
  .ml-fade-list > *:nth-child(5) { animation-delay: 0.33s; }

  .listing-card {
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .listing-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 56px rgba(0,0,0,0.08);
    border-color: ${G.green400};
  }

  .btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    border: 1.5px solid #fca5a5;
    border-radius: 100px;
    background: transparent;
    color: #dc2626;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.16s, border-color 0.16s, transform 0.12s;
  }
  .btn-danger:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #f87171;
    transform: translateY(-1px);
  }
  .btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-view {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 18px;
    border: 1.5px solid ${G.border};
    border-radius: 100px;
    background: transparent;
    color: ${G.ink};
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: border-color 0.16s, background 0.16s, transform 0.12s;
  }
  .btn-view:hover {
    border-color: ${G.green500};
    background: ${G.green50};
    transform: translateY(-1px);
  }

  .skeleton-pulse {
    background: linear-gradient(90deg, #f0ece4 25%, #e8e3d8 50%, #f0ece4 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }

  .stat-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: #fff;
    border: 1px solid ${G.border};
    border-radius: 14px;
    font-family: 'DM Sans', sans-serif;
  }

  .condition-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
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

  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(22,163,74,0.1);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: ${G.green800};
  }
  .tip-item:last-child { border-bottom: none; padding-bottom: 0; }

  .add-btn-primary {
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
    transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
    border: none;
    cursor: pointer;
  }
  .add-btn-primary:hover {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22,163,74,0.3);
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
}

function conditionStyle(c: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    'Like New': { bg: G.green100, color: G.green800 },
    'Good': { bg: '#dbeafe', color: '#1e40af' },
    'Fair': { bg: '#fef3c7', color: '#92400e' },
    'Worn': { bg: '#fee2e2', color: '#991b1b' },
  };
  return map[c] ?? { bg: G.sand, color: G.muted };
}

// Confirmation modal component
function ConfirmModal({
  title,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <Trash2 style={{ width: '24px', height: '24px', color: '#dc2626' }} />
        </div>
        <h3 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '22px', fontWeight: 700,
          color: G.charcoal, marginBottom: '10px',
          letterSpacing: '-0.02em',
        }}>Delete listing?</h3>
        <p style={{
          fontSize: '14px', color: G.muted,
          lineHeight: 1.6, marginBottom: '32px',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          <em style={{ fontFamily: "'Fraunces', serif", fontStyle: 'italic', color: G.ink }}>"{title}"</em>
          {' '}will be permanently removed from the marketplace.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px',
              border: `1.5px solid ${G.border}`,
              borderRadius: '100px',
              background: 'transparent',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px', fontWeight: 600,
              color: G.ink, cursor: 'pointer',
            }}
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '12px',
              border: 'none', borderRadius: '100px',
              background: '#dc2626',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px', fontWeight: 600,
              color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
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

export default function MyListingsPage() {
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mine = res.data.filter(
          (l: any) => l.seller._id === user?._id || l.seller === user?._id
        );
        setListings(mine);
      } catch {
        setError('Could not load your listings.');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchMyListings();
  }, [user]);

  if (!user) return null;

  // Not verified
  if (!user.studentVerified) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
        <style>{pageStyles}</style>

        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(250,249,246,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${G.border}`,
        }}>
          <div style={{
            maxWidth: '1120px', margin: '0 auto',
            padding: '0 24px', height: '64px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <Link to="/dashboard" className="nav-link">
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
              Back
            </Link>
            <div style={{ width: '1px', height: '20px', background: G.border }} />
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>My Listings</h1>
          </div>
        </header>

        <div style={{
          maxWidth: '480px', margin: '0 auto',
          padding: '100px 24px', textAlign: 'center',
        }}>
          <div style={{
            background: '#fff',
            border: `1px solid ${G.border}`,
            borderRadius: '28px',
            padding: '52px 40px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.05)',
          }}>
            <div style={{
              width: '72px', height: '72px',
              borderRadius: '20px',
              background: '#fef3c7',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <ShieldAlert style={{ width: '32px', height: '32px', color: '#d97706' }} />
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '26px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}>Verified Students Only</h2>
            <p style={{ fontSize: '15px', color: G.muted, lineHeight: 1.65, marginBottom: '32px' }}>
              You need a verified college email to list and manage items on the marketplace.
            </p>
            <Link to="/profile" className="add-btn-primary">
              Verify College Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/listings/${confirmDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== confirmDelete.id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const totalValue = listings.reduce((sum, l) => sum + l.price, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{pageStyles}</style>

      {/* Confirm Modal */}
      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
          loading={deletingId === confirmDelete.id}
        />
      )}

      {/* ── HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(250,249,246,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{
          maxWidth: '1120px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/dashboard" className="nav-link">
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
              Dashboard
            </Link>
            <div style={{ width: '1px', height: '20px', background: G.border }} />
            <h1 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '20px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>My Listings</h1>
          </div>

          <Link to="/add-listing" className="add-btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
            <Plus style={{ width: '15px', height: '15px' }} />
            New listing
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* ── PAGE TITLE + STATS ── */}
        {!isLoading && !error && (
          <div className="ml-fade-1" style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span className="tag-pill">
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: G.green600, display: 'inline-block',
                  animation: 'pulse-dot 2s infinite',
                }} />
                Active marketplace
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700, letterSpacing: '-0.03em',
              color: G.charcoal, lineHeight: 1.1,
              marginBottom: '8px',
            }}>
              Your listings,{' '}
              <em style={{ color: G.green600, fontStyle: 'italic', fontWeight: 300 }}>your campus.</em>
            </h2>
            <p style={{ fontSize: '15px', color: G.muted }}>
              {listings.length} item{listings.length !== 1 ? 's' : ''} listed · ₹{totalValue.toLocaleString('en-IN')} in potential earnings
            </p>
          </div>
        )}

        {/* Stats row */}
        {!isLoading && listings.length > 0 && (
          <div className="ml-fade-2" style={{
            display: 'flex', gap: '12px', flexWrap: 'wrap',
            marginBottom: '36px',
          }}>
            {[
              { icon: <Layers style={{ width: '15px', height: '15px', color: G.green600 }} />, value: listings.length, label: 'Active listings' },
              { icon: <Tag style={{ width: '15px', height: '15px', color: '#7c3aed' }} />, value: `₹${totalValue.toLocaleString('en-IN')}`, label: 'Total listed value' },
              { icon: <Clock style={{ width: '15px', height: '15px', color: '#2563eb' }} />, value: '< 48h', label: 'Avg. time to sell' },
            ].map((s) => (
              <div key={s.label} className="stat-pill">
                {s.icon}
                <span style={{ fontSize: '15px', fontWeight: 700, color: G.charcoal, fontFamily: "'Fraunces', serif" }}>
                  {s.value}
                </span>
                <span style={{ fontSize: '12px', color: G.muted }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── LOADING SKELETONS ── */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '20px',
                border: `1px solid ${G.border}`,
                padding: '28px', display: 'flex', gap: '24px',
              }}>
                <div className="skeleton-pulse" style={{ width: '140px', height: '140px', borderRadius: '14px', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '4px' }}>
                  <div className="skeleton-pulse" style={{ height: '22px', width: '55%' }} />
                  <div className="skeleton-pulse" style={{ height: '16px', width: '80%' }} />
                  <div className="skeleton-pulse" style={{ height: '16px', width: '35%' }} />
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <div className="skeleton-pulse" style={{ height: '36px', width: '90px', borderRadius: '100px' }} />
                    <div className="skeleton-pulse" style={{ height: '36px', width: '90px', borderRadius: '100px' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ERROR ── */}
        {!isLoading && error && (
          <div style={{
            background: '#fff', border: `1px solid ${G.border}`,
            borderRadius: '20px', padding: '60px 40px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '16px',
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Package style={{ width: '28px', height: '28px', color: '#dc2626' }} />
            </div>
            <p style={{ fontSize: '15px', color: G.muted, marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px', fontWeight: 600,
                color: G.green600, background: 'none',
                border: 'none', cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >Try again</button>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!isLoading && !error && listings.length === 0 && (
          <div style={{
            background: '#fff', border: `1px solid ${G.border}`,
            borderRadius: '28px', padding: '80px 40px',
            textAlign: 'center',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '22px',
              background: G.sand, border: `1px solid ${G.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
            }}>
              <Package style={{ width: '36px', height: '36px', color: G.muted }} />
            </div>
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '26px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em', marginBottom: '12px',
            }}>Nothing listed yet</h3>
            <p style={{ fontSize: '15px', color: G.muted, lineHeight: 1.65, marginBottom: '36px', maxWidth: '340px', margin: '0 auto 36px' }}>
              Start selling your academic resources to your campus community — textbooks, calculators, lab kits, and more.
            </p>
            <Link to="/add-listing" className="add-btn-primary">
              <Plus style={{ width: '16px', height: '16px' }} />
              Create your first listing
            </Link>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="ml-fade-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {listings.map((listing) => {
              const cs = conditionStyle(listing.condition);
              return (
                <div key={listing._id} className="listing-card">
                  <div style={{ display: 'flex', gap: '0' }}>

                    {/* Image */}
                    <div style={{
                      width: '180px', minWidth: '180px',
                      background: G.sand,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative',
                    }}>
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listing.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '180px' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', minHeight: '180px',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: '8px',
                        }}>
                          <Package style={{ width: '32px', height: '32px', color: G.muted, opacity: 0.4 }} />
                          <span style={{ fontSize: '11px', color: G.muted, fontWeight: 500 }}>No image</span>
                        </div>
                      )}

                      {/* Condition badge overlay */}
                      <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                        <span className="condition-badge" style={{ background: cs.bg, color: cs.color }}>
                          {listing.condition}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>

                      {/* Top row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '10px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '20px', fontWeight: 600,
                            color: G.charcoal, letterSpacing: '-0.02em',
                            marginBottom: '6px',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {listing.title}
                          </h3>
                          <p style={{
                            fontSize: '14px', color: G.muted, lineHeight: 1.55,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}>
                            {listing.description}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{
                            fontFamily: "'Fraunces', serif",
                            fontSize: '28px', fontWeight: 700,
                            color: G.green600, lineHeight: 1,
                            letterSpacing: '-0.03em',
                          }}>₹{listing.price.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '11px', color: G.muted, marginTop: '4px', fontWeight: 500 }}>
                            {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                        {listing.category && (
                          <span style={{
                            padding: '4px 10px', borderRadius: '100px',
                            background: G.green50, border: `1px solid ${G.green100}`,
                            fontSize: '11px', fontWeight: 600, color: G.green700,
                            fontFamily: "'DM Sans', sans-serif",
                            letterSpacing: '0.03em',
                          }}>{listing.category}</span>
                        )}
                        {listing.semester && (
                          <span style={{
                            padding: '4px 10px', borderRadius: '100px',
                            background: '#eff6ff', border: '1px solid #dbeafe',
                            fontSize: '11px', fontWeight: 600, color: '#1d4ed8',
                            fontFamily: "'DM Sans', sans-serif",
                          }}>{listing.semester}</span>
                        )}
                      </div>

                      {/* Divider + Actions */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: '16px', borderTop: `1px solid ${G.border}`,
                        flexWrap: 'wrap', gap: '12px',
                      }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Link to={`/item/${listing._id}`} className="btn-view">
                            <Eye style={{ width: '14px', height: '14px' }} />
                            View listing
                          </Link>
                          <button
                            className="btn-danger"
                            onClick={() => setConfirmDelete({ id: listing._id, title: listing.title })}
                            disabled={deletingId === listing._id}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                            {deletingId === listing._id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>

                        {/* Inline sold reminder */}
                        <span style={{
                          fontSize: '12px', color: G.muted,
                          fontStyle: 'italic',
                          fontFamily: "'Fraunces', serif",
                          fontWeight: 300,
                        }}>
                          Sold offline? Delete to keep the market clean.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TIPS CARD ── */}
        {!isLoading && listings.length > 0 && (
          <div style={{
            marginTop: '32px',
            background: G.green900,
            borderRadius: '24px',
            padding: '36px 40px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-50px', right: '-50px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.07)',
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 14px', borderRadius: '100px',
                  background: 'rgba(74,222,128,0.12)',
                  marginBottom: '16px',
                }}>
                  <Lightbulb style={{ width: '13px', height: '13px', color: G.green400 }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: G.green400, textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
                    Seller tips
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '22px', fontWeight: 600,
                  color: '#fff', lineHeight: 1.25,
                  letterSpacing: '-0.02em',
                }}>
                  Sell faster.<br />
                  <em style={{ fontWeight: 300, fontStyle: 'italic', color: G.green400 }}>Earn more.</em>
                </h3>
              </div>

              <div>
                {[
                  'Use clear, well-lit photos — listings with images sell 3× faster',
                  'Write honest descriptions to build trust with buyers',
                  'Price fairly based on condition — check similar listings',
                  'Remove your listing right after selling offline',
                ].map((tip) => (
                  <div key={tip} className="tip-item">
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: G.green400, flexShrink: 0, marginTop: '6px',
                    }} />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}