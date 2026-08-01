import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { markdownRemarkPlugins, markdownRehypePlugins, markdownComponents } from '../lib/markdown'

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'sql', label: 'SQL' },
]

export default function MarkdownEditor({ value, onChange, placeholder = 'Write in Markdown…', onUploadImage, imagesEnabled }) {
  const [tab, setTab] = useState('write')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [codeLang, setCodeLang] = useState('javascript')
  const activeTextareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const insertAtCursor = (text, cursorOffset = text.length) => {
    const el = activeTextareaRef.current
    if (!el) { onChange(`${value}\n${text}\n`); return }
    const start = el.selectionStart
    const end = el.selectionEnd
    onChange(value.slice(0, start) + text + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + cursorOffset
    })
  }

  // Wraps the current selection in markdown syntax (bold/italic/etc). With no
  // selection, inserts a placeholder and selects it so typing replaces it.
  const wrapSelection = (before, after = before, placeholder = 'text') => {
    const el = activeTextareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = value.slice(start, end) || placeholder
    onChange(value.slice(0, start) + before + selected + after + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = start + before.length
      el.selectionEnd = start + before.length + selected.length
    })
  }

  // Prefixes the current line (e.g. "## " for a heading)
  const insertLinePrefix = prefix => {
    const el = activeTextareaRef.current
    if (!el) return
    const start = el.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    onChange(value.slice(0, lineStart) + prefix + value.slice(lineStart))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + prefix.length
    })
  }

  const insertLink = () => {
    const el = activeTextareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = value.slice(start, end) || 'link text'
    const markdown = `[${text}](url)`
    onChange(value.slice(0, start) + markdown + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const urlStart = start + text.length + 3
      el.selectionStart = urlStart
      el.selectionEnd = urlStart + 3
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

  const insertCodeBlock = () => {
    const opening = '```' + codeLang + '\n'
    insertAtCursor(opening + '\n```', opening.length)
  }

  const toolbar = (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-wire bg-surface flex-wrap">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => wrapSelection('**')} title="Bold" aria-label="Bold" className="w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-faint hover:text-ink hover:bg-paper transition-colors">B</button>
        <button type="button" onClick={() => wrapSelection('_')} title="Italic" aria-label="Italic" className="w-6 h-6 flex items-center justify-center rounded text-xs italic text-faint hover:text-ink hover:bg-paper transition-colors">i</button>
        <button type="button" onClick={() => insertLinePrefix('## ')} title="Heading" aria-label="Heading" className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold text-faint hover:text-ink hover:bg-paper transition-colors">H</button>
        <button type="button" onClick={insertLink} title="Link" aria-label="Insert link" className="w-6 h-6 flex items-center justify-center rounded text-faint hover:text-ink hover:bg-paper transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
      </div>

      <span className="w-px h-4 bg-wire" />

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

      <span className="w-px h-4 bg-wire" />

      <select
        value={codeLang}
        onChange={e => setCodeLang(e.target.value)}
        aria-label="Code block language"
        className="text-xs font-sans bg-transparent border border-wire rounded px-1.5 py-1 text-faint focus:outline-none focus:border-accent"
      >
        {CODE_LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>
      <button
        type="button"
        onClick={insertCodeBlock}
        className="inline-flex items-center gap-1.5 text-xs font-sans text-faint hover:text-ink transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        Insert code block
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
    </div>
  )

  const preview = (
    <div className="p-5 overflow-y-auto bg-surface h-full">
      {value ? (
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={markdownRemarkPlugins}
            rehypePlugins={markdownRehypePlugins}
            components={markdownComponents}
          >
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
              aria-label="Post content in Markdown"
              className="focus-ring w-full h-full p-5 font-mono text-sm resize-none bg-surface text-ink focus:outline-none leading-relaxed"
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
            aria-label="Post content in Markdown"
            rows={20}
            className="focus-ring w-full p-5 font-mono text-sm resize-none bg-surface text-ink focus:outline-none leading-relaxed"
            style={{ fontFamily: 'ui-monospace, Fira Code, monospace' }}
          />
        ) : (
          <div style={{ minHeight: '300px' }}>{preview}</div>
        )}
      </div>
    </>
  )
}
