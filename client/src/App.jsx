import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import ConsentGate from './pages/ConsentGate'
import WritePage from './pages/WritePage'
import MyPosts from './pages/MyPosts'
import PostPage from './pages/PostPage'
import ProfilePage from './pages/ProfilePage'
import TagPage from './pages/TagPage'
import SearchResults from './pages/SearchResults'
import Settings from './pages/Settings'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Guidelines from './pages/Guidelines'
import AuthCallback from './pages/AuthCallback'

function ProtectedRoute({ children, skipConsentCheck = false }) {
  const { user, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-faint text-sm">Loading…</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/signin" state={{ from: location }} replace />

  if (!skipConsentCheck && profile !== undefined && !profile?.terms_accepted_at) {
    return <Navigate to="/consent" replace />
  }

  return children
}

// Globally redirects first-time users to consent gate after Google OAuth
function ConsentGuard() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading || !user || !profile) return
    const exempt = ['/consent', '/terms', '/privacy', '/guidelines', '/signin']
    if (!profile.terms_accepted_at && !exempt.includes(location.pathname)) {
      navigate('/consent', { replace: true })
    }
  }, [user, profile, loading, location.pathname, navigate])

  return null
}

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <ConsentGuard />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guidelines" element={<Guidelines />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/tag/:slug" element={<TagPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/consent" element={
            <ProtectedRoute skipConsentCheck>
              <ConsentGate />
            </ProtectedRoute>
          } />
          <Route path="/write" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
          <Route path="/write/:id" element={<ProtectedRoute><WritePage /></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><MyPosts /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/@:username/:slug" element={<PostPage />} />
          <Route path="/@:username" element={<ProfilePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
