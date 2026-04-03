import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMockChats, Message } from '../utils/mockData';
import {
  ArrowLeft,
  Send,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [buyerResponse, setBuyerResponse] = useState<'yes' | 'no' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  if (!user || !chatId) return null;

  const chat = getMockChats(user.userId, user.collegeCode).find(
    (c) => c.id === chatId
  );

  if (!chat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Chat not found</h2>
          <Link to="/dashboard" className="text-green-600">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isBuyer = chat.participantId !== user.userId;

  const initialMessages: Message[] = [
    {
      id: '1',
      chatId,
      senderId: chat.participantId,
      text: 'Hi! Is this item still available?',
      timestamp: '2026-01-18T10:00:00Z'
    },
    {
      id: '2',
      chatId,
      senderId: user.userId,
      text: 'Yes, it is! Are you interested?',
      timestamp: '2026-01-18T10:05:00Z'
    },
    {
      id: '3',
      chatId,
      senderId: chat.participantId,
      text: 'Yes, can we meet at the library tomorrow?',
      timestamp: '2026-01-18T10:10:00Z'
    },
    {
      id: '4',
      chatId,
      senderId: user.userId,
      text: 'Sure! 2 PM at the main entrance?',
      timestamp: '2026-01-18T14:15:00Z'
    }
  ];

  useEffect(() => {
    setMessages(initialMessages);

    socketRef.current = io('http://localhost:3001', {
      autoConnect: false
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        chatId,
        senderId: user.userId,
        text: message.trim(),
        timestamp: new Date().toISOString()
      }
    ]);

    setMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <img
            src={chat.participantAvatar}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h2 className="font-semibold text-gray-900">
              {chat.participantName}
            </h2>
            <p className="text-sm text-gray-600">{user.collegeName}</p>
          </div>
        </div>
      </div>

      {/* Item Context */}
      <div className="bg-green-50 border-b flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src={chat.itemImage}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {chat.itemTitle}
            </p>
            <p className="text-sm text-gray-600">₹{chat.itemPrice}</p>
          </div>
          <Link
            to={`/item/${chat.itemId}`}
            className="text-sm text-green-600 font-medium"
          >
            View Item
          </Link>
        </div>
      </div>

      {/* 🟡 Buyer Confirmation Prompt */}
      {isBuyer && buyerResponse === null && (
        <div className="bg-yellow-50 border-b border-yellow-200 flex-shrink-0">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <p className="text-sm font-medium mb-2">
              Did you complete this purchase?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBuyerResponse('yes')}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg flex items-center gap-1 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Yes, I received it
              </button>
              <button
                onClick={() => setBuyerResponse('no')}
                className="px-3 py-1.5 border rounded-lg flex items-center gap-1 text-sm"
              >
                <XCircle className="w-4 h-4" />
                Not yet
              </button>
            </div>
          </div>
        </div>
      )}

      {buyerResponse === 'yes' && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2 text-sm text-green-800">
          Thanks! We’ve notified the seller to update the item status.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderId === user.userId;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md ${
                    isOwn ? 'order-2' : 'order-1'
                  }`}
                >
                  <div
                    className={`px-4 py-2.5 rounded-2xl ${
                      isOwn
                        ? 'bg-green-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  </div>
                  <p
                    className={`text-xs text-gray-500 mt-1 ${
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

      {/* Safety */}
      <div className="bg-blue-50 border-t border-blue-200 flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-2 text-sm text-blue-800">
          <Info className="w-4 h-4 mt-0.5" />
          Meet on campus. Avoid sharing personal contact details.
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
            className="flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
