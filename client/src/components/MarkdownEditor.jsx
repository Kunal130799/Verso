import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

export default function MarkdownEditor({ value, onChange, placeholder = 'Write in Markdown…' }) {
  const [tab, setTab] = useState('write')

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

  const editor = (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full p-5 font-mono text-sm resize-none bg-surface text-ink focus:outline-none leading-relaxed"
      style={{ fontFamily: 'ui-monospace, Fira Code, monospace' }}
    />
  )

  return (
    <>
      {/* Desktop: side-by-side */}
      <div
        className="hidden md:grid grid-cols-2 border border-wire rounded-lg overflow-hidden"
        style={{ minHeight: '480px' }}
      >
        <div className="border-r border-wire overflow-hidden">{editor}</div>
        {preview}
      </div>

      {/* Mobile: tab toggle */}
      <div className="md:hidden border border-wire rounded-lg overflow-hidden">
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
