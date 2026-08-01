import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'

export default function Sidebar({ tags, open, onClose }) {
  const [openLetters, setOpenLetters] = useState(new Set())
  const [postTagSlugs, setPostTagSlugs] = useState([])
  const location = useLocation()

  const activeTagSlug = location.pathname.startsWith('/tag/') ? location.pathname.split('/')[2] : null
  const postSlug = location.pathname.match(/^\/posts\/([^/]+)/)?.[1] || null

  const groups = useMemo(() => {
    const byLetter = {}
    for (const t of tags) {
      const letter = t.slug[0]?.toUpperCase() || '#'
      ;(byLetter[letter] ||= []).push(t)
    }
    return Object.entries(byLetter).sort(([a], [b]) => a.localeCompare(b))
  }, [tags])

  // Highlight the tags of whichever post is currently open
  useEffect(() => {
    if (!postSlug) { setPostTagSlugs([]); return }
    api.get(`/api/posts/by-slug/${encodeURIComponent(postSlug)}`)
      .then(data => {
        const slugs = (data.post_tags || []).map(pt => pt.tags?.slug).filter(Boolean)
        setPostTagSlugs(slugs)
      })
      .catch(() => setPostTagSlugs([]))
  }, [postSlug])

  useEffect(() => {
    const letters = [activeTagSlug, ...postTagSlugs].filter(Boolean).map(s => s[0].toUpperCase())
    if (letters.length) setOpenLetters(prev => new Set([...prev, ...letters]))
  }, [activeTagSlug, postTagSlugs])

  const toggleLetter = letter => setOpenLetters(prev => {
    const next = new Set(prev)
    next.has(letter) ? next.delete(letter) : next.add(letter)
    return next
  })

  const isActive = slug => slug === activeTagSlug || postTagSlugs.includes(slug)

  // Escape closes the mobile drawer (it's a modal overlay there; on desktop
  // it's docked inline, so `open` doesn't gate its visibility)
  useEffect(() => {
    if (!open) return
    const onKeyDown = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}
      <aside
        aria-label="Browse by tag"
        className={`fixed lg:sticky top-16 left-0 z-40 lg:z-0 h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-wire px-5 py-6 transition-transform duration-200 lg:transition-none ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <p className="text-xs font-sans tracking-[0.2em] uppercase text-faint mb-4">Browse by tag</p>

        <nav className="space-y-1">
          {groups.map(([letter, letterTags]) => {
            const isOpen = openLetters.has(letter)
            return (
              <div key={letter}>
                <button
                  onClick={() => toggleLetter(letter)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-1.5 text-sm font-sans font-semibold text-ink"
                >
                  {letter}
                  <span aria-hidden="true" className="text-faint text-xs">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="pl-3 border-l border-wire flex flex-col gap-1 mb-2">
                    {letterTags.map(t => (
                      <Link
                        key={t.slug}
                        to={`/tag/${t.slug}`}
                        onClick={onClose}
                        className={`text-sm font-sans py-0.5 transition-colors ${
                          isActive(t.slug) ? 'text-signature font-medium' : 'text-faint hover:text-ink'
                        }`}
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
