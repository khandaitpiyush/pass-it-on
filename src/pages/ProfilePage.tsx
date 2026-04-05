import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  Mail,
  GraduationCap,
  Calendar,
  LogOut,
  User as UserIcon,
  Package,
  CheckCircle,
} from 'lucide-react';

const API = 'http://localhost:5000/api/auth';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // OTP verification flow state
  const [showOtpFlow, setShowOtpFlow] = useState(false);
  const [collegeEmail, setCollegeEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Listing count state
  const [listingCount, setListingCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchListingCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/listings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Count only listings belonging to this user
        const myListings = res.data.filter(
          (l: any) => l.seller._id === user?._id || l.seller === user?._id
        );
        setListingCount(myListings.length);
      } catch {
        setListingCount(0);
      }
    };

    if (user) fetchListingCount();
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* ---------- SEND OTP ---------- */
  const handleSendOtp = async () => {
    setOtpError('');
    if (!collegeEmail.trim()) {
      setOtpError('Please enter your college email.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await axios.post(`${API}/send-otp`, { email: collegeEmail });
      setOtpSent(true);
      setOtpSuccess('OTP sent! Check your college inbox.');
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  /* ---------- VERIFY OTP ---------- */
  const handleVerifyOtp = async () => {
    setOtpError('');
    if (!otp.trim()) {
      setOtpError('Please enter the OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await axios.post(`${API}/verify-otp`, {
        email: collegeEmail,
        otp,
      });

      // Update local user state — now a verified seller
      updateUser({ studentVerified: true, emailVerified: true });

      setOtpSuccess('College email verified! You can now sell items.');
      setShowOtpFlow(false);
      setOtpSent(false);
      setCollegeEmail('');
      setOtp('');
    } catch (err: any) {
      setOtpError(err?.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar — initial letter, no external dependency */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center border-4 border-gray-100">
                <span className="text-3xl font-bold text-green-700">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${
                user.studentVerified ? 'bg-green-600' : 'bg-amber-500'
              }`}>
                {user.studentVerified
                  ? <ShieldCheck className="w-4 h-4 text-white" />
                  : <ShieldAlert className="w-4 h-4 text-white" />
                }
              </div>
            </div>

            {/* Name + email + badges */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
              <p className="text-gray-500 text-sm mb-3">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {user.studentVerified ? (
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
                {user.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="w-4 h-4" />
                    Email Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>

          <div className="space-y-4">

            {/* ID */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="text-sm font-medium text-gray-900 font-mono">{user._id}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* Branch */}
            {user.branch && (
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Branch</p>
                  <p className="text-sm font-medium text-gray-900">{user.branch}</p>
                </div>
              </div>
            )}

            {/* Year */}
            {user.year && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="text-sm font-medium text-gray-900">{user.year}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {listingCount === null ? '—' : listingCount}
              </p>
              <p className="text-sm text-gray-500">My Listings</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {user.studentVerified ? 'Seller' : 'Buyer'}
              </p>
              <p className="text-sm text-gray-500">Account Type</p>
            </div>
          </div>
        </div>

        {/* Verification Section — only for unverified users */}
        {!user.studentVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900">
                  Verify your college email to sell
                </h3>
                <p className="text-sm text-amber-800 mt-1">
                  Enter your college email address. We'll send you a 6-digit OTP to verify your student status.
                </p>
              </div>
            </div>

            {!showOtpFlow ? (
              <button
                onClick={() => setShowOtpFlow(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
              >
                Verify College Email
              </button>
            ) : (
              <div className="space-y-3">

                {/* Success message */}
                {otpSuccess && (
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {otpSuccess}
                  </div>
                )}

                {/* Error message */}
                {otpError && (
                  <p className="text-sm text-red-600">{otpError}</p>
                )}

                {/* College email input */}
                {!otpSent && (
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      placeholder="yourname@college.edu"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                    <button
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
                    >
                      {isSendingOtp ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                )}

                {/* OTP input */}
                {otpSent && (
                  <div className="space-y-3">
                    <p className="text-sm text-amber-800">
                      OTP sent to <strong>{collegeEmail}</strong>.{' '}
                      <button
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setOtpError('');
                          setOtpSuccess('');
                        }}
                        className="underline text-amber-700"
                      >
                        Change email
                      </button>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none tracking-widest"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition"
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancel */}
                <button
                  onClick={() => {
                    setShowOtpFlow(false);
                    setOtpSent(false);
                    setCollegeEmail('');
                    setOtp('');
                    setOtpError('');
                    setOtpSuccess('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Already verified confirmation */}
        {user.studentVerified && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Verified Seller</p>
              <p className="text-sm text-green-700">
                Your student status is verified. You can list items for sale.
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="bg-white rounded-xl border p-6">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}