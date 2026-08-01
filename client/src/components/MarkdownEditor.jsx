import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

export default function MarkdownEditor({ value, onChange, placeholder = 'Write in Markdown…', onUploadImage, imagesEnabled }) {
  const [tab, setTab] = useState('write')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const activeTextareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const insertAtCursor = text => {
    const el = activeTextareaRef.current
    if (!el) { onChange(`${value}\n${text}\n`); return }
    const start = el.selectionStart
    const end = el.selectionEnd
    onChange(value.slice(0, start) + text + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  const handleImagePick = async e => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file || !onUploadImage) return
    setUploading(true)
    setUploadError(null)
    try {
      const url = await onUploadImage(file)
      insertAtCursor(`![](${url})`)
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const toolbar = (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-wire bg-surface">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!imagesEnabled || uploading}
        className="inline-flex items-center gap-1.5 text-xs font-sans text-faint hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={imagesEnabled ? 'Insert image' : 'Save the post first to add images'}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>
        {uploading ? 'Uploading…' : 'Insert image'}
      </button>
      {uploadError && <span className="text-xs text-red-400 font-sans">{uploadError}</span>}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
    </div>
  )

  const preview = (
    <div className="p-5 overflow-y-auto bg-surface h-full">
      {value ? (
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {value}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-faint text-sm italic">Preview will appear here.</p>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop: side-by-side */}
      <div
        className="hidden md:flex flex-col border border-wire rounded-lg overflow-hidden"
        style={{ minHeight: '520px' }}
      >
        {toolbar}
        <div className="grid grid-cols-2 flex-1">
          <div className="border-r border-wire overflow-hidden">
            <textarea
              value={value}
              onChange={e => onChange(e.target.value)}
              onFocus={e => (activeTextareaRef.current = e.target)}
              placeholder={placeholder}
              className="w-full h-full p-5 font-mono text-sm resize-none bg-surface text-ink focus:outline-none leading-relaxed"
              style={{ fontFamily: 'ui-monospace, Fira Code, monospace' }}
            />
          </div>
          {preview}
        </div>
      </div>

      {/* Mobile: tab toggle */}
      <div className="md:hidden border border-wire rounded-lg overflow-hidden">
        {toolbar}
        <div className="flex border-b border-wire bg-surface">
          {['write', 'preview'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-sans capitalize transition-colors ${
                tab === t
                  ? 'text-accent border-b-2 border-accent -mb-px'
                  : 'text-faint hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === 'write' ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={e => (activeTextareaRef.current = e.target)}
            placeholder={placeholder}
            rows={20}
            className="w-full p-5 font-mono text-sm resize-none bg-surface text-ink focus:outline-none leading-relaxed"
            style={{ fontFamily: 'ui-monospace, Fira Code, monospace' }}
          />
        ) : (
          <div style={{ minHeight: '300px' }}>{preview}</div>
        )}
      </div>
    </>
  )
}
