import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MessageCircle, ChevronRight } from 'lucide-react';

interface Room {
  roomId:        string;
  otherId:       string;
  lastMessage:   string;
  lastTimestamp: string;
  lastSenderId:  string;
  otherName:     string;
}

function formatTime(ts: string) {
  const diff  = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const G = {
  green700: '#155f28', green600: '#16a34a', green500: '#22c55e',
  green100: '#dcfce7', green50: '#f0fdf4',
  cream: '#faf9f6', sand: '#f5f0e8',
  charcoal: '#1a1a1a', ink: '#2d2d2d', muted: '#6b6b6b',
  border: '#e8e3d8',
};

const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

  .room-card {
    display:flex; align-items:center; gap:14px;
    padding:14px 16px; border-radius:16px;
    background:#fff; border:1px solid ${G.border};
    margin-bottom:10px; text-decoration:none;
    transition:box-shadow 0.15s, transform 0.12s;
  }
  .room-card:hover {
    box-shadow:0 4px 20px rgba(0,0,0,0.07);
    transform:translateY(-1px);
  }

  .skeleton {
    height:72px; border-radius:16px; margin-bottom:10px;
    background: linear-gradient(90deg, ${G.sand} 25%, #ede8df 50%, ${G.sand} 75%);
    background-size:400px 100%;
    animation:shimmer 1.4s ease infinite;
  }

  .browse-cta {
    display:inline-flex; align-items:center; gap:6px; padding:11px 22px;
    background:${G.green600}; color:#fff; border-radius:100px;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
    text-decoration:none; transition:background 0.16s,transform 0.12s,box-shadow 0.16s;
  }
  .browse-cta:hover { background:${G.green700}; transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,163,74,0.3); }

  .nav-link {
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
    color:${G.muted}; text-decoration:none;
    display:inline-flex; align-items:center; gap:6px; transition:color 0.15s;
  }
  .nav-link:hover { color:${G.charcoal}; }
`;

export default function ChatsPage() {
  const { user }              = useAuth();
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    // 1. Fetch all rooms
    fetch('http://localhost:5000/api/messages', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(async (data) => {
        const rawRooms = data.rooms ?? [];

        // 2. For each room fetch the other user's name in parallel
        const enriched = await Promise.all(
          rawRooms.map(async (room: Omit<Room, 'otherName'>) => {
            try {
              const res = await fetch(
                `http://localhost:5000/api/auth/users/${room.otherId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const profile = res.ok ? await res.json() : null;
              return { ...room, otherName: profile?.name ?? 'Unknown' };
            } catch {
              return { ...room, otherName: 'Unknown' };
            }
          })
        );

        setRooms(enriched);
      })
      .catch(() => setError('Could not load chats. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: G.cream, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{pageStyles}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: 'rgba(250,249,246,0.95)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${G.border}`,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto', padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <Link to="/dashboard" className="nav-link">
            <ArrowLeft size={18} /> Dashboard
          </Link>
          <div style={{ width: '1px', height: '20px', background: G.border }} />
          <span style={{
            fontFamily: "'Fraunces', serif", fontSize: '19px', fontWeight: 700,
            color: G.charcoal, letterSpacing: '-0.02em',
          }}>Chats</span>
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px' }}>

        {/* Skeletons */}
        {loading && [1, 2, 3].map(i => <div key={i} className="skeleton" />)}

        {/* Error */}
        {!loading && error && (
          <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '48px', fontSize: '14px' }}>
            {error}
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && rooms.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '80px', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: G.sand, border: `1px solid ${G.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <MessageCircle size={32} style={{ color: G.muted, opacity: 0.5 }} />
            </div>
            <p style={{
              fontFamily: "'Fraunces', serif", fontSize: '22px', fontWeight: 700,
              color: G.charcoal, marginBottom: '10px', letterSpacing: '-0.02em',
            }}>No chats yet</p>
            <p style={{ color: G.muted, fontSize: '14px', lineHeight: 1.65, marginBottom: '28px' }}>
              Start a conversation from any listing.
            </p>
            <Link to="/browse" className="browse-cta">Browse listings →</Link>
          </div>
        )}

        {/* Room list */}
        {!loading && !error && rooms.map(room => {
          const isOwn   = room.lastSenderId === user?._id;
          const initial = room.otherName.charAt(0).toUpperCase();
          const preview = (isOwn ? 'You: ' : '') + room.lastMessage;

          return (
            <Link key={room.roomId} to={`/chat/${room.otherId}`} className="room-card">

              {/* Avatar */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 0 3px ${G.green100}`,
              }}>
                <span style={{
                  fontFamily: "'Fraunces', serif", fontSize: '19px',
                  fontWeight: 700, color: '#fff',
                }}>
                  {initial}
                </span>
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '4px',
                }}>
                  {/* ← real name now shown here */}
                  <span style={{ fontWeight: 600, fontSize: '14px', color: G.charcoal }}>
                    {room.otherName}
                  </span>
                  <span style={{ fontSize: '11px', color: G.muted, flexShrink: 0, marginLeft: '8px' }}>
                    {formatTime(room.lastTimestamp)}
                  </span>
                </div>
                <p style={{
                  fontSize: '13px', color: G.muted, margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {preview}
                </p>
              </div>

              <ChevronRight size={16} style={{ color: '#b0a898', flexShrink: 0 }} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}