import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ShieldCheck,
  ShieldAlert,
  Package,
  MessageCircle,
  User,
  Store,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

interface Listing {
  _id: string;
  title: string;
  price: number;
  condition: string;
  image?: string;
  category?: string;
  seller: {
    name: string;
    studentVerified: boolean;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Only show 3 most recent on dashboard
        setRecentListings(res.data.slice(0, 3));
      } catch (err: any) {
        setError('Could not load listings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (!user) return null;

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
                {user.studentVerified ? (
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

            {/* Only show List Item button to verified students */}
            {user.studentVerified ? (
              <Link
                to="/add-listing"
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 self-start"
              >
                + List Item
              </Link>
            ) : (
              <button
                disabled
                title="Verify your college email to sell"
                className="px-6 py-2.5 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed self-start"
              >
                + List Item
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Notice for Gmail users */}
      {!user.studentVerified && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Verify your college email to start selling
              </h3>
              <p className="text-sm text-amber-800">
                You can browse and buy items, but need a verified college email to list items for sale.{' '}
                <Link to="/profile" className="underline font-medium">
                  Verify now →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/browse" className="bg-white p-6 rounded-lg border hover:shadow-md transition">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Browse Items</h3>
            <p className="text-sm text-gray-600">Find resources</p>
          </Link>

          <Link to="/my-listings" className="bg-white p-6 rounded-lg border hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">My Listings</h3>
            <p className="text-sm text-gray-600">Manage items</p>
          </Link>

          <Link to="/chat" className="bg-white p-6 rounded-lg border hover:shadow-md transition">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Chats</h3>
            <p className="text-sm text-gray-600">Your messages</p>
          </Link>

          <Link to="/profile" className="bg-white p-6 rounded-lg border hover:shadow-md transition">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-gray-600">Your account</p>
          </Link>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Items from Your Campus</h2>
            <Link to="/browse" className="text-green-600 text-sm font-medium">
              View All →
            </Link>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Empty */}
          {!isLoading && !error && recentListings.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No listings yet on your campus.</p>
              {user.studentVerified && (
                <Link
                  to="/add-listing"
                  className="mt-3 inline-block text-sm text-green-600 font-medium"
                >
                  Be the first to list something →
                </Link>
              )}
            </div>
          )}

          {/* Listings Grid */}
          {!isLoading && !error && recentListings.length > 0 && (
            <div className="grid md:grid-cols-3 gap-6">
              {recentListings.map((listing) => (
                <Link
                  to={`/item/${listing._id}`}
                  key={listing._id}
                  className="group block"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-3">
                    {listing.image ? (
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold mb-1 group-hover:text-green-600 line-clamp-1">
                    {listing.title}
                  </h3>

                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">₹{listing.price}</p>
                    <span className="text-sm text-gray-500">{listing.condition}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">{listing.seller.name}</span>
                    {listing.seller.studentVerified && (
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
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