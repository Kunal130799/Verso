import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { PostPageSkeleton } from '../components/LoadingSkeleton'
import ListenBar from '../components/ListenBar'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function PostPage() {
  const { slug } = useParams()
  const { user, getToken } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const data = await api.get(
          `/api/posts/by-slug/${encodeURIComponent(slug)}`,
          token
        )
        setPost(data)
        document.title = `${data.title} — Verso`
      } catch (err) {
        if (err.status === 404) setNotFound(true)
        else setError(err.message || 'Something went wrong loading this post.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Increment view count once per session
  useEffect(() => {
    if (!post || post.status !== 'public') return
    const key = `viewed-${post.id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    api.post(`/api/posts/${post.id}/view`, {}).catch(() => {})
  }, [post?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <PostPageSkeleton />

  if (notFound) {
    return (
      <div className="max-w-feed mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-faint mb-4">Post not found.</p>
        <Link to="/" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">← Back home</Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-feed mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-faint mb-4">{error}</p>
        <Link to="/" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">← Back home</Link>
      </div>
    )
  }

  if (!post) return null

  const author = post.profiles || post.author
  const isAuthor = user?.id === post.author_id
  const tags = post.post_tags?.map(pt => pt.tags).filter(Boolean) || []
  const related = post.related || []

  return (
    <article>
      {/* Hero */}
      <div className="max-w-wide mx-auto px-6 pt-8 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink leading-tight mb-5 tracking-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap text-sm font-sans text-faint mb-6">
            <Link to={`/u/${author?.username}`} className="flex items-center gap-2 group">
              {author?.avatar_url ? (
                <img src={author.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface border border-wire flex items-center justify-center text-xs text-faint">
                  {(author?.display_name || author?.username)?.[0]?.toUpperCase()}
                </div>
              )}
              <span className="group-hover:text-ink transition-colors">{author?.display_name || author?.username}</span>
            </Link>
            <span>·</span>
            <span>{formatDate(post.published_at || post.created_at)}</span>
            <span>·</span>
            <span>{post.reading_time_minutes} min read</span>
            {post.view_count > 0 && (
              <>
                <span>·</span>
                <span>{post.view_count.toLocaleString()} views</span>
              </>
            )}
            {isAuthor && (
              <Link to={`/write/${post.id}`} className="ml-auto text-xs text-faint hover:text-accent transition-colors">
                Edit
              </Link>
            )}
          </div>
          <ListenBar title={post.title} content={post.content} />
        </div>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="w-full aspect-[16/10.2] object-cover rounded-2xl border border-wire"
          />
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="max-w-wide mx-auto px-6 py-6 border-t border-b border-wire flex gap-2 flex-wrap">
          {tags.map(t => (
            <Link
              key={t.slug}
              to={`/tag/${t.slug}`}
              className="px-3 py-1 text-xs font-sans rounded-full border border-wire text-faint hover:text-accent hover:border-accent transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="max-w-feed mx-auto px-6 py-10">
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author card */}
        <div
          className="flex gap-5 border border-wire rounded-2xl p-6 mt-14"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-paper border border-wire flex items-center justify-center text-lg text-faint flex-shrink-0">
              {(author?.display_name || author?.username)?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <Link
              to={`/u/${author?.username}`}
              className="block text-base font-sans font-semibold text-ink hover:text-accent transition-colors"
            >
              {author?.display_name || author?.username}
            </Link>
            {author?.bio && <p className="text-sm font-sans text-faint mt-1">{author.bio}</p>}
            <Link to={`/u/${author?.username}`} className="block text-xs font-sans text-accent mt-2">
              See all posts →
            </Link>
          </div>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="max-w-wide mx-auto px-6 py-10">
          <h2 className="font-serif text-2xl font-medium text-ink mb-6">Related posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map(rp => (
              <Link
                key={rp.id}
                to={`/posts/${rp.slug}`}
                className="block border border-wire rounded-xl overflow-hidden hover:border-accent transition-colors"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                {rp.cover_image_url ? (
                  <img src={rp.cover_image_url} alt="" className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28" style={{ background: 'linear-gradient(135deg, var(--surface), var(--bg))' }} />
                )}
                <div className="p-4">
                  <div className="text-xs font-sans text-faint mb-2">
                    {formatDate(rp.published_at)} · {rp.reading_time_minutes} min read
                  </div>
                  <div className="text-sm font-sans font-semibold text-ink leading-snug">{rp.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="max-w-wide mx-auto px-6 pb-16">
        <div
          className="rounded-2xl border border-wire p-10 sm:p-12"
          style={{ background: 'linear-gradient(120deg, var(--surface), var(--bg))' }}
        >
          <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink mb-2">
            {user ? 'Have something to say?' : 'Join Verso'}
          </h3>
          <p className="text-sm font-sans text-faint mb-6">
            A quieter place to write, for anyone with something worth reading.
          </p>
          <Link
            to={user ? '/write' : '/signin'}
            className="inline-block px-5 py-2.5 text-sm font-sans font-medium rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
          >
            {user ? 'Start writing' : 'Sign in to write'}
          </Link>
        </div>
      </div>
    </article>
  )
}
