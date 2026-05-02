import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Send, ShieldCheck, Package,
  Wifi, WifiOff, RefreshCw, ChevronUp, Clock,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// ─── Constants ────────────────────────────────────────────────────────────────

const SOCKET_URL  = 'http://localhost:5000';
const PAGE_LIMIT  = 50;
const ACK_TIMEOUT = 5000;

// ─── Design Tokens ────────────────────────────────────────────────────────────

const G = {
  green900: '#0a2e14', green800: '#0f4a1f', green700: '#155f28',
  green600: '#16a34a', green500: '#22c55e', green400: '#4ade80',
  green100: '#dcfce7', green50:  '#f0fdf4',
  cream:    '#faf9f6', sand:     '#f5f0e8',
  charcoal: '#1a1a1a', ink:      '#2d2d2d', muted: '#6b6b6b',
  border:   '#e8e3d8',
  red50:    '#fff1f2', red500:   '#ef4444', red100: '#fee2e2',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = 'sending' | 'sent' | 'failed';

interface Message {
  _id:            string;
  idempotencyKey: string;
  senderId:       string;
  text:           string;
  timestamp:      string;
  status:         MessageStatus;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const chatStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp        { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn        { from{opacity:0} to{opacity:1} }
  @keyframes msgIn-right   { from{opacity:0;transform:translateX(12px) scale(0.97)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes msgIn-left    { from{opacity:0;transform:translateX(-12px) scale(0.97)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes pulse-dot     { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0)} }
  @keyframes connectPulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes spin          { to{transform:rotate(360deg)} }

  .msg-own   { animation: msgIn-right 0.22s ease both; }
  .msg-other { animation: msgIn-left  0.22s ease both; }

  .chat-input {
    flex:1; padding:13px 18px;
    border:1.5px solid ${G.border}; border-radius:100px;
    font-family:'DM Sans',sans-serif; font-size:14px; color:${G.charcoal};
    background:${G.cream}; outline:none;
    transition:border-color 0.18s,box-shadow 0.18s,background 0.18s;
  }
  .chat-input:focus        { border-color:${G.green500}; box-shadow:0 0 0 3px rgba(34,197,94,0.12); background:#fff; }
  .chat-input::placeholder { color:#b0a898; }
  .chat-input:disabled     { opacity:0.5; cursor:not-allowed; }

  .send-btn {
    width:48px; height:48px; border-radius:50%;
    background:${G.green600}; border:none;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; flex-shrink:0;
    transition:background 0.16s,transform 0.12s,box-shadow 0.16s;
  }
  .send-btn:hover:not(:disabled)  { background:${G.green700}; transform:scale(1.06); box-shadow:0 6px 20px rgba(22,163,74,0.35); }
  .send-btn:active:not(:disabled) { transform:scale(0.97); }
  .send-btn:disabled              { opacity:0.4; cursor:not-allowed; }

  .nav-link {
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
    color:${G.muted}; text-decoration:none;
    display:inline-flex; align-items:center; gap:6px; transition:color 0.15s;
  }
  .nav-link:hover { color:${G.charcoal}; }

  .suggested-msg {
    display:inline-flex; padding:8px 16px;
    border:1.5px solid ${G.border}; border-radius:100px;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500;
    color:${G.ink}; background:#fff; cursor:pointer;
    transition:border-color 0.15s,background 0.15s,transform 0.12s; white-space:nowrap;
  }
  .suggested-msg:hover { border-color:${G.green500}; background:${G.green50}; transform:translateY(-1px); }

  .retry-btn {
    font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600;
    color:${G.red500}; background:none; border:none; cursor:pointer; padding:0;
    display:inline-flex; align-items:center; gap:3px;
    text-decoration:underline; text-underline-offset:2px; transition:opacity 0.15s;
  }
  .retry-btn:hover { opacity:0.7; }

  .load-more-btn {
    display:inline-flex; align-items:center; gap:6px; padding:8px 18px;
    border:1.5px solid ${G.border}; border-radius:100px;
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600;
    color:${G.muted}; background:#fff; cursor:pointer;
    transition:border-color 0.15s,color 0.15s,transform 0.12s;
  }
  .load-more-btn:hover:not(:disabled) { border-color:${G.green500}; color:${G.green700}; transform:translateY(-1px); }
  .load-more-btn:disabled             { opacity:0.4; cursor:not-allowed; }

  .messages-scroll::-webkit-scrollbar       { width:4px; }
  .messages-scroll::-webkit-scrollbar-track { background:transparent; }
  .messages-scroll::-webkit-scrollbar-thumb { background:${G.border}; border-radius:100px; }

  .browse-cta {
    display:inline-flex; align-items:center; gap:6px; padding:11px 22px;
    background:${G.green600}; color:#fff; border-radius:100px;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600;
    text-decoration:none; transition:background 0.16s,transform 0.12s,box-shadow 0.16s;
  }
  .browse-cta:hover { background:${G.green700}; transform:translateY(-2px); box-shadow:0 8px 24px rgba(22,163,74,0.3); }

  .spinner {
    width:14px; height:14px; border:2px solid ${G.border};
    border-top-color:${G.green500}; border-radius:50%;
    animation:spin 0.7s linear infinite; display:inline-block;
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genIdempotencyKey(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function buildRoomId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

function formatTimestamp(ts: string): string {
  const date  = new Date(ts);
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function groupByDate(messages: Message[]) {
  const groups: { date: string; msgs: Message[] }[] = [];
  for (const m of messages) {
    const d = new Date(m.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const last = groups[groups.length - 1];
    if (last && last.date === d) last.msgs.push(m);
    else groups.push({ date: d, msgs: [m] });
  }
  return groups;
}

const SUGGESTED = [
  'Is this still available? 👀',
  'Can you do a lower price?',
  'Where can we meet on campus?',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { sellerId }        = useParams<{ sellerId: string }>();
  const { user, isLoading } = useAuth();
  const navigate            = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages, setMessages]                 = useState<Message[]>([]);
  const [message, setMessage]                   = useState('');
  const [isConnected, setIsConnected]           = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMore, setHasMore]                   = useState(false);
  const [isLoadingMore, setIsLoadingMore]       = useState(false);
  const [cursor, setCursor]                     = useState<string | null>(null);
  const [sellerName, setSellerName]             = useState<string>('');  // ← new

  // ── Refs ───────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  const socketRef      = useRef<Socket | null>(null);
  const scrollRef      = useRef<HTMLDivElement>(null);
  const ackTimers      = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const isFirstLoad    = useRef(true);

  const roomIdRef   = useRef<string | null>(null);
  roomIdRef.current = (user?._id && sellerId)
    ? buildRoomId(user._id, sellerId)
    : null;

  // ── Fetch seller name ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sellerId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:5000/api/auth/users/${sellerId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.name) setSellerName(data.name); })
      .catch(() => {});
  }, [sellerId]);

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = useCallback(async (beforeCursor?: string) => {
    const currentRoomId = roomIdRef.current;
    if (!currentRoomId) return;

    const isMore = !!beforeCursor;
    isMore ? setIsLoadingMore(true) : setIsLoadingHistory(true);

    const scrollEl         = scrollRef.current;
    const prevScrollHeight = scrollEl?.scrollHeight ?? 0;

    try {
      const token = localStorage.getItem('token');
      if (!token) { console.error('[Chat] fetchHistory: no auth token'); return; }

      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (beforeCursor) params.set('before', beforeCursor);

      const res = await fetch(
        `http://localhost:5000/api/messages/${currentRoomId}?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);

      const { messages: fetched, nextCursor, hasMore: more } = await res.json();

      const shaped: Message[] = fetched.map((m: any) => ({
        _id:            m._id,
        idempotencyKey: m.idempotencyKey ?? m._id,
        senderId:       m.senderId,
        text:           m.text,
        timestamp:      m.timestamp,
        status:         'sent' as MessageStatus,
      }));

      if (isMore) {
        setMessages(prev => [...shaped, ...prev]);
        requestAnimationFrame(() => {
          if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
        });
      } else {
        setMessages(shaped);
        isFirstLoad.current = true;
      }

      setCursor(nextCursor ?? null);
      setHasMore(more);
    } catch (err) {
      console.error('[Chat] History fetch failed:', err);
    } finally {
      isMore ? setIsLoadingMore(false) : setIsLoadingHistory(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket lifecycle ───────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (!user?._id || !sellerId || sellerId === user._id) return;

    const token = localStorage.getItem('token');
    if (!token) { console.error('[Chat] Cannot open socket: no auth token'); return; }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setMessages([]);
    setIsConnected(false);
    setCursor(null);
    setHasMore(false);
    isFirstLoad.current = true;

    const socket = io(SOCKET_URL, {
      transports:           ['websocket'],
      auth:                 { token },
      reconnection:         true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      const rid = roomIdRef.current;
      if (!rid) return;
      socket.emit('join_room', rid);
      fetchHistory();
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socket.on('message_ack', ({ idempotencyKey, _id, timestamp }: {
      idempotencyKey: string; _id: string; timestamp: string;
    }) => {
      const timer = ackTimers.current.get(idempotencyKey);
      if (timer) { clearTimeout(timer); ackTimers.current.delete(idempotencyKey); }
      setMessages(prev =>
        prev.map(m =>
          m.idempotencyKey === idempotencyKey
            ? { ...m, _id, timestamp, status: 'sent' }
            : m
        )
      );
    });

    socket.on('receive_message', (data: Omit<Message, 'status'>) => {
      if (data.senderId === user._id) return;
      setMessages(prev => {
        const exists = prev.some(m => m.idempotencyKey === data.idempotencyKey);
        if (exists) return prev;
        return [...prev, { ...data, status: 'sent' }];
      });
    });

    return () => {
      ackTimers.current.forEach(t => clearTimeout(t));
      ackTimers.current.clear();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, sellerId, isLoading, fetchHistory]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────
  useEffect(() => {
    if (messages.length === 0) return;
    if (isFirstLoad.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      isFirstLoad.current = false;
      return;
    }
    const latest = messages[messages.length - 1];
    if (latest?.senderId === user?._id) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, user?._id]);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return null;
  if (!user)     return null;

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
          borderBottom: `1px solid ${G.border}`, flexShrink: 0,
        }}>
          <div style={{
            maxWidth: '760px', margin: '0 auto', padding: '0 24px', height: '64px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <Link to="/chats" className="nav-link">
              <ArrowLeft style={{ width: '18px', height: '18px' }} /> Chats
            </Link>
            <div style={{ width: '1px', height: '20px', background: G.border }} />
            <span style={{
              fontFamily: "'Fraunces', serif", fontSize: '19px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em',
            }}>Conversation</span>
          </div>
        </header>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
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
              fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700,
              color: G.charcoal, letterSpacing: '-0.02em', marginBottom: '10px',
            }}>No chat selected</h2>
            <p style={{ fontSize: '15px', color: G.muted, lineHeight: 1.65, maxWidth: '300px', margin: '0 auto 32px' }}>
              Find an item and tap "Chat with Seller" to start a conversation.
            </p>
            <Link to="/browse" className="browse-cta">Browse listings →</Link>
          </div>
        </div>
      </div>
    );
  }

  if (sellerId === user._id) {
    navigate('/browse');
    return null;
  }

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text || !roomIdRef.current || !socketRef.current) return;

    const idempotencyKey = genIdempotencyKey();

    const optimistic: Message = {
      _id:            idempotencyKey,
      idempotencyKey,
      senderId:       user._id,
      text,
      timestamp:      new Date().toISOString(),
      status:         'sending',
    };

    setMessages(prev => [...prev, optimistic]);
    setMessage('');
    inputRef.current?.focus();

    socketRef.current.emit('send_message', {
      roomId:         roomIdRef.current,
      senderId:       user._id,
      text,
      idempotencyKey,
    });

    const timer = setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.idempotencyKey === idempotencyKey ? { ...m, status: 'failed' } : m
        )
      );
      ackTimers.current.delete(idempotencyKey);
    }, ACK_TIMEOUT);

    ackTimers.current.set(idempotencyKey, timer);
  };

  // ── Retry failed message ───────────────────────────────────────────────────
  const handleRetry = (msg: Message) => {
    if (!roomIdRef.current || !socketRef.current) return;

    setMessages(prev =>
      prev.map(m =>
        m.idempotencyKey === msg.idempotencyKey ? { ...m, status: 'sending' } : m
      )
    );

    socketRef.current.emit('send_message', {
      roomId:         roomIdRef.current,
      senderId:       user._id,
      text:           msg.text,
      idempotencyKey: msg.idempotencyKey,
    });

    const timer = setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.idempotencyKey === msg.idempotencyKey ? { ...m, status: 'failed' } : m
        )
      );
      ackTimers.current.delete(msg.idempotencyKey);
    }, ACK_TIMEOUT);

    ackTimers.current.set(msg.idempotencyKey, timer);
  };

  const handleSuggested = (text: string) => {
    setMessage(text);
    inputRef.current?.focus();
  };

  // Use fetched name; fall back to first char of sellerId while loading
  const displayName   = sellerName || 'Loading…';
  const sellerInitial = sellerName
    ? sellerName.charAt(0).toUpperCase()
    : sellerId.charAt(0).toUpperCase();

  const grouped = groupByDate(messages);
  const canSend = !!message.trim() && isConnected;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      height: '100vh', backgroundColor: G.cream,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif", overflow: 'hidden',
    }}>
      <style>{chatStyles}</style>

      {/* ── HEADER ── */}
      <header style={{
        backgroundColor: 'rgba(250,249,246,0.95)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${G.border}`, flexShrink: 0, zIndex: 10,
      }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto', padding: '0 24px', height: '68px',
          display: 'flex', alignItems: 'center', gap: '14px',
        }}>
          <Link to="/chats" className="nav-link" style={{ flexShrink: 0 }}>
            <ArrowLeft style={{ width: '18px', height: '18px' }} />
          </Link>

          <div style={{
            width: '42px', height: '42px', borderRadius: '50%',
            background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: `0 0 0 3px ${G.green100}`,
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 700, color: '#fff' }}>
              {sellerInitial}
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* ← real seller name here */}
            <div style={{
              fontFamily: "'Fraunces', serif", fontSize: '17px', fontWeight: 600,
              color: G.charcoal, letterSpacing: '-0.01em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {displayName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
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

          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: isConnected ? G.green50 : G.sand,
            border: `1px solid ${isConnected ? G.green100 : G.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isConnected
              ? <Wifi    style={{ width: '16px', height: '16px', color: G.green600 }} />
              : <WifiOff style={{ width: '16px', height: '16px', color: G.muted }} />
            }
          </div>
        </div>
      </header>

      {/* ── MESSAGES ── */}
      <div ref={scrollRef} className="messages-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto', paddingTop: '16px', paddingBottom: '12px' }}>

          {hasMore && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button
                className="load-more-btn"
                disabled={isLoadingMore}
                onClick={() => cursor && fetchHistory(cursor)}
              >
                {isLoadingMore
                  ? <><span className="spinner" /> Loading…</>
                  : <><ChevronUp style={{ width: '13px', height: '13px' }} /> Load older messages</>
                }
              </button>
            </div>
          )}

          {isLoadingHistory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '24px 0', animation: 'fadeIn 0.3s ease' }}>
              {[70, 50, 85, 60].map((w, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                  <div style={{ width: `${w}%`, height: '40px', borderRadius: '16px', background: G.sand, opacity: 0.6 }} />
                </div>
              ))}
            </div>
          )}

          {!isLoadingHistory && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0 32px', animation: 'fadeIn 0.5s ease' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${G.green700}, ${G.green500})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', boxShadow: `0 0 0 6px ${G.green100}`,
              }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: '26px', fontWeight: 700, color: '#fff' }}>
                  {sellerInitial}
                </span>
              </div>
              <p style={{
                fontFamily: "'Fraunces', serif", fontSize: '18px', fontWeight: 600,
                color: G.charcoal, marginBottom: '6px', letterSpacing: '-0.01em',
              }}>Say hello to {sellerName || '…'}!</p>
              <p style={{ fontSize: '14px', color: G.muted, lineHeight: 1.6 }}>
                Ask if the item is available or negotiate a price.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                {SUGGESTED.map((s) => (
                  <button key={s} className="suggested-msg" onClick={() => handleSuggested(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {!isLoadingHistory && grouped.map(({ date, msgs }) => (
            <div key={date}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0 16px' }}>
                <div style={{ flex: 1, height: '1px', background: G.border }} />
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: G.muted,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  fontFamily: "'DM Sans', sans-serif", padding: '4px 10px',
                  background: G.sand, borderRadius: '100px', border: `1px solid ${G.border}`,
                }}>{date}</span>
                <div style={{ flex: 1, height: '1px', background: G.border }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {msgs.map((msg, idx) => {
                  const isOwn   = msg.senderId === user._id;
                  const compact = idx > 0 && msgs[idx - 1].senderId === msg.senderId;

                  return (
                    <div
                      key={msg.idempotencyKey}
                      className={isOwn ? 'msg-own' : 'msg-other'}
                      style={{
                        display:        'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        marginTop:      compact ? '2px' : '6px',
                      }}
                    >
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
                          borderRadius: isOwn ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                          fontSize: '14px', lineHeight: 1.55,
                          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                          fontFamily: "'DM Sans', sans-serif",
                          ...(msg.status === 'failed' ? {
                            background: G.red50, color: G.ink,
                            border: `1.5px solid ${G.red100}`,
                          } : isOwn ? {
                            background: `linear-gradient(135deg, ${G.green600}, ${G.green700})`,
                            color: '#fff',
                            boxShadow: '0 4px 16px rgba(22,163,74,0.2)',
                            opacity: msg.status === 'sending' ? 0.75 : 1,
                            transition: 'opacity 0.2s',
                          } : {
                            background: '#fff', color: G.ink,
                            border: `1px solid ${G.border}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }),
                        }}>
                          {msg.text}
                        </div>

                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          gap: '4px', marginTop: '4px',
                        }}>
                          {msg.status === 'sending' && isOwn && (
                            <Clock style={{ width: '10px', height: '10px', color: G.muted }} />
                          )}
                          <p style={{ fontSize: '11px', color: G.muted, fontFamily: "'DM Sans', sans-serif" }}>
                            {msg.status === 'sending'
                              ? 'Sending…'
                              : msg.status === 'failed'
                              ? <span style={{ color: G.red500 }}>Failed · </span>
                              : formatTimestamp(msg.timestamp)
                            }
                          </p>
                          {msg.status === 'failed' && isOwn && (
                            <button className="retry-btn" onClick={() => handleRetry(msg)}>
                              <RefreshCw style={{ width: '10px', height: '10px' }} /> Retry
                            </button>
                          )}
                        </div>
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
      <div style={{ flexShrink: 0, background: G.green50, borderTop: `1px solid ${G.green100}` }}>
        <div style={{
          maxWidth: '760px', margin: '0 auto', padding: '9px 24px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <ShieldCheck style={{ width: '13px', height: '13px', color: G.green600, flexShrink: 0 }} />
          <p style={{ fontSize: '12px', color: G.green700, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            Meet in public campus areas · Never share personal contact info
          </p>
        </div>
      </div>

      {/* ── INPUT ── */}
      <div style={{
        flexShrink: 0, backgroundColor: 'rgba(250,249,246,0.97)',
        backdropFilter: 'blur(16px)', borderTop: `1px solid ${G.border}`,
        padding: '14px 24px 20px',
      }}>
        <form
          onSubmit={handleSend}
          style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <input
            ref={inputRef}
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any); }
            }}
            placeholder={isConnected ? 'Type a message…' : 'Connecting…'}
            autoComplete="off"
            disabled={!isConnected}
          />
          <button type="submit" className="send-btn" disabled={!canSend} title="Send">
            <Send style={{ width: '18px', height: '18px', color: '#fff' }} />
          </button>
        </form>
      </div>
    </div>
  );
}