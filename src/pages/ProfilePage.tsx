import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ShieldCheck, ShieldAlert, Mail, GraduationCap, Calendar, LogOut, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-gray-100"
              />
              {user.isVerified ? (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center border-2 border-white">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {user.collegeName}
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <ShieldCheck className="w-4 h-4" />
                    Verified Student
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    <ShieldAlert className="w-4 h-4" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>
          
          <div className="space-y-4">
            {/* User ID */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-medium text-gray-900">{user.userId}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* College */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">College</p>
                <p className="font-medium text-gray-900">{user.collegeName}</p>
                <p className="text-sm text-gray-500">Code: {user.collegeCode}</p>
              </div>
            </div>

            {/* Branch */}
            {user.branch && (
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Branch</p>
                  <p className="font-medium text-gray-900">{user.branch}</p>
                </div>
              </div>
            )}

            {/* Year */}
            {user.year && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-medium text-gray-900">{user.year}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Status */}
        {!user.isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Verify Your Account</h3>
                <p className="text-sm text-amber-800 mb-4">
                  Get verified to unlock the ability to list items for sale. Use your college email to verify your student status.
                </p>
                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
                  Verify College Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Stats */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 mb-1">4</p>
              <p className="text-sm text-gray-600">Listings</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 mb-1">2</p>
              <p className="text-sm text-gray-600">Sold</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 mb-1">3</p>
              <p className="text-sm text-gray-600">Purchased</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 mb-1">5</p>
              <p className="text-sm text-gray-600">Chats</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-lg border p-6">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
