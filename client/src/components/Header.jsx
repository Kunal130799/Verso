import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Header({ onMenuClick, showMenuButton, sidebarOpen }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')

  const handleSearch = e => {
    e.preventDefault()
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-wide mx-auto px-6 h-16 flex items-center gap-4">
        {/* Sidebar toggle (mobile/tablet only, and only when there's a sidebar to show) */}
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            aria-label="Toggle navigation"
            aria-expanded={sidebarOpen}
            className="lg:hidden p-1.5 -ml-1.5 rounded text-faint hover:text-signature transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
          <img src="/verso-logo.png" alt="Verso" className="h-7 w-auto logo-light" />
          <img src="/verso-logo-dark.png" alt="Verso" className="h-7 w-auto logo-dark" />
          <span className="hidden md:block text-xs font-sans tracking-[0.2em] uppercase text-faint">
            A quieter place
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} role="search" className="flex-1 max-w-xs hidden sm:block">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search posts…"
            aria-label="Search posts"
            className="w-full px-3 py-1.5 text-sm bg-paper border border-wire rounded-md text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors"
          />
        </form>

        <nav aria-label="Account" className="flex items-center gap-3 ml-auto">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to="/write"
                className="px-4 py-1.5 text-sm font-sans font-medium rounded-lg transition-colors hover:shadow-[0_0_16px_-2px_var(--accent)]"
                style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                Write
              </Link>
              <Link to="/my-posts" className="text-sm text-faint hover:text-signature transition-colors font-sans hidden sm:block">
                My Posts
              </Link>
              <Link to="/bookmarks" className="text-sm text-faint hover:text-signature transition-colors font-sans hidden sm:block">
                Bookmarks
              </Link>
              <Link to="/settings" className="text-sm text-faint hover:text-signature transition-colors font-sans hidden sm:block">
                Settings
              </Link>
              {profile?.username && (
                <Link to={`/u/${profile.username}`} aria-label="Your profile" className="hidden sm:block">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-wire" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-paper border border-wire flex items-center justify-center text-xs font-sans text-faint">
                      {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-faint hover:text-signature transition-colors font-sans hidden sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="px-4 py-1.5 text-sm font-sans font-medium rounded-lg transition-colors hover:shadow-[0_0_16px_-2px_var(--accent)]"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              Sign in to write.
            </Link>
          )}
        </nav>
      </div>
      <div className="rule-ribbon" />
    </header>
  )
}
