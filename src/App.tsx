import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

/* ── PAGE IMPORTS ── */
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SelectCampusPage from './pages/SelectCampusPage'
import Dashboard from './pages/Dashboard'
import BrowsePage from './pages/BrowsePage'
import ItemDetailPage from './pages/ItemDetailPage'
import AddListingPage from './pages/AddListingPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import MyListingsPage from './pages/MyListingsPage'

/* ── PROTECTED ROUTE ── */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Force campus selection for users without a campusId
  if (!user.campusId && location.pathname !== "/select-campus") {
    return <Navigate to="/select-campus" replace />
  }

  return <>{children}</>
}

/* ── PUBLIC ROUTE ── */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    if (!user.campusId) return <Navigate to="/select-campus" replace />
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

/* ── MAIN APP ── */
export default function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={<PublicRoute><LoginPage /></PublicRoute>}
        />
        <Route
          path="/signup"
          element={<PublicRoute><SignupPage /></PublicRoute>}
        />

        {/* Bridge — logged in but no campus yet */}
        <Route
          path="/select-campus"
          element={<ProtectedRoute><SelectCampusPage /></ProtectedRoute>}
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/browse"
          element={<ProtectedRoute><BrowsePage /></ProtectedRoute>}
        />
        <Route
          path="/item/:itemId"
          element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/add-listing"
          element={<ProtectedRoute><AddListingPage /></ProtectedRoute>}
        />
        <Route
          path="/my-listings"
          element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />

        {/* Chat — both /chat and /chat/:sellerId */}
        <Route
          path="/chat"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />
        <Route
          path="/chat/:sellerId"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  )
}