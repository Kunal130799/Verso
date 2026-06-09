import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { PostPageSkeleton } from '../components/LoadingSkeleton'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function PostPage() {
  const { username, slug } = useParams()
  const { user, getToken, profile } = useAuth()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken()
        const data = await api.get(
          `/api/posts/by-slug/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`,
          token
        )
        setPost(data)
        document.title = `${data.title} — Verso`
      } catch (err) {
        if (err.status === 404) setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [username, slug]) // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!post) return null

  const author = post.profiles || post.author
  const isAuthor = user?.id === post.author_id
  const tags = post.post_tags?.map(pt => pt.tags).filter(Boolean) || []

  return (
    <article className="max-w-feed mx-auto px-6 py-12">
      {/* Cover image */}
      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="w-full h-56 sm:h-72 object-cover rounded-xl border border-wire mb-10"
        />
      )}

      {/* Header */}
      <header className="mb-10">
        <h1 className="font-serif text-4xl font-medium text-ink leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Link to={`/@${author?.username}`} className="flex items-center gap-2 group">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface border border-wire flex items-center justify-center text-sm font-sans text-faint">
                {(author?.display_name || author?.username)?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-sans text-faint group-hover:text-ink transition-colors">
              {author?.display_name || author?.username}
            </span>
          </Link>
          <span className="text-faint text-sm">·</span>
          <span className="text-sm font-sans text-faint">{formatDate(post.published_at || post.created_at)}</span>
          <span className="text-faint text-sm">·</span>
          <span className="text-sm font-sans text-faint">{post.reading_time_minutes} min read</span>
          {post.view_count > 0 && (
            <>
              <span className="text-faint text-sm">·</span>
              <span className="text-sm font-sans text-faint">{post.view_count.toLocaleString()} views</span>
            </>
          )}
          {isAuthor && (
            <Link
              to={`/write/${post.id}`}
              className="ml-auto text-xs font-sans text-faint hover:text-accent transition-colors"
            >
              Edit
            </Link>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-4">
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
      </header>

      {/* Body */}
      <div className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <footer className="mt-14 pt-8 border-t border-wire">
        <Link
          to={`/@${author?.username}`}
          className="flex items-center gap-3 group w-fit"
        >
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface border border-wire flex items-center justify-center font-sans text-faint">
              {(author?.display_name || author?.username)?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-sans font-medium text-ink group-hover:text-accent transition-colors">
              {author?.display_name || author?.username}
            </p>
            {author?.bio && (
              <p className="text-xs font-sans text-faint">{author.bio}</p>
            )}
          </div>
        </Link>
      </footer>
    </article>
  )
}
