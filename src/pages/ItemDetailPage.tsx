import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Calendar,
  Tag,
  Package,
  Trash2,
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
  seller: {
    _id: string;
    name: string;
    studentVerified: boolean;
    branch?: string;
    year?: string;
  };
}

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListing(res.data);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError('Failed to load listing.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) fetchListing();
  }, [itemId]);

  if (!user) return null;

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link to="/browse" className="inline-flex items-center gap-2 text-gray-600">
              <ArrowLeft className="w-5 h-5" />
              Back to Browse
            </Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- NOT FOUND ---------- */
  if (notFound || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Item not found
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            This listing may have been deleted.
          </p>
          <Link to="/browse" className="text-green-600 font-medium hover:underline">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-green-600 font-medium hover:underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isOwnListing = listing.seller._id === user._id;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this listing?'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/listings/${listing._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/my-listings');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete listing.');
      setIsDeleting(false);
    }
  };

  const handleChatWithSeller = () => {
    // Chat feature — navigate to chat with seller context
    navigate(`/chat/${listing.seller._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Browse
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Image */}
          <div>
            <div className="bg-white rounded-xl border overflow-hidden mb-4">
              <div className="aspect-square bg-gray-100">
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Safety notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 text-sm mb-1">
                    Meet on Campus for Safe Exchange
                  </h3>
                  <p className="text-sm text-green-800">
                    Meet in public campus locations during daytime and inspect
                    before purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">

            {/* Main card */}
            <div className="bg-white rounded-xl border p-6">

              {/* Title + price */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <p className="text-3xl font-bold text-gray-900 mb-6">
                ₹{listing.price}
              </p>

              {/* Condition + Category */}
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Condition</p>
                  <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-full">
                    {listing.condition}
                  </span>
                </div>
                {listing.category && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-full">
                      {listing.category}
                    </span>
                  </div>
                )}
                {listing.semester && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Semester</p>
                    <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-full">
                      {listing.semester}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6 pb-6 border-b">
                <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Seller info */}
              <div className="mb-6">
                <h2 className="font-semibold text-gray-900 mb-3">
                  Seller Information
                </h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-green-700">
                      {listing.seller.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        {listing.seller.name}
                      </p>
                      {listing.seller.studentVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                    {(listing.seller.branch || listing.seller.year) && (
                      <p className="text-sm text-gray-500">
                        {[listing.seller.branch, listing.seller.year]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              {!isOwnListing && (
                <button
                  onClick={handleChatWithSeller}
                  className="w-full py-3 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-green-700 transition"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat with Seller
                </button>
              )}

              {/* Owner controls */}
              {isOwnListing && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 text-center">
                    This is your listing
                  </p>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full py-3 border border-red-300 text-red-600 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete Listing'}
                  </button>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="bg-white rounded-xl border p-4 space-y-2">
              {listing.category && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag className="w-4 h-4" />
                  {listing.category}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Posted{' '}
                {new Date(listing.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}