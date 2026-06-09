import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import StatusChip from '../components/StatusChip'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MyPosts() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    document.title = 'My Posts — Verso'
  }, [])

  useEffect(() => {
    const token = getToken()
    api.get('/api/my-posts', token)
      .then(data => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return
    setDeleting(id)
    try {
      const token = getToken()
      await api.delete(`/api/posts/${id}`, token)
      setPosts(posts.filter(p => p.id !== id))
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="max-w-feed mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-medium text-ink">My Posts</h1>
        <Link
          to="/write"
          className="px-4 py-2 text-sm font-sans font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          New post
        </Link>
      </div>

      {loading ? (
        <p className="text-faint text-sm font-sans">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl text-faint mb-4">Nothing here yet.</p>
          <Link to="/write" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-wire">
          {posts.map(post => (
            <div key={post.id} className="py-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <StatusChip status={post.status} />
                  <span className="text-xs text-faint font-sans">{formatDate(post.updated_at)}</span>
                  {post.view_count > 0 && (
                    <span className="text-xs text-faint font-sans">· {post.view_count} views</span>
                  )}
                </div>
                <h2 className="font-serif text-lg font-medium text-ink leading-snug mb-0.5 truncate">
                  {post.title}
                </h2>
                <p className="text-sm text-faint font-sans truncate">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => navigate(`/write/${post.id}`)}
                  className="text-xs font-sans text-faint hover:text-ink transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deleting === post.id}
                  className="text-xs font-sans text-faint hover:text-red-500 transition-colors disabled:opacity-40"
                >
                  {deleting === post.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
