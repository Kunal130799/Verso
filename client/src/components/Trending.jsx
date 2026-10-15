import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Trending() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    api.get('/api/posts/trending')
      .then(data => setPosts(data.posts))
      .catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null

  return (
    <div>
      <p className="text-xs font-sans tracking-[0.2em] uppercase text-faint mb-4">Trending this week</p>
      <ol className="flex flex-col gap-4">
        {posts.map((p, i) => (
          <li key={p.id} className="flex gap-3">
            <span className="text-xs font-sans text-faint w-4 flex-shrink-0 pt-0.5">{i + 1}</span>
            <div className="min-w-0">
              <Link
                to={`/posts/${p.slug}`}
                className="block text-sm font-sans text-ink hover:text-accent transition-colors leading-snug"
              >
                {p.title}
              </Link>
              <p className="text-xs font-sans text-faint mt-0.5 truncate">
                {p.author?.display_name || p.author?.username} · {p.week_views} {p.week_views === 1 ? 'read' : 'reads'}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
