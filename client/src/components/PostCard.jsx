import { Link } from 'react-router-dom'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PostCard({ post }) {
  const author = post.author || post.profiles
  const tags = post.post_tags?.map(pt => pt.tags).filter(Boolean) || []
  const href = `/@${author?.username}/${post.slug}`

  return (
    <article className="py-8 border-b border-wire last:border-0">
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-3">
            {author?.avatar_url && (
              <img src={author.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
            )}
            <Link
              to={`/@${author?.username}`}
              className="text-faint text-sm font-sans hover:text-ink transition-colors"
            >
              {author?.display_name || author?.username}
            </Link>
          </div>

          {/* Title */}
          <Link to={href} className="block group">
            <h2 className="font-serif text-xl font-medium text-ink group-hover:text-accent transition-colors mb-1.5 leading-snug">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-faint text-sm font-sans leading-relaxed line-clamp-2 mb-3">
                {post.excerpt}
              </p>
            )}
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-faint font-sans flex-wrap">
            <span>{formatDate(post.published_at || post.created_at)}</span>
            <span>·</span>
            <span>{post.reading_time_minutes} min read</span>
            {post.view_count > 0 && (
              <>
                <span>·</span>
                <span>{post.view_count.toLocaleString()} views</span>
              </>
            )}
            {tags.length > 0 && (
              <>
                <span>·</span>
                <div className="flex gap-1.5 flex-wrap">
                  {tags.slice(0, 3).map(t => (
                    <Link
                      key={t.slug}
                      to={`/tag/${t.slug}`}
                      className="hover:text-accent transition-colors"
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image_url && (
          <Link to={href} className="flex-shrink-0">
            <img
              src={post.cover_image_url}
              alt=""
              className="w-24 h-16 object-cover rounded-md border border-wire"
            />
          </Link>
        )}
      </div>
    </article>
  )
}
