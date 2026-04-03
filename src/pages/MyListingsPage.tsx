import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMockItems } from '../utils/mockData';
import {
  ArrowLeft,
  Package,
  Edit2,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  Info
} from 'lucide-react';

export default function MyListingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Demo data: assume these belong to the logged-in seller
  const myListings = getMockItems(user.collegeCode).slice(0, 4);

  const renderStatusBadge = (status: string) => {
    if (status === 'reserved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Reserved
        </span>
      );
    }
    if (status === 'sold') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
          <CheckCircle className="w-3 h-3" />
          Sold
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
        Available
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
              <p className="text-sm text-gray-600">Manage your listed items</p>
            </div>
            <Link
              to="/add-listing"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add New
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {myListings.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">
              Start selling your academic resources
            </p>
            <Link
              to="/add-listing"
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myListings.map((item) => {
              const needsReminder = item.status !== 'sold';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
                >
                  {/* 🟢 Layer 1: Gentle Seller Reminder */}
                  {needsReminder && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Have you sold this item? Mark it as <strong>Sold</strong> to
                        keep listings accurate.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span>Category: {item.category}</span>
                            <span>•</span>
                            <span>Condition: {item.condition}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold">₹{item.price}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Listed {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{Math.floor(Math.random() * 100) + 20} views</span>
                        </div>
                        {renderStatusBadge(item.status)}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/item/${item.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>

                        <button className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>

                        <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Tips for Better Sales
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, well-lit photos</li>
            <li>• Write honest descriptions</li>
            <li>• Price fairly based on condition</li>
            <li>• Update status after selling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
