import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import PostCard from '../components/PostCard'
import { PostCardSkeleton } from '../components/LoadingSkeleton'

export default function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/api/profile/${username}`)
      .then(data => {
        setProfile(data.profile)
        setPosts(data.posts)
        document.title = `${data.profile.display_name || data.profile.username} — Verso`
      })
      .catch(err => {
        if (err.status === 404) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return (
      <div className="max-w-feed mx-auto px-6 py-12">
        <div className="animate-pulse mb-10">
          <div className="w-16 h-16 rounded-full bg-surface mb-4" />
          <div className="h-6 bg-surface rounded w-40 mb-2" />
          <div className="h-4 bg-surface rounded w-64" />
        </div>
        {[...Array(3)].map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-feed mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-faint mb-4">Profile not found.</p>
        <Link to="/" className="text-sm font-sans text-accent hover:text-accent-hi transition-colors">← Back home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-feed mx-auto px-6 py-12">
      {/* Profile header */}
      <header className="mb-10 pb-8 border-b border-wire">
        <div className="flex items-start gap-5">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surface border border-wire flex items-center justify-center text-2xl font-sans text-faint flex-shrink-0">
              {(profile.display_name || profile.username)?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-serif text-2xl font-medium text-ink mb-0.5">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-sm font-sans text-faint mb-2">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm font-sans text-faint max-w-prose">{profile.bio}</p>
            )}
          </div>
        </div>
      </header>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="font-serif text-xl text-faint py-8">No public posts yet.</p>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={{ ...post, author: profile, profiles: profile }}
          />
        ))
      )}
    </div>
  )
}
