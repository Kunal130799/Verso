import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function BookmarkButton({ postId, initialBookmarked = false }) {
  const { user, getToken } = useAuth()
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [busy, setBusy] = useState(false)

  if (!user) return null

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    const next = !bookmarked
    setBookmarked(next)
    try {
      const token = await getToken()
      if (next) await api.post(`/api/bookmarks/${postId}`, {}, token)
      else await api.delete(`/api/bookmarks/${postId}`, token)
    } catch {
      setBookmarked(!next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={bookmarked ? 'Remove bookmark' : 'Save for later'}
      className="inline-flex items-center gap-1.5 text-xs font-sans text-faint hover:text-ink transition-colors border border-wire rounded-full px-3 py-1.5 disabled:opacity-50"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {bookmarked ? 'Saved' : 'Save'}
    </button>
  )
}
