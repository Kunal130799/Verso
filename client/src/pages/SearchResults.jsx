import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { PostCardSkeleton } from '../components/LoadingSkeleton'

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState(q)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    setSearched(false)
    api.get(`/api/search?q=${encodeURIComponent(q)}`)
      .then(data => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => { setLoading(false); setSearched(true) })
  }, [q])

  useEffect(() => {
    document.title = q ? `"${q}" — Verso Search` : 'Search — Verso'
  }, [q])

  const handleSearch = e => {
    e.preventDefault()
    if (input.trim()) setSearchParams({ q: input.trim() })
  }

  return (
    <div className="max-w-feed mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl font-medium text-ink mb-6">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Search public posts…"
          autoFocus
          className="flex-1 px-4 py-2.5 text-sm font-sans bg-surface border border-wire rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-sans font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          Search
        </button>
      </form>

      {loading && [...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}

      {!loading && searched && q && (
        <p className="text-sm text-faint font-sans mb-6">
          {posts.length === 0
            ? `No results for "${q}".`
            : `${posts.length} result${posts.length !== 1 ? 's' : ''} for "${q}"`}
        </p>
      )}

      {!loading && posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
