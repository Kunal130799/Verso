import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// After a deploy, a tab opened earlier still asks for the previous build's
// page chunks, which no longer exist. Reload once to pick up the new build
// (the flag stops a reload loop if the chunk is genuinely broken).
window.addEventListener('vite:preloadError', event => {
  try {
    if (sessionStorage.getItem('chunk-reload')) return
    sessionStorage.setItem('chunk-reload', '1')
  } catch { return }
  event.preventDefault()
  window.location.reload()
})
window.addEventListener('load', () => {
  setTimeout(() => { try { sessionStorage.removeItem('chunk-reload') } catch { /* ignore */ } }, 10000)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
