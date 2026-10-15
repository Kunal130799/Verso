import { useEffect, useState } from 'react'
import { api } from '../lib/api'

// Lets the author share an unpublished post through a secret link, and
// revoke it. `ensurePost` creates the draft first if it doesn't exist yet.
export default function PreviewLink({ postId, ensurePost, getToken }) {
  const [token, setToken] = useState(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!postId) return
    getToken()
      .then(t => api.get(`/api/posts/${postId}/preview-link`, t))
      .then(data => setToken(data.token))
      .catch(() => {})
  }, [postId]) // eslint-disable-line react-hooks/exhaustive-deps

  const url = token ? `${window.location.origin}/preview/${token}` : null

  const copy = async link => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — the link is still shown to copy by hand */ }
  }

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const id = await ensurePost()
      const data = await api.post(`/api/posts/${id}/preview-link`, {}, await getToken())
      setToken(data.token)
      copy(`${window.location.origin}/preview/${data.token}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const revoke = async () => {
    if (!window.confirm('Turn off this preview link? Anyone who has it will lose access.')) return
    setBusy(true)
    setError(null)
    try {
      await api.delete(`/api/posts/${postId}/preview-link`, await getToken())
      setToken(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6">
      <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-2">
        Preview link
      </label>
      {url ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            readOnly
            value={url}
            onFocus={e => e.target.select()}
            aria-label="Preview link"
            className="flex-1 min-w-0 px-3 py-2 text-sm font-sans bg-surface border border-wire rounded-lg text-ink focus:outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => copy(url)}
            className="px-4 py-2 text-sm font-sans border border-wire rounded-lg text-faint hover:text-ink transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={revoke}
            disabled={busy}
            className="px-4 py-2 text-sm font-sans border border-wire rounded-lg text-faint hover:text-red-500 transition-colors disabled:opacity-40"
          >
            Turn off
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="px-4 py-2 text-sm font-sans border border-wire rounded-lg text-faint hover:text-ink hover:border-accent transition-colors disabled:opacity-40"
        >
          {busy ? 'Creating…' : 'Create a private link to share this draft'}
        </button>
      )}
      <p className="text-xs text-faint font-sans mt-2">
        Anyone with the link can read this post before it's published. It won't appear anywhere else.
      </p>
      {error && <p className="text-xs text-red-500 font-sans mt-1">{error}</p>}
    </div>
  )
}
