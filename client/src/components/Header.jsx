import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Header() {
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
      className="sticky top-0 z-50 border-b border-wire"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-wide mx-auto px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <img src="/verso-logo.svg" alt="Verso" className="h-7 logo-mark" />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xs hidden sm:block">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search posts…"
            className="w-full px-3 py-1.5 text-sm bg-surface border border-wire rounded-md text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors"
          />
        </form>

        <div className="flex items-center gap-3 ml-auto">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to="/write"
                className="px-4 py-1.5 text-sm font-sans font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: 'var(--accent)' }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
              >
                Write
              </Link>
              <Link to="/my-posts" className="text-sm text-faint hover:text-ink transition-colors font-sans hidden sm:block">
                My Posts
              </Link>
              {profile?.username && (
                <Link to={`/@${profile.username}`} className="hidden sm:block">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover border border-wire" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface border border-wire flex items-center justify-center text-xs font-sans text-faint">
                      {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-faint hover:text-ink transition-colors font-sans hidden sm:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/signin"
              className="px-4 py-1.5 text-sm font-sans font-medium rounded-lg text-white transition-colors"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              Sign in to write.
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
