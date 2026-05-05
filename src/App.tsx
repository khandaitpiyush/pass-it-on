import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

/* ── LAZY PAGE IMPORTS ── */
const LandingPage       = lazy(() => import('./pages/LandingPage'))
const LoginPage         = lazy(() => import('./pages/LoginPage'))
const SignupPage        = lazy(() => import('./pages/SignupPage'))
const SelectCampusPage  = lazy(() => import('./pages/SelectCampusPage'))
const Dashboard         = lazy(() => import('./pages/Dashboard'))
const BrowsePage        = lazy(() => import('./pages/BrowsePage'))
const ItemDetailPage    = lazy(() => import('./pages/ItemDetailPage'))
const AddListingPage    = lazy(() => import('./pages/AddListingPage'))
const ChatPage          = lazy(() => import('./pages/ChatPage'))
const ChatsPage         = lazy(() => import('./pages/ChatsPage'))
const ProfilePage       = lazy(() => import('./pages/ProfilePage'))
const MyListingsPage    = lazy(() => import('./pages/MyListingsPage'))

/* ── LOADING SPINNER ── */
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
  </div>
)

/* ── PROTECTED ROUTE ── */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.campusId && location.pathname !== "/select-campus") {
    return <Navigate to="/select-campus" replace />
  }

  return <>{children}</>
}

/* ── PUBLIC ROUTE ── */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageLoader />

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
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

          {/* Bridge */}
          <Route path="/select-campus" element={<ProtectedRoute><SelectCampusPage /></ProtectedRoute>} />

          {/* Protected */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/browse"      element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
          <Route path="/item/:itemId" element={<ProtectedRoute><ItemDetailPage /></ProtectedRoute>} />
          <Route path="/add-listing" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Chats */}
          <Route path="/chats"        element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
          <Route path="/chat"         element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:sellerId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </Router>
  )
}