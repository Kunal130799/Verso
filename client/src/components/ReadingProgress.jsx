import { useEffect, useState } from 'react'

// Thin bar pinned to the top of the viewport that fills as the reader moves
// through `targetRef` (the article body) — 0 when its top reaches the top of
// the screen, 1 when its bottom reaches the bottom.
export default function ReadingProgress({ targetRef }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = null
    const update = () => {
      frame = null
      const el = targetRef.current
      if (!el) return
      const { top, height } = el.getBoundingClientRect()
      const scrollable = height - window.innerHeight
      const p = scrollable <= 0 ? (top <= 0 ? 1 : 0) : -top / scrollable
      setProgress(Math.min(1, Math.max(0, p)))
    }
    const onScroll = () => { if (frame === null) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [targetRef])

  return (
    <div aria-hidden="true" className="fixed top-0 left-0 right-0 h-0.5 z-[60] pointer-events-none">
      <div
        className="h-full origin-left"
        style={{ backgroundColor: 'var(--accent)', transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
