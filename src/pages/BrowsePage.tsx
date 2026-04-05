import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  Search,
  Filter,
  ShieldCheck,
  ArrowLeft,
  Package,
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const CATEGORIES = [
  'Textbooks',
  'Notes',
  'Lab Equipment',
  'Electronics',
  'Stationery',
  'Other',
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const CONDITIONS = ['Like New', 'Good', 'Fair', 'Used'];

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category?: string;
  semester?: string;
  image?: string;
  seller: {
    name: string;
    studentVerified: boolean;
  };
}

export default function BrowsePage() {
  const { user } = useAuth();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/listings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(res.data);
      } catch (err: any) {
        setError('Could not load listings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (!user) return null;

  // All filtering done client-side after single fetch
  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || listing.category === selectedCategory;

    const matchesSemester =
      !selectedSemester || listing.semester === selectedSemester;

    const matchesCondition =
      !selectedCondition || listing.condition === selectedCondition;

    const matchesPrice = listing.price <= maxPrice;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSemester &&
      matchesCondition &&
      matchesPrice
    );
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSemester('');
    setSelectedCondition('');
    setMaxPrice(2000);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedSemester ||
    selectedCondition ||
    maxPrice < 2000;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
              <p className="text-sm text-gray-500">
                Showing items from your campus only
              </p>
            </div>
          </div>

          {/* Search + Filter toggle */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search textbooks, calculators, lab equipment..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 text-sm transition ${
                showFilters || hasActiveFilters
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* Filter Sidebar */}
        <div className={`lg:w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border rounded-lg p-5 sticky top-28">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-green-600 font-medium hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">All Semesters</option>
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Max Price: ₹{maxPrice}
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹0</span>
                <span>₹2000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="flex-1">

          {/* Result count */}
          {!isLoading && !error && (
            <div className="mb-4 text-sm text-gray-500">
              {filteredListings.length}{' '}
              {filteredListings.length === 1 ? 'item' : 'items'} found
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
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
          {!isLoading && !error && filteredListings.length === 0 && (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No items found</p>
              <p className="text-sm text-gray-400 mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'No listings on your campus yet'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm text-green-600 font-medium hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && filteredListings.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Link
                  to={`/item/${listing._id}`}
                  key={listing._id}
                  className="bg-white border rounded-lg hover:shadow-lg transition group overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 overflow-hidden">
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

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-green-600 transition">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-3">
                      {listing.description}
                    </p>

                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xl font-bold text-gray-900">
                        ₹{listing.price}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {listing.condition}
                      </span>
                    </div>

                    {/* Seller */}
                    <div className="flex items-center gap-1.5 border-t pt-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-green-700">
                          {listing.seller.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 truncate">
                        {listing.seller.name}
                      </span>
                      {listing.seller.studentVerified && (
                        <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}