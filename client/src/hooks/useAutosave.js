import { useEffect, useRef, useState } from 'react'

export function useAutosave(saveFn, deps, delay = 2500) {
  const [status, setStatus] = useState(null)
  const timer = useRef(null)
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }

    setStatus('saving')
    clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      try {
        await saveFn()
        setStatus('saved')
        setTimeout(() => setStatus(null), 2000)
      } catch {
        setStatus(null)
      }
    }, delay)

    return () => clearTimeout(timer.current)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return status
}
