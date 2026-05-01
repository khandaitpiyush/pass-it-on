import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, Info, Package } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function ChatPage() {
  // sellerId comes from /chat/:sellerId (set when buyer clicks "Chat with Seller")
  const { sellerId } = useParams<{ sellerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Room ID is deterministic — same two users always get the same room
  // regardless of who initiates. Sorting ensures buyer/seller get same string.
  const roomId =
    user && sellerId
      ? [user._id, sellerId].sort().join('_')
      : null;

  useEffect(() => {
    if (!roomId) return;

    // Connect socket
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current?.emit('join_room', roomId);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Receive messages from the other user
    socketRef.current.on('receive_message', (data: Message) => {
      setMessages((prev) => {
        // Avoid duplicates — our own sent messages are added optimistically
        if (prev.find((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  // /chat with no sellerId — show empty state
  if (!sellerId) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/dashboard">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h2 className="font-semibold text-gray-900">Chats</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No chat selected</p>
            <p className="text-sm text-gray-400 mt-1">
              Find an item and tap "Chat with Seller" to start a conversation.
            </p>
            <Link
              to="/browse"
              className="mt-4 inline-block text-sm text-green-600 font-medium hover:underline"
            >
              Browse Items →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Chatting with yourself
  if (sellerId === user._id) {
    navigate('/browse');
    return null;
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !roomId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user._id,
      text: message.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistic update — add to UI immediately
    setMessages((prev) => [...prev, newMessage]);

    // Emit to room
    socketRef.current?.emit('send_message', {
      ...newMessage,
      roomId,
    });

    setMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/browse" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>

          {/* Seller avatar — initial letter */}
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-green-700">
              {sellerId.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">Seller</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

          {/* First message prompt */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">
                Start the conversation — ask if the item is still available.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwn = msg.senderId === user._id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      isOwn
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p
                    className={`text-xs text-gray-400 mt-1 ${
                      isOwn ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Safety notice */}
      <div className="bg-blue-50 border-t border-blue-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-2 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          Meet on campus in public areas. Avoid sharing personal contact details.
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t flex-shrink-0">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto px-4 py-4 flex gap-3"
        >
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 hover:bg-green-700 transition text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>

    </div>
  );
}