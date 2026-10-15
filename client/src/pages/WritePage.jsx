import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import MarkdownEditor from '../components/MarkdownEditor'

const STATUSES = ['draft', 'private', 'public']
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function checkImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG, WebP, or GIF image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be under 5 MB.')
}

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
  const creatingRef           = useRef(null)
  const [saving, setSaving]   = useState(false)
  const [autosaveStatus, setAutosaveStatus] = useState(null)
  const [error, setError]     = useState(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverDragging, setCoverDragging] = useState(false)

  // Load existing post
  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        const token = await getToken()
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

  // Returns the post's id, creating a draft first if there isn't one yet —
  // so images can be added before the post has been saved or even titled.
  // Concurrent callers (autosave + an upload) share one create request.
  const ensurePost = async () => {
    if (postIdRef.current) return postIdRef.current
    if (!creatingRef.current) {
      creatingRef.current = (async () => {
        const token = await getToken()
        const post = await api.post('/api/posts', {
          title: title.trim() || 'Untitled draft', content, status: 'draft', excerpt, tags,
        }, token)
        postIdRef.current = post.id
        setPostId(post.id)
        return post.id
      })().finally(() => { creatingRef.current = null })
    }
    return creatingRef.current
  }

  // Autosave drafts
  useEffect(() => {
    if (!title.trim() && !postIdRef.current) return

    const timer = setTimeout(async () => {
      setAutosaveStatus('saving')
      try {
        const token = await getToken()
        if (!postIdRef.current) {
          await ensurePost()
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
      const token = await getToken()
      const postId = await ensurePost()
      await api.put(`/api/posts/${postId}`, { title, content, status: targetStatus, excerpt, tags }, token)
      setStatus(targetStatus)
      if (!id) navigate(`/write/${postId}`, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const uploadCover = async file => {
    if (!file) return
    setError(null)
    setCoverUploading(true)
    try {
      checkImage(file)
      const postId = await ensurePost()
      const formData = new FormData()
      formData.append('cover', file)
      const token = await getToken()
      const data = await api.upload(`/api/posts/${postId}/cover`, formData, token)
      setCover(data.cover_image_url)
    } catch (err) {
      setError(err.message)
    } finally {
      setCoverUploading(false)
    }
  }

  const removeCover = async () => {
    if (!postIdRef.current) return
    setError(null)
    try {
      const token = await getToken()
      await api.delete(`/api/posts/${postIdRef.current}/cover`, token)
      setCover(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleContentImageUpload = async file => {
    checkImage(file)
    const postId = await ensurePost()
    const formData = new FormData()
    formData.append('image', file)
    const token = await getToken()
    const data = await api.upload(`/api/posts/${postId}/images`, formData, token)
    return data.url
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
            aria-label="Post visibility"
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
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-ink)' }}
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

      {/* Cover image — click or drop a file */}
      <div className="relative mb-6">
        <label
          onDragOver={e => { e.preventDefault(); setCoverDragging(true) }}
          onDragLeave={() => setCoverDragging(false)}
          onDrop={e => { e.preventDefault(); setCoverDragging(false); uploadCover(e.dataTransfer.files[0]) }}
          className={`focus-within:ring-2 focus-within:ring-accent relative flex items-center justify-center w-full rounded-lg border border-dashed cursor-pointer overflow-hidden transition-colors ${
            coverDragging ? 'border-accent bg-surface' : 'border-wire hover:border-accent'
          } ${cover ? 'h-48' : 'h-24'}`}
        >
          {cover && <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <span className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-sm font-sans rounded-lg ${cover ? 'bg-paper text-ink' : 'text-faint'}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {coverUploading ? 'Uploading…' : cover ? 'Change cover' : 'Add a cover image — click or drop one here'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={e => { uploadCover(e.target.files[0]); e.target.value = '' }}
            className="sr-only"
            aria-label="Cover image"
          />
        </label>
        {cover && !coverUploading && (
          <button
            type="button"
            onClick={removeCover}
            className="absolute top-2 right-2 px-2.5 py-1 text-xs font-sans rounded-lg bg-paper text-faint hover:text-ink border border-wire transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Post title"
        aria-label="Post title"
        className="focus-ring w-full font-serif text-3xl font-medium bg-transparent text-ink placeholder:text-faint focus:outline-none border-b border-wire pb-4 mb-6"
      />

      {/* Editor */}
      <MarkdownEditor
        value={content}
        onChange={setContent}
        onUploadImage={handleContentImageUpload}
      />

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
