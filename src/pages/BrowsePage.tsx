import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Search, SlidersHorizontal, ShieldCheck,
  ArrowLeft, Package, X, Leaf, AlertCircle,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const G = {
  green900: '#0a2e14', green800: '#0f4a1f', green700: '#155f28',
  green600: '#16a34a', green500: '#22c55e', green400: '#4ade80',
  green200: '#bbf7d0', green100: '#dcfce7', green50: '#f0fdf4',
  cream: '#faf9f6', sand: '#f5f0e8', charcoal: '#1a1a1a',
  ink: '#2d2d2d', muted: '#6b6b6b', border: '#e8e3d8', white: '#ffffff',
};

const CATEGORIES = ['Textbooks', 'Notes', 'Lab Equipment', 'Electronics', 'Stationery', 'Other'];
const SEMESTERS  = ['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8'];
const CONDITIONS = ['Like New', 'Good', 'Fair', 'Used'];

const conditionStyle: Record<string, { bg: string; color: string }> = {
  'Like New': { bg: G.green100,  color: '#166534' },
  'Good':     { bg: '#dbeafe',   color: '#1e40af' },
  'Fair':     { bg: '#fef3c7',   color: '#92400e' },
  'Used':     { bg: '#fee2e2',   color: '#991b1b' },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes shimmer {
    0%   { background-position: -700px 0; }
    100% { background-position: 700px 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-6px); }
  }

  .browse-body { font-family: 'DM Sans', sans-serif; background: ${G.cream}; min-height: 100vh; }

  .listing-card {
    display: block; text-decoration: none;
    background: ${G.white}; border: 1px solid ${G.border};
    border-radius: 18px; overflow: hidden;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.2s;
    animation: fadeUp 0.45s ease both;
  }
  .listing-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.09);
    border-color: ${G.green400};
  }
  .listing-card:hover .card-img { transform: scale(1.06); }
  .card-img { transition: transform 0.4s ease; width: 100%; height: 100%; object-fit: cover; }

  .shimmer-box {
    background: linear-gradient(90deg, ${G.sand} 25%, #ede8df 50%, ${G.sand} 75%);
    background-size: 700px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 10px;
  }

  .filter-select {
    width: 100%; border: 1.5px solid ${G.border}; border-radius: 12px;
    padding: 10px 14px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: ${G.ink}; background: ${G.cream}; outline: none;
    transition: border-color 0.15s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 32px;
  }
  .filter-select:focus { border-color: ${G.green500}; }

  .filter-label {
    display: block; font-size: 11px; font-weight: 600;
    color: ${G.muted}; text-transform: uppercase;
    letter-spacing: 0.07em; margin-bottom: 8px;
  }

  .chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 100px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all 0.15s; white-space: nowrap;
  }

  .nav-back {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid ${G.border}; color: ${G.muted};
    text-decoration: none; transition: background 0.15s, color 0.15s; flex-shrink: 0;
  }
  .nav-back:hover { background: ${G.sand}; color: ${G.charcoal}; }

  .search-wrap { position: relative; flex: 1; }
  .search-wrap input {
    width: 100%; padding: 12px 16px 12px 44px;
    border: 1.5px solid ${G.border}; border-radius: 14px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    color: ${G.ink}; background: ${G.white}; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .search-wrap input:focus { border-color: ${G.green500}; box-shadow: 0 0 0 3px rgba(34,197,94,0.12); }
  .search-wrap input::placeholder { color: #b0a99a; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; }

  .filter-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 18px; border-radius: 14px;
    font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.15s; border: 1.5px solid ${G.border};
    background: ${G.white}; color: ${G.muted}; white-space: nowrap;
  }
  .filter-btn.active { border-color: ${G.green500}; color: ${G.green700}; background: ${G.green50}; }
  .filter-btn:hover { border-color: ${G.green400}; color: ${G.green700}; }

  input[type='range'] { accent-color: ${G.green600}; }
`;

interface Listing {
  _id: string; title: string; description: string;
  price: number; condition: string; category?: string;
  semester?: string; image?: string;
  seller: { name: string; studentVerified: boolean };
}

export default function BrowsePage() {
  const { user } = useAuth();
  const [listings, setListings]               = useState<Listing[]>([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [error, setError]                     = useState('');
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [maxPrice, setMaxPrice]               = useState(2000);
  const [showFilters, setShowFilters]         = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, { headers: { Authorization: `Bearer ${token}` } });
        setListings(res.data);
      } catch { setError('Could not load listings. Please try again.'); }
      finally  { setIsLoading(false); }
    })();
  }, []);

  if (!user) return null;

  const filtered = listings.filter(l => {
    if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase()) && !l.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory && l.category !== selectedCategory) return false;
    if (selectedSemester && l.semester !== selectedSemester) return false;
    if (selectedCondition && l.condition !== selectedCondition) return false;
    if (l.price > maxPrice) return false;
    return true;
  });

  const hasFilters = !!(searchQuery || selectedCategory || selectedSemester || selectedCondition || maxPrice < 2000);

  const clearFilters = () => {
    setSearchQuery(''); setSelectedCategory(''); setSelectedSemester('');
    setSelectedCondition(''); setMaxPrice(2000);
  };

  /* active filter chips for display */
  const activeChips = [
    selectedCategory && { label: selectedCategory, clear: () => setSelectedCategory('') },
    selectedSemester && { label: selectedSemester, clear: () => setSelectedSemester('') },
    selectedCondition && { label: selectedCondition, clear: () => setSelectedCondition('') },
    maxPrice < 2000 && { label: `Under ₹${maxPrice}`, clear: () => setMaxPrice(2000) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="browse-body">
      <style>{css}</style>

      {/* ── STICKY HEADER ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(250,249,246,0.92)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', paddingBottom: '12px' }}>
            <Link to="/dashboard" className="nav-back">
              <ArrowLeft style={{ width: '17px', height: '17px' }} />
            </Link>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '7px',
                  background: `linear-gradient(135deg, ${G.green600}, ${G.green800})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Leaf style={{ width: '13px', height: '13px', color: '#fff' }} />
                </div>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 700, color: G.charcoal, letterSpacing: '-0.02em' }}>
                  Browse
                </span>
              </div>
              <p style={{ fontSize: '12px', color: G.muted, marginTop: '1px' }}>Campus listings only · verified sellers</p>
            </div>

            {!isLoading && !error && (
              <div style={{
                padding: '6px 14px', borderRadius: '100px',
                background: G.green100, color: G.green800,
                fontSize: '12px', fontWeight: 700,
              }}>
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>

          {/* Search row */}
          <div style={{ display: 'flex', gap: '10px', paddingBottom: '14px' }}>
            <div className="search-wrap">
              <Search className="search-icon" style={{ width: '17px', height: '17px', color: '#b0a99a' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, calculators, lab kits…"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: G.muted, display: 'flex', alignItems: 'center',
                }}>
                  <X style={{ width: '15px', height: '15px' }} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`filter-btn ${showFilters || hasFilters ? 'active' : ''}`}
            >
              <SlidersHorizontal style={{ width: '16px', height: '16px' }} />
              Filters
              {hasFilters && (
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: G.green600, color: '#fff',
                  fontSize: '10px', fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '12px' }}>
              {activeChips.map(chip => (
                <button key={chip.label} onClick={chip.clear} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 12px', borderRadius: '100px',
                  background: G.green100, color: G.green800,
                  border: `1px solid ${G.green200}`,
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  {chip.label}
                  <X style={{ width: '11px', height: '11px' }} />
                </button>
              ))}
              <button onClick={clearFilters} style={{
                padding: '4px 12px', borderRadius: '100px',
                background: 'transparent', color: G.muted,
                border: `1px solid ${G.border}`,
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 64px', display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

        {/* ── FILTER SIDEBAR ── */}
        <aside style={{
          width: '252px', flexShrink: 0,
          display: showFilters ? 'block' : 'none',
          position: 'sticky', top: '160px',
        }}>
          <div style={{
            background: G.white, border: `1px solid ${G.border}`,
            borderRadius: '20px', padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', fontWeight: 600, color: G.charcoal }}>Filters</h2>
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  fontSize: '12px', fontWeight: 600, color: G.green700,
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <label className="filter-label">Category</label>
              <select className="filter-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Semester */}
            <div style={{ marginBottom: '20px' }}>
              <label className="filter-label">Semester</label>
              <select className="filter-select" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                <option value="">All Semesters</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Condition — pill toggles */}
            <div style={{ marginBottom: '20px' }}>
              <label className="filter-label">Condition</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {CONDITIONS.map(c => {
                  const active = selectedCondition === c;
                  const cs = conditionStyle[c] || { bg: G.sand, color: G.muted };
                  return (
                    <button
                      key={c}
                      onClick={() => setSelectedCondition(active ? '' : c)}
                      style={{
                        padding: '5px 12px', borderRadius: '100px',
                        fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', border: `1.5px solid`,
                        borderColor: active ? cs.color : G.border,
                        background: active ? cs.bg : G.cream,
                        color: active ? cs.color : G.muted,
                        transition: 'all 0.15s',
                      }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price range */}
            <div>
              <label className="filter-label">
                Max Price
                <span style={{ color: G.green700, marginLeft: '6px', fontFamily: "'Fraunces', serif", fontSize: '14px', fontWeight: 700, textTransform: 'none', letterSpacing: 0 }}>
                  ₹{maxPrice}
                </span>
              </label>
              <input
                type="range" min="0" max="2000" step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', marginBottom: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: G.muted }}>
                <span>₹0</span><span>₹2,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── LISTING AREA ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Loading skeleton */}
          {isLoading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: '18px', overflow: 'hidden' }}>
                  <div className="shimmer-box" style={{ aspectRatio: '1' }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="shimmer-box" style={{ height: '14px' }} />
                    <div className="shimmer-box" style={{ height: '12px', width: '70%' }} />
                    <div className="shimmer-box" style={{ height: '18px', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div style={{ padding: '48px 24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '20px', borderRadius: '16px',
                background: '#fef2f2', border: '1px solid #fecaca',
                color: '#b91c1c', fontSize: '14px', marginBottom: '16px',
              }}>
                <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px', borderRadius: '100px',
                  background: G.green600, color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600,
                }}
              >
                Try again
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div style={{ padding: '80px 24px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: G.sand, display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'float 3s ease-in-out infinite',
              }}>
                <Package style={{ width: '28px', height: '28px', color: '#c4b99a' }} />
              </div>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: G.charcoal }}>
                {hasFilters ? 'No matches found' : 'No listings yet'}
              </h3>
              <p style={{ fontSize: '14px', color: G.muted, lineHeight: 1.6, maxWidth: '340px' }}>
                {hasFilters
                  ? 'Try loosening your filters — there might be something close.'
                  : 'Your campus has no listings yet. Be the first to post something!'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} style={{
                  padding: '10px 22px', borderRadius: '100px',
                  background: G.green600, color: '#fff',
                  border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, marginTop: '4px',
                }}>
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {filtered.map((listing, idx) => {
                const cs = conditionStyle[listing.condition] || { bg: G.sand, color: G.muted };
                return (
                  <Link
                    key={listing._id}
                    to={`/item/${listing._id}`}
                    className="listing-card"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    {/* Image */}
                    <div style={{ aspectRatio: '1', overflow: 'hidden', background: G.sand, position: 'relative' }}>
                      {listing.image ? (
                        <img src={listing.image} alt={listing.title} className="card-img" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Package style={{ width: '36px', height: '36px', color: '#c4b99a' }} />
                        </div>
                      )}
                      {/* Condition badge */}
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px',
                        padding: '4px 10px', borderRadius: '100px',
                        background: cs.bg, color: cs.color,
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                      }}>
                        {listing.condition}
                      </div>
                      {/* Category badge */}
                      {listing.category && (
                        <div style={{
                          position: 'absolute', top: '10px', right: '10px',
                          padding: '4px 10px', borderRadius: '100px',
                          background: 'rgba(250,249,246,0.92)', color: G.muted,
                          fontSize: '11px', fontWeight: 600,
                          backdropFilter: 'blur(8px)',
                        }}>
                          {listing.category}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{
                        fontSize: '14px', fontWeight: 600, color: G.charcoal,
                        marginBottom: '4px', lineHeight: 1.35,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {listing.title}
                      </h3>
                      <p style={{
                        fontSize: '12px', color: G.muted, lineHeight: 1.5,
                        marginBottom: '12px',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      } as React.CSSProperties}>
                        {listing.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 700, color: G.green700, letterSpacing: '-0.02em', lineHeight: 1 }}>
                          ₹{listing.price}
                        </span>
                        {listing.semester && (
                          <span style={{ fontSize: '11px', color: G.muted, background: G.sand, padding: '3px 9px', borderRadius: '100px', fontWeight: 500 }}>
                            {listing.semester}
                          </span>
                        )}
                      </div>

                      {/* Seller */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        paddingTop: '12px', borderTop: `1px solid ${G.border}`,
                      }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: G.green100,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: '11px', fontWeight: 700, color: G.green800,
                        }}>
                          {listing.seller.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '12px', color: G.muted, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {listing.seller.name}
                        </span>
                        {listing.seller.studentVerified && (
                          <ShieldCheck style={{ width: '14px', height: '14px', color: G.green600, flexShrink: 0 }} />
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}