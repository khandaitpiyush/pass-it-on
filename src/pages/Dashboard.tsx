import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMockItems } from '../utils/mockData';
import {
  ShieldCheck,
  ShieldAlert,
  Package,
  MessageCircle,
  User,
  Store,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const userItems = getMockItems(user.collegeCode).slice(0, 3);

  const renderStatusBadge = (status: string) => {
    if (status === 'reserved') {
      return (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Reserved
        </span>
      );
    }
    if (status === 'sold') {
      return (
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
          <CheckCircle className="w-3 h-3" />
          Sold
        </span>
      );
    }
    return (
      <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
        Available
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {user.collegeName}
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">
                    <ShieldAlert className="w-4 h-4" />
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <Link
              to="/add-listing"
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + List Item
            </Link>
          </div>
        </div>
      </div>

      {/* Verification Notice */}
      {!user.isVerified && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Verify your college email to start selling
              </h3>
              <p className="text-sm text-amber-800">
                You can browse and buy items, but need verification to list items for sale.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/browse" className="bg-white p-6 rounded-lg border hover:shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Browse Items</h3>
            <p className="text-sm text-gray-600">Find resources</p>
          </Link>

          <Link to="/my-listings" className="bg-white p-6 rounded-lg border hover:shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">My Listings</h3>
            <p className="text-sm text-gray-600">Manage items</p>
          </Link>

          <Link to="/chat/chat1" className="bg-white p-6 rounded-lg border hover:shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Chats</h3>
            <p className="text-sm text-gray-600">Your messages</p>
          </Link>

          <Link to="/profile" className="bg-white p-6 rounded-lg border hover:shadow-md">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-gray-600">Your account</p>
          </Link>
        </div>

        {/* Recent Items */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Items from Your College</h2>
            <Link to="/browse" className="text-green-600 text-sm font-medium">
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {userItems.map((item) => {
              const isSold = item.status === 'sold';

              return (
                <div
                  key={item.id}
                  className={`group ${isSold ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {renderStatusBadge(item.status)}
                  </div>

                  {!isSold ? (
                    <Link to={`/item/${item.id}`}>
                      <h3 className="font-semibold mb-1 group-hover:text-green-600">
                        {item.title}
                      </h3>
                    </Link>
                  ) : (
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                  )}

                  <div className="flex justify-between">
                    <p className="text-lg font-bold">₹{item.price}</p>
                    <span className="text-sm text-gray-600">{item.condition}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Info */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Campus Safety Reminder</h3>
          <p className="text-sm text-green-800">
            Always meet in public campus locations during daytime hours.
          </p>
        </div>
      </div>
    </div>
  );
}
