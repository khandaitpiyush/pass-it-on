import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMockItems } from '../utils/mockData';
import {
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Calendar,
  Tag,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  if (!user || !itemId) return null;

  const item = getMockItems(user.collegeCode).find((i) => i.id === itemId);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Item not found
          </h2>
          <Link to="/browse" className="text-green-600 hover:text-green-700">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwnItem = item.sellerId === user.userId;
  const status = item.status; // ✅ single source of truth

  const handleChatWithSeller = () => {
    navigate('/chat/chat1');
  };

  const statusBadge = () => {
    if (status === 'available') {
      return (
        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          Available
        </span>
      );
    }
    if (status === 'reserved') {
      return (
        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
          Reserved
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
        Sold
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Browse
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg border overflow-hidden mb-4">
              <div className="aspect-square bg-gray-100">
                <img
                  src={item.images[selectedImage]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? 'border-green-600'
                        : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
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
          <div>
            <div className="bg-white rounded-lg border p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  {item.title}
                </h1>
                {statusBadge()}
              </div>

              <p className="text-3xl font-bold text-gray-900 mb-6">
                ₹{item.price}
              </p>

              {/* 🟢 Layer 1: Gentle Seller Reminder */}
              {isOwnItem && status !== 'sold' && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Have you sold this item?
                    </p>
                    <p className="text-sm text-blue-800">
                      Mark it as <strong>Sold</strong> to keep the marketplace
                      clean.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6 border-b pb-6">
                <div>
                  <p className="text-sm text-gray-600">Condition</p>
                  <p className="font-semibold">{item.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{item.category}</p>
                </div>
              </div>

              <div className="mb-6 border-b pb-6">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{item.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="font-semibold mb-3">Seller Information</h2>
                <div className="flex gap-4">
                  <img
                    src={item.sellerAvatar}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.sellerName}</p>
                      {item.sellerVerified ? (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.sellerBranch} • {item.sellerYear}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA / Seller Controls */}
              {!isOwnItem && status !== 'sold' && (
                <button
                  onClick={handleChatWithSeller}
                  className="w-full py-3 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 font-semibold"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat with Seller
                </button>
              )}

              {!isOwnItem && status === 'sold' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
                  This item has been sold
                </div>
              )}

              {isOwnItem && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Manage your listing
                  </p>
                  <div className="flex gap-3">
                    <button className="flex-1 py-2 border rounded-lg flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      Mark Reserved
                    </button>
                    <button className="flex-1 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Mark Sold
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                Category: {item.category}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Calendar className="w-4 h-4" />
                Posted {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
