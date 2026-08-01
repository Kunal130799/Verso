import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function About() {
  const [stats, setStats] = useState(null)
  const [contributors, setContributors] = useState([])

  useEffect(() => { document.title = 'About — Verso' }, [])

  useEffect(() => {
    api.get('/api/posts?page=1&limit=1').then(data => setStats(data)).catch(() => {})
    api.get('/api/profile/top/contributors').then(data => setContributors(data.contributors)).catch(() => {})
  }, [])

  return (
    <div className="max-w-reading mx-auto px-6 py-12">
      <div className="prose max-w-none">
        <h1>About Verso</h1>

        <p>
          Verso is a quieter place to write. No feeds engineered for outrage, no algorithm deciding
          what deserves attention — just people writing things worth reading, and other people finding
          them.
        </p>

        <h2>Why it exists</h2>
        <p>
          Most publishing platforms optimize for engagement. Verso optimizes for the writing itself:
          a clean editor, a calm reading view, and just enough structure — tags, search, a profile —
          to help good writing find its readers without the noise.
        </p>

        <h2>What to expect</h2>
        <p>Verso doesn't have a fixed beat. Anyone who signs in can publish, on whatever they want to write about — notes, essays, tutorials, project write-ups, running commentary. Posts can include code with syntax highlighting, cover images, and inline images, and every post can carry as many or as few tags as fit it. Browse by tag from the sidebar, or search across everything that's been published.</p>

        <h2>Drafts and privacy</h2>
        <p>
          Every post starts as a <strong>draft</strong> — visible only to its author, autosaved as you
          write. When it's ready, publish it <strong>privately</strong> (shareable by direct link) or
          <strong> publicly</strong> to the main feed. Nothing goes out until you choose to send it out.
        </p>

        {stats && (
          <>
            <h2>By the numbers</h2>
            <p>{stats.total} {stats.total === 1 ? 'post has' : 'posts have'} been published on Verso so far.</p>
          </>
        )}

        {contributors.length > 0 && (
          <>
            <h2>Written by</h2>
            <ul>
              {contributors.map(c => (
                <li key={c.id}>
                  <Link to={`/u/${c.username}`}>{c.display_name || c.username}</Link> — {c.post_count} {c.post_count === 1 ? 'post' : 'posts'}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
