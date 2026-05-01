import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, ShieldCheck, Package, Wifi, WifiOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

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

const chatStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes msgIn-right {
    from { opacity: 0; transform: translateX(16px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes msgIn-left {
    from { opacity: 0; transform: translateX(-16px) scale(0.96); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes pulse-dot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
    50%       { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
  }
  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30%           { transform: translateY(-4px); opacity: 1; }
  }
  @keyframes connectPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }

  .msg-own {
    animation: msgIn-right 0.25s ease both;
  }
  .msg-other {
    animation: msgIn-left 0.25s ease both;
  }

  .chat-input {
    flex: 1;
    padding: 13px 18px;
    border: 1.5px solid ${G.border};
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: ${G.charcoal};
    background: ${G.cream};
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    resize: none;
  }
  .chat-input:focus {
    border-color: ${G.green500};
    box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
    background: #fff;
  }
  .chat-input::placeholder { color: #b0a898; }

  .send-btn {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${G.green600};
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.16s, transform 0.12s, box-shadow 0.16s;
  }
  .send-btn:hover:not(:disabled) {
    background: ${G.green700};
    transform: scale(1.06);
    box-shadow: 0 6px 20px rgba(22,163,74,0.35);
  }
  .send-btn:active:not(:disabled) { transform: scale(0.97); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

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

  .suggested-msg {
    display: inline-flex;
    padding: 8px 16px;
    border: 1.5px solid ${G.border};
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: ${G.ink};
    background: #fff;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, transform 0.12s;
    white-space: nowrap;
  }
  .suggested-msg:hover {
    border-color: ${G.green500};
    background: ${G.green50};
    transform: translateY(-1px);
  }

  .messages-scroll::-webkit-scrollbar { width: 4px; }
  .messages-scroll::-webkit-scrollbar-track { background: transparent; }
  .messages-scroll::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 100px; }

  .browse-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 11px 22px;
    background: ${G.green600};
    color: #fff;
    border-radius: 100px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: background 0.16s, transform 0.12s, box-shadow 0.16s;
  }
  .browse-cta:hover {
    background: ${G.green700};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22,163,74,0.3);
  }
`;

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

const SUGGESTED = [
  'Is this still available? 👀',
  'Can you do a lower price?',
  'Where can we meet on campus?',
];

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// Groups messages by date for date separators
function groupByDate(messages: Message[]) {
  const groups: { date: string; msgs: Message[] }[] = [];
  messages.forEach((m) => {
    const d = new Date(m.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else groups.push({ date: d, msgs: [m] });
  });
  return groups;
}

export default function ChatPage() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const roomId =
    user && sellerId ? [user._id, sellerId].sort().join('_') : null;

  useEffect(() => {
    if (!roomId) return;
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current?.emit('join_room', roomId);
    });
    socketRef.current.on('disconnect', () => setIsConnected(false));
    socketRef.current.on('receive_message', (data: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });
    return () => { socketRef.current?.disconnect(); };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  // No sellerId — empty state
  if (!sellerId) {
    return (
      <div style={{
        height: '100vh', backgroundColor: G.cream,
        display: 'flex', flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <style>{chatStyles}</style>

        <header style={{
          backgroundColor: 'rgba(250,249,246,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${G.border}`,
          flexShrink: 0,
        }}>
          <div style={{
            maxWidth: '760px', margin: '0 auto',
            padding: '0 24px', height: '64px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <Link to="/dashboard" className="nav-link">
              <ArrowLeft style={{ width: '18px', height: '18px' }} />
              Dashboard
            </Link>
            <div style={{ width: '1px', height: '20px', background: G.border }} />
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '19px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>Chats</span>
          </div>
        </header>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px',
        }}>
          <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s ease both' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px',
              background: G.sand, border: `1px solid ${G.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <Package style={{ width: '34px', height: '34px', color: G.muted, opacity: 0.5 }} />
            </div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '26px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em', marginBottom: '10px',
            }}>No chat selected</h2>
            <p style={{
              fontSize: '15px', color: G.muted, lineHeight: 1.65,
              marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px',
            }}>
              Find an item and tap "Chat with Seller" to start a conversation.
            </p>
            <Link to="/browse" className="browse-cta">
              Browse listings →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (sellerId === user._id) {
    navigate('/browse');
    return null;
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !roomId) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user._id,
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    socketRef.current?.emit('send_message', { ...newMessage, roomId });
    setMessage('');
    inputRef.current?.focus();
  };

  const handleSuggested = (text: string) => {
    setMessage(text);
    inputRef.current?.focus();
  };

  const grouped = groupByDate(messages);
  const sellerInitial = sellerId.charAt(0).toUpperCase();

  return (
    <div style={{
      height: '100vh', backgroundColor: G.cream,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden',
    }}>
      <style>{chatStyles}</style>

      {/* ── HEADER ── */}
      <header style={{
        backgroundColor: 'rgba(250,249,246,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${G.border}`,
        flexShrink: 0,
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto',
          padding: '0 24px', height: '68px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <Link to="/browse" className="nav-link" style={{ flexShrink: 0 }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>

          {/* Avatar */}
          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 0 0 3px ${G.green100}`,
          }}>
            <span style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '17px', fontWeight: 700, color: '#fff',
            }}>{sellerInitial}</span>
          </div>

          {/* Name + status */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '17px', fontWeight: 600,
              color: G.charcoal, letterSpacing: '-0.01em',
            }}>Seller</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              marginTop: '1px',
            }}>
              {isConnected ? (
                <>
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: G.green500, display: 'inline-block',
                    animation: 'pulse-dot 2s infinite',
                  }} />
                  <span style={{ fontSize: '12px', color: G.green600, fontWeight: 500 }}>Connected</span>
                </>
              ) : (
                <>
                  <span style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: G.muted, display: 'inline-block',
                    animation: 'connectPulse 1.2s infinite',
                  }} />
                  <span style={{ fontSize: '12px', color: G.muted, fontWeight: 500 }}>Connecting…</span>
                </>
              )}
            </div>
          </div>

          {/* Connection icon */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: isConnected ? G.green50 : G.sand,
            border: `1px solid ${isConnected ? G.green100 : G.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {isConnected
              ? <Wifi style={{ width: '16px', height: '16px', color: G.green600 }} />
              : <WifiOff style={{ width: '16px', height: '16px', color: G.muted }} />
            }
          </div>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <div className="messages-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', paddingTop: '24px', paddingBottom: '12px' }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '48px 0 32px',
              animation: 'fadeIn 0.5s ease',
            }}>
              {/* Seller avatar large */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: `0 0 0 6px ${G.green100}`,
              }}>
                <span style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '26px', fontWeight: 700, color: '#fff',
                }}>{sellerInitial}</span>
              </div>
              <p style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '18px', fontWeight: 600,
                color: G.charcoal, marginBottom: '6px',
                letterSpacing: '-0.01em',
              }}>Say hello!</p>
              <p style={{ fontSize: '14px', color: G.muted, lineHeight: 1.6 }}>
                Ask if the item is available or negotiate a price.
              </p>

              {/* Suggested messages */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: '8px', marginTop: '24px',
              }}>
                {SUGGESTED.map((s) => (
                  <button key={s} className="suggested-msg" onClick={() => handleSuggested(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message groups by date */}
          {grouped.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                margin: '24px 0 16px',
              }}>
                <div style={{ flex: 1, height: '1px', background: G.border }} />
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: G.muted,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: "'DM Sans', sans-serif",
                  padding: '4px 10px',
                  background: G.sand, borderRadius: '100px',
                  border: `1px solid ${G.border}`,
                }}>{date}</span>
                <div style={{ flex: 1, height: '1px', background: G.border }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {msgs.map((msg, idx) => {
                  const isOwn = msg.senderId === user._id;
                  const prevOwn = idx > 0 && msgs[idx - 1].senderId === user._id;
                  const compact = isOwn === prevOwn && idx > 0;

                  return (
                    <div
                      key={msg.id}
                      className={isOwn ? 'msg-own' : 'msg-other'}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        marginTop: compact ? '2px' : '6px',
                      }}
                    >
                      {/* Other user avatar (only on first in a group) */}
                      {!isOwn && (
                        <div style={{ width: '30px', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>
                          {!compact && (
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', fontFamily: "'Fraunces', serif" }}>
                                {sellerInitial}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ maxWidth: '68%' }}>
                        <div style={{
                          padding: '11px 16px',
                          borderRadius: isOwn
                            ? '20px 20px 6px 20px'
                            : '20px 20px 20px 6px',
                          fontSize: '14px',
                          lineHeight: 1.55,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: "'DM Sans', sans-serif",
                          ...(isOwn ? {
                            background: `linear-gradient(135deg, ${G.green600}, ${G.green700})`,
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(22,163,74,0.2)',
                          } : {
                            background: '#fff',
                            color: G.ink,
                            border: `1px solid ${G.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }),
                        }}>
                          {msg.text}
                        </div>
                        <p style={{
                          fontSize: '11px', color: G.muted,
                          marginTop: '4px',
                          textAlign: isOwn ? 'right' : 'left',
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {formatTimestamp(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── SAFETY NOTICE ── */}
      <div style={{
        flexShrink: 0,
        background: G.green50,
        borderTop: `1px solid ${G.green100}`,
      }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto',
          padding: '9px 24px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <ShieldCheck style={{ width: '13px', height: '13px', color: G.green600, flexShrink: 0 }} />
          <p style={{
            fontSize: '12px', color: G.green700,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
          }}>
            Meet in public campus areas · Never share personal contact info
          </p>
        </div>
      </div>

      {/* ── INPUT ── */}
      <div style={{
        flexShrink: 0,
        backgroundColor: 'rgba(250,249,246,0.97)',
        backdropFilter: 'blur(16px)',
        borderTop: `1px solid ${G.border}`,
        padding: '14px 24px 20px',
      }}>
        <form
          onSubmit={handleSend}
          style={{
            maxWidth: '720px', margin: '0 auto',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          <input
            ref={inputRef}
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message…"
            autoComplete="off"
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!message.trim() || !isConnected}
            title="Send"
          >
            <Send style={{ width: '18px', height: '18px', color: '#fff' }} />
          </button>
        </form>
      </div>
    </div>
  );
}