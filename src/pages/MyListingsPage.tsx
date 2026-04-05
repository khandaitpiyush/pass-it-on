import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft,
  Package,
  Trash2,
  Eye,
  Info,
  ShieldAlert,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

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

export default function MyListingsPage() {
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter to only this user's listings
        const mine = res.data.filter(
          (l: any) =>
            l.seller._id === user?._id || l.seller === user?._id
        );
        setListings(mine);
      } catch (err: any) {
        setError('Could not load your listings.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchMyListings();
  }, [user]);

  if (!user) return null;

  // Non-verified users can't have listings but may land here
  if (!user.studentVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white border rounded-xl p-10 max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verified Students Only
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              You need a verified college email to list and manage items for sale.
            </p>
            <Link
              to="/profile"
              className="inline-block px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Verify College Email
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async (listingId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this listing?'
    );
    if (!confirmed) return;

    setDeletingId(listingId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
              <p className="text-sm text-gray-500">Manage your listed items</p>
            </div>
            <Link
              to="/add-listing"
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              + Add New
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border p-6 animate-pulse flex gap-6"
              >
                <div className="w-40 h-40 bg-gray-200 rounded-lg shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="text-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-sm text-green-600 font-medium hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && listings.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Start selling your academic resources to your campus.
            </p>
            <Link
              to="/add-listing"
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Create Your First Listing
            </Link>
          </div>
        )}

        {/* Listings */}
        {!isLoading && !error && listings.length > 0 && (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
              >
                {/* Reminder banner */}
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-blue-800">
                    Sold this item offline? Delete this listing to keep your campus marketplace accurate.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">

                  {/* Image */}
                  <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    {listing.image ? (
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {listing.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          {listing.category && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                              {listing.category}
                            </span>
                          )}
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                            {listing.condition}
                          </span>
                          {listing.semester && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                              {listing.semester}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{listing.price}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Listed{' '}
                          {new Date(listing.createdAt).toLocaleDateString(
                            'en-IN',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-3 border-t">
                      <Link
                        to={`/item/${listing._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>

                      <button
                        onClick={() => handleDelete(listing._id)}
                        disabled={deletingId === listing._id}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingId === listing._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {!isLoading && listings.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Tips for Better Sales
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use clear, well-lit photos</li>
              <li>• Write honest descriptions</li>
              <li>• Price fairly based on condition</li>
              <li>• Delete listing after selling offline</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}