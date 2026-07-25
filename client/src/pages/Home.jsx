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
      <div className="mb-10">
        <h1 className="font-serif text-3xl font-medium text-ink mb-1">Latest</h1>
        <p className="text-faint text-sm font-sans">Public posts from all writers on Verso.</p>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,680px)_1fr] lg:gap-16">
        <div className="max-w-feed">
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

        {/* Index rail */}
        {tags.length > 0 && (
          <aside className="hidden lg:block pt-1">
            <p className="text-xs font-sans tracking-[0.2em] uppercase text-faint mb-4">Index</p>
            <div className="flex flex-col items-start gap-2.5 border-l border-wire pl-4">
              {tags.map(t => (
                <Link
                  key={t.slug}
                  to={`/tag/${t.slug}`}
                  className="text-sm font-sans text-faint hover:text-signature transition-colors"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
