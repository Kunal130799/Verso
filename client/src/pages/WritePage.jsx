import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import MarkdownEditor from '../components/MarkdownEditor'

const STATUSES = ['draft', 'private', 'public']

export default function WritePage() {
  const { id } = useParams()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle]     = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus]   = useState('draft')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags]       = useState([])
  const [tagInput, setTagInput] = useState('')
  const [cover, setCover]     = useState(null)
  const [postId, setPostId]   = useState(id || null)
  const postIdRef             = useRef(id || null)
  const [saving, setSaving]   = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState(null)
  const [error, setError]     = useState(null)
  const [coverUploading, setCoverUploading] = useState(false)

  // Load existing post
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const token = getToken()
        const post = await api.get(`/api/posts/${id}`, token)
        setTitle(post.title)
        setContent(post.content)
        setStatus(post.status)
        setExcerpt(post.excerpt || '')
        setTags(post.post_tags?.map(pt => pt.tags?.name).filter(Boolean) || [])
        setCover(post.cover_image_url || null)
      } catch {
        setError('Post not found.')
      }
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave drafts
  useEffect(() => {
    if (!title.trim()) return

    const timer = setTimeout(async () => {
      setAutosaveStatus('saving')
      try {
        const token = getToken()
        if (!postIdRef.current) {
          const post = await api.post('/api/posts', { title, content, status: 'draft', excerpt, tags }, token)
          postIdRef.current = post.id
          setPostId(post.id)
        } else {
          await api.put(`/api/posts/${postIdRef.current}`, { title, content, excerpt, tags }, token)
        }
        setAutosaveStatus('saved')
        setTimeout(() => setAutosaveStatus(null), 2000)
      } catch {
        setAutosaveStatus(null)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [title, content, tags]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = title ? `${title} — Verso` : 'Write — Verso'
  }, [title])

  const handleSave = async (targetStatus = status) => {
    if (!title.trim()) { setError('Add a title first.'); return }
    setSaving(true)
    setError(null)
    try {
      const token = getToken()
      const payload = { title, content, status: targetStatus, excerpt, tags }
      if (postIdRef.current) {
        await api.put(`/api/posts/${postIdRef.current}`, payload, token)
        setStatus(targetStatus)
      } else {
        const post = await api.post('/api/posts', payload, token)
        postIdRef.current = post.id
        setPostId(post.id)
        setStatus(targetStatus)
        navigate(`/write/${post.id}`, { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCoverUpload = async e => {
    const file = e.target.files[0]
    if (!file) return
    if (!postIdRef.current) {
      setError('Save the post first before uploading a cover.')
      return
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) { setError('Use a JPG, PNG, WebP, or GIF image.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return }

    setCoverUploading(true)
    try {
      const formData = new FormData()
      formData.append('cover', file)
      const token = getToken()
      const data = await api.upload(`/api/posts/${postIdRef.current}/cover`, formData, token)
      setCover(data.cover_image_url)
    } catch (err) {
      setError(err.message)
    } finally {
      setCoverUploading(false)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (!t || tags.includes(t) || tags.length >= 5) return
    setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = name => setTags(tags.filter(t => t !== name))

  const statusLabel = { draft: 'Save draft', private: 'Save private', public: 'Publish' }

  return (
    <div className="max-w-wide mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-serif text-xl text-ink">
          {id ? 'Edit post' : 'New post'}
        </h1>
        <div className="flex items-center gap-3">
          {autosaveStatus && (
            <span className="text-xs text-faint font-sans">
              {autosaveStatus === 'saving' ? 'Saving…' : 'Saved'}
            </span>
          )}
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="text-sm font-sans bg-surface border border-wire rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-accent"
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => handleSave(status)}
            disabled={saving}
            className="px-5 py-2 text-sm font-sans font-medium text-white rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            {saving ? 'Saving…' : statusLabel[status]}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4 font-sans">{error}</p>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full font-serif text-3xl font-medium bg-transparent text-ink placeholder:text-faint focus:outline-none border-b border-wire pb-4 mb-6"
      />

      {/* Editor */}
      <MarkdownEditor value={content} onChange={setContent} />

      {/* Excerpt */}
      <div className="mt-6">
        <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-2">
          Excerpt (optional)
        </label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="A short description shown in the feed…"
          rows={2}
          maxLength={300}
          className="w-full p-3 text-sm font-sans bg-surface border border-wire rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* Tags */}
      <div className="mt-6">
        <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-2">
          Tags (up to 5)
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(t => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-sans bg-surface border border-wire text-ink"
            >
              {t}
              <button onClick={() => removeTag(t)} className="text-faint hover:text-ink ml-0.5">×</button>
            </span>
          ))}
        </div>
        {tags.length < 5 && (
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ',') && (e.preventDefault(), addTag())}
              placeholder="Add a tag, press Enter"
              className="flex-1 px-3 py-2 text-sm font-sans bg-surface border border-wire rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-accent"
            />
            <button
              onClick={addTag}
              className="px-4 py-2 text-sm font-sans border border-wire rounded-lg text-faint hover:text-ink transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Cover image */}
      <div className="mt-6">
        <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-2">
          Cover image (optional)
        </label>
        {cover && (
          <img src={cover} alt="Cover" className="w-full max-w-md h-40 object-cover rounded-lg border border-wire mb-3" />
        )}
        {!postIdRef.current && (
          <p className="text-xs text-faint font-sans mb-2">Save the post first to upload a cover.</p>
        )}
        <label className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-sans border border-wire rounded-lg cursor-pointer transition-colors ${postIdRef.current ? 'text-faint hover:text-ink hover:border-accent' : 'opacity-40 cursor-not-allowed'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          {coverUploading ? 'Uploading…' : cover ? 'Change cover' : 'Upload cover'}
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={!postIdRef.current} />
        </label>
      </div>

      {/* View live */}
      {postId && status === 'public' && (
        <div className="mt-8 pt-6 border-t border-wire">
          <button
            onClick={() => navigate(`/my-posts`)}
            className="text-sm font-sans text-accent hover:text-accent-hi transition-colors"
          >
            ← Back to My Posts
          </button>
        </div>
      )}
    </div>
  )
}
