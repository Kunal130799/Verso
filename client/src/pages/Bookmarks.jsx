import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { PostCardSkeleton } from '../components/LoadingSkeleton'
import { setPageMeta } from '../lib/meta'

export default function Bookmarks() {
  const { getToken } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPageMeta({ title: 'Bookmarks — Verso' })
    getToken()
      .then(token => api.get('/api/bookmarks', token))
      .then(data => setPosts(data.posts))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-wide mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-ink mb-1">Bookmarks</h1>
        <p className="text-faint text-sm font-sans">Posts you've saved to read later.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl text-faint mb-4">Nothing saved yet.</p>
          <Link to="/" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">
            Browse posts →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  )
}
