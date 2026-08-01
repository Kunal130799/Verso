import { useState } from 'react'

function shareLinks(url, title) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return [
    { label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ]
}

export default function ShareButton({ title, url, className = '' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const handleClick = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: shareUrl }) } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return
    }
    setOpen(o => !o)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API unavailable — nothing to fall back to
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 text-xs font-sans text-faint hover:text-ink transition-colors border border-wire rounded-full px-3 py-1.5"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" /><line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
        </svg>
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-44 rounded-lg border border-wire z-50 py-1.5 text-sm font-sans"
            style={{ backgroundColor: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
          >
            <button
              onClick={handleCopy}
              className="w-full text-left px-3 py-1.5 text-faint hover:text-ink transition-colors"
            >
              {copied ? 'Link copied' : 'Copy link'}
            </button>
            {shareLinks(shareUrl, title).map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="block px-3 py-1.5 text-faint hover:text-ink transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
