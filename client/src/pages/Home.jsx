import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import TopContributors from '../components/TopContributors'
import { PostCardSkeleton } from '../components/LoadingSkeleton'

const PAGE_SIZE = 20

export default function Home() {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tags, setTags] = useState([])

  useEffect(() => {
    document.title = 'Verso — A quieter place to write.'
    api.get('/api/tags').then(data => setTags(data.tags)).catch(() => setTags([]))
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
    <div className="max-w-wide mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-ink mb-1">Latest</h1>
        <p className="text-faint text-sm font-sans">Public posts from all writers on Verso.</p>
      </div>

      {/* Category tabs */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8 pb-4 border-b border-wire">
          <span
            className="px-3 py-1.5 text-sm font-sans rounded-full"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            All
          </span>
          {tags.map(t => (
            <Link
              key={t.slug}
              to={`/tag/${t.slug}`}
              className="px-3 py-1.5 text-sm font-sans rounded-full border border-wire text-faint hover:text-accent hover:border-accent transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
        <div>
          {error && (
            <p className="text-sm text-faint py-8">Could not load posts. Is the server running?</p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10 font-sans text-sm">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-wire rounded-lg text-faint hover:text-ink disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-faint">Page {page} of {totalPages}</span>
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

        <aside className="hidden lg:block pt-1">
          <TopContributors />
        </aside>
      </div>
    </div>
  )
}
