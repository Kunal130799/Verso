import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../lib/api'

export default function Sidebar({ open, onClose }) {
  const [groups, setGroups] = useState([])
  const [openLetters, setOpenLetters] = useState(new Set())
  const location = useLocation()
  const activeSlug = location.pathname.startsWith('/tag/') ? location.pathname.split('/')[2] : null

  useEffect(() => {
    api.get('/api/tags').then(data => {
      const byLetter = {}
      for (const t of data.tags) {
        const letter = t.slug[0]?.toUpperCase() || '#'
        ;(byLetter[letter] ||= []).push(t)
      }
      setGroups(Object.entries(byLetter).sort(([a], [b]) => a.localeCompare(b)))
    }).catch(() => setGroups([]))
  }, [])

  useEffect(() => {
    if (activeSlug) setOpenLetters(prev => new Set(prev).add(activeSlug[0].toUpperCase()))
  }, [activeSlug])

  const toggleLetter = letter => setOpenLetters(prev => {
    const next = new Set(prev)
    next.has(letter) ? next.delete(letter) : next.add(letter)
    return next
  })

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
        className={`fixed lg:sticky top-16 left-0 z-40 lg:z-0 h-[calc(100vh-4rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-wire px-5 py-6 transition-transform duration-200 lg:transition-none ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <p className="text-xs font-sans tracking-[0.2em] uppercase text-faint mb-4">Browse by tag</p>

        {groups.length === 0 ? (
          <p className="text-sm text-faint font-sans">No tags yet.</p>
        ) : (
          <nav className="space-y-1">
            {groups.map(([letter, tags]) => {
              const isOpen = openLetters.has(letter)
              return (
                <div key={letter}>
                  <button
                    onClick={() => toggleLetter(letter)}
                    className="w-full flex items-center justify-between py-1.5 text-sm font-sans font-semibold text-ink"
                  >
                    {letter}
                    <span className="text-faint text-xs">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="pl-3 border-l border-wire flex flex-col gap-1 mb-2">
                      {tags.map(t => (
                        <Link
                          key={t.slug}
                          to={`/tag/${t.slug}`}
                          onClick={onClose}
                          className={`text-sm font-sans py-0.5 transition-colors ${
                            t.slug === activeSlug ? 'text-signature font-medium' : 'text-faint hover:text-ink'
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
        )}
      </aside>
    </>
  )
}
