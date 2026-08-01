import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function TopContributors() {
  const [contributors, setContributors] = useState([])

  useEffect(() => {
    api.get('/api/profile/top/contributors')
      .then(data => setContributors(data.contributors))
      .catch(() => setContributors([]))
  }, [])

  if (contributors.length === 0) return null

  return (
    <div>
      <p className="text-xs font-sans tracking-[0.2em] uppercase text-faint mb-4">Top Contributors</p>
      <div className="flex flex-col gap-3">
        {contributors.map((c, i) => (
          <Link key={c.id} to={`/u/${c.username}`} className="flex items-center gap-3 group">
            <span className="text-xs font-sans text-faint w-4 flex-shrink-0">{i + 1}</span>
            {c.avatar_url ? (
              <img src={c.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-paper border border-wire flex items-center justify-center text-xs text-faint flex-shrink-0">
                {(c.display_name || c.username)?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-sans text-ink group-hover:text-accent transition-colors truncate">
                {c.display_name || c.username}
              </p>
              <p className="text-xs font-sans text-faint">{c.post_count} {c.post_count === 1 ? 'post' : 'posts'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
