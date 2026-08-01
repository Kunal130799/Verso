import { useEffect, useRef, useState } from 'react'

function toSpeechText(title, markdown) {
  const body = (markdown || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return `${title}. ${body}`
}

export default function ListenBar({ title, content }) {
  const [state, setState] = useState('idle') // idle | playing | paused
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  if (!supported) return null

  const play = () => {
    if (state === 'paused') {
      window.speechSynthesis.resume()
      setState('playing')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(toSpeechText(title, content))
    utterance.onend = () => setState('idle')
    utterance.onerror = () => setState('idle')
    window.speechSynthesis.speak(utterance)
    setState('playing')
  }

  const pause = () => {
    window.speechSynthesis.pause()
    setState('paused')
  }

  return (
    <div className="flex items-center gap-3 border border-wire rounded-xl px-4 py-2.5 text-xs text-faint max-w-md">
      <button
        onClick={state === 'playing' ? pause : play}
        aria-label={state === 'playing' ? 'Pause' : 'Play'}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-paper"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {state === 'playing' ? '❚❚' : '▶'}
      </button>
      <div className="flex-1">
        <div className="h-0.5 rounded bg-wire" />
        <div className="mt-1.5">
          {state === 'playing' ? 'Reading article…' : state === 'paused' ? 'Paused' : 'Listen to this article'}
        </div>
      </div>
    </div>
  )
}
