import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMockItems, CATEGORIES, SEMESTERS } from '../utils/mockData';
import {
  Search,
  Filter,
  ShieldCheck,
  ArrowLeft,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function BrowsePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  if (!user) return null;

  const allItems = getMockItems(user.collegeCode);

  const filteredItems = allItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSemester = !selectedSemester || item.semester === selectedSemester;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesSemester && matchesPrice;
  });

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
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Items</h1>
              <p className="text-sm text-gray-600">
                Showing items from {user.collegeName}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for textbooks, calculators, lab equipment..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Filters */}
        <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="font-semibold mb-4">Filters</h2>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full mb-4 border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full mb-4 border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>

            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([0, Number(e.target.value)])}
              className="w-full mb-2"
            />

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedSemester('');
                setPriceRange([0, 2000]);
              }}
              className="text-sm text-green-600 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-gray-600">
            {filteredItems.length} items found
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isSold = item.status === 'sold';

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-lg transition ${
                    isSold ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      {renderStatusBadge(item.status)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {item.description}
                    </p>

                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xl font-bold">₹{item.price}</p>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {item.condition}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 border-t pt-2">
                      <img src={item.sellerAvatar} className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-gray-600 truncate">
                        {item.sellerName}
                      </span>
                      {item.sellerVerified && (
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                      )}
                    </div>

                    {!isSold && (
                      <Link
                        to={`/item/${item.id}`}
                        className="block mt-3 text-center text-sm font-medium text-green-600 hover:text-green-700"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
