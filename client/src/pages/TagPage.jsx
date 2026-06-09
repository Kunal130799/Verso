import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { PostCardSkeleton } from '../components/LoadingSkeleton'

export default function TagPage() {
  const { slug } = useParams()
  const [tag, setTag] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/api/tags/${slug}`)
      .then(data => {
        setTag(data.tag)
        setPosts(data.posts)
        document.title = `#${data.tag.name} — Verso`
      })
      .catch(err => {
        if (err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-feed mx-auto px-6 py-12">
        {[...Array(4)].map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-feed mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-faint mb-4">Tag not found.</p>
        <Link to="/" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">← Back home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-feed mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="text-faint text-sm font-sans mb-1">Tag</p>
        <h1 className="font-serif text-3xl font-medium text-ink">#{tag?.name}</h1>
        <p className="text-faint text-sm font-sans mt-1">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="font-serif text-xl text-faint py-8">No public posts with this tag yet.</p>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </div>
  )
}
