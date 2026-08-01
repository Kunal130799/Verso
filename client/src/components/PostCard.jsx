import { Link } from 'react-router-dom'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PostCard({ post }) {
  const author = post.author || post.profiles
  const tags = post.post_tags?.map(pt => pt.tags).filter(Boolean) || []
  const href = `/posts/${post.slug}`

  return (
    <article
      className="flex flex-col border border-wire rounded-xl overflow-hidden hover:border-accent transition-colors"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      <Link to={href} className="block flex-shrink-0">
        {post.cover_image_url ? (
          <img src={post.cover_image_url} alt="" loading="lazy" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40" style={{ background: 'linear-gradient(135deg, var(--bg), var(--surface))' }} />
        )}
      </Link>

      <div className="flex flex-col flex-1 p-5">
        {tags[0] && (
          <Link
            to={`/tag/${tags[0].slug}`}
            className="self-start px-2.5 py-0.5 mb-3 text-xs font-sans rounded-full border border-wire text-faint hover:text-accent hover:border-accent transition-colors"
          >
            {tags[0].name}
          </Link>
        )}

        <Link to={href} className="block group flex-1">
          <h2 className="font-serif text-lg font-medium text-ink group-hover:text-accent transition-colors mb-1.5 leading-snug">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-faint text-sm font-sans leading-relaxed line-clamp-3 mb-3">
              {post.excerpt}
            </p>
          )}
        </Link>

        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-wire">
          {author?.avatar_url ? (
            <img src={author.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-paper border border-wire flex items-center justify-center text-[10px] text-faint">
              {(author?.display_name || author?.username)?.[0]?.toUpperCase()}
            </div>
          )}
          <Link
            to={`/u/${author?.username}`}
            className="text-xs font-sans text-faint hover:text-ink transition-colors truncate"
          >
            {author?.display_name || author?.username}
          </Link>
          <span className="text-faint text-xs">·</span>
          <span className="text-xs font-sans text-faint whitespace-nowrap">{formatDate(post.published_at || post.created_at)}</span>
          <span className="text-faint text-xs">·</span>
          <span className="text-xs font-sans text-faint whitespace-nowrap">{post.reading_time_minutes} min</span>
        </div>
      </div>
    </article>
  )
}
