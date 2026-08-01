import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { api } from './lib/api'
import Header from './components/Header'
import Footer from './components/Footer'
import Sidebar from './components/Sidebar'
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
import Bookmarks from './pages/Bookmarks'
import About from './pages/About'
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
    const exempt = ['/consent', '/terms', '/privacy', '/guidelines', '/about', '/signin']
    if (!profile.terms_accepted_at && !exempt.includes(location.pathname)) {
      navigate('/consent', { replace: true })
    }
  }, [user, profile, loading, location.pathname, navigate])

  return null
}

// /profile/:username → canonical /u/:username
function ProfileRedirect() {
  const { username } = useParams()
  return <Navigate to={`/u/${username}`} replace />
}

// Catches old /@username/slug and /@username links (retired routing scheme) and
// anything else unmatched, redirecting where possible instead of rendering blank.
function NotFoundOrLegacyRedirect() {
  const location = useLocation()
  const legacy = location.pathname.match(/^\/@([^/]+)(?:\/([^/]+))?\/?$/)

  if (legacy) {
    const [, username, slug] = legacy
    return <Navigate to={slug ? `/posts/${slug}` : `/u/${username}`} replace />
  }

  return (
    <div className="max-w-feed mx-auto px-6 py-24 text-center">
      <p className="font-serif text-2xl text-faint mb-4">Page not found.</p>
      <Link to="/" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">← Back home</Link>
    </div>
  )
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tags, setTags] = useState([])
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => setSidebarOpen(false), [location.pathname])

  // React Router doesn't reset focus on navigation — without this, a screen
  // reader user who follows a link stays announced on whatever they just
  // clicked, with no signal a new page loaded. Skipped on the actual initial
  // page load (location.key === 'default', react-router's own marker for
  // the first history entry): stealing focus to <main> there would jump
  // past the skip link and header before the user ever gets a chance to tab
  // to them. (A ref-based "have we rendered before" flag looks equivalent
  // but isn't — React 18 StrictMode double-invokes this effect in dev, and
  // the ref's mutation survives between those two invocations, so the
  // second one sees the guard as already tripped and fires anyway.)
  useEffect(() => {
    if (location.key === 'default') return
    mainRef.current?.focus()
  }, [location.pathname, location.key])

  useEffect(() => {
    api.get('/api/tags').then(data => setTags(data.tags)).catch(() => setTags([]))
  }, [])

  // The home page already has its own tag tabs + contributors rail, so a second
  // "browse by tag" nav there is redundant. Elsewhere, hide it if there's simply
  // nothing to browse yet instead of showing an empty box.
  const showSidebar = tags.length > 0 && location.pathname !== '/'

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ConsentGuard />
      <Header onMenuClick={() => setSidebarOpen(o => !o)} showMenuButton={showSidebar} sidebarOpen={sidebarOpen} />
      <div className="flex-1 flex items-start">
        {showSidebar && (
          <Sidebar tags={tags} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 min-w-0 focus:outline-none">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/about" element={<About />} />
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
            <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
            <Route path="/posts/:slug" element={<PostPage />} />
            <Route path="/u/:username" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfileRedirect />} />
            <Route path="*" element={<NotFoundOrLegacyRedirect />} />
          </Routes>
        </main>
      </div>
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
