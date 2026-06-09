import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { PostCardSkeleton } from '../components/LoadingSkeleton'

const PAGE_SIZE = 20

export default function Home() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    document.title = 'Verso — A quieter place to write.'
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get(`/api/posts?page=${page}&limit=${PAGE_SIZE}`)
      .then(data => {
        setPosts(data.posts)
        setTotal(data.total)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-feed mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-medium text-ink mb-1">Latest</h1>
        <p className="text-faint text-sm font-sans">Public posts from all writers on Verso.</p>
      </div>

      {error && (
        <p className="text-sm text-faint py-8">Could not load posts. Is the server running?</p>
      )}

      {loading ? (
        [...Array(5)].map((_, i) => <PostCardSkeleton key={i} />)
      ) : posts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl text-faint mb-4">Nothing here yet.</p>
          <Link
            to="/signin"
            className="text-sm font-sans text-accent hover:text-accent-hi transition-colors"
          >
            Write the first post →
          </Link>
        </div>
      ) : (
        <>
          {posts.map(post => <PostCard key={post.id} post={post} />)}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10 font-sans text-sm">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-wire rounded-lg text-faint hover:text-ink disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-faint">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-wire rounded-lg text-faint hover:text-ink disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
