import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="rule-ribbon" />
      <div className="max-w-wide mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint font-sans">
        <span>© {new Date().getFullYear()} Verso</span>
        <nav className="flex items-center gap-4">
          <Link to="/about"      className="hover:text-signature transition-colors">About</Link>
          <Link to="/privacy"    className="hover:text-signature transition-colors">Privacy</Link>
          <Link to="/terms"      className="hover:text-signature transition-colors">Terms</Link>
          <Link to="/guidelines" className="hover:text-signature transition-colors">Guidelines</Link>
        </nav>
      </div>
      <div className="max-w-wide mx-auto px-6 pb-6 flex items-center justify-center gap-3 text-xs text-faint font-sans border-t border-wire pt-4">
        <span>
          Built by <a href="mailto:kunalparmar130799@gmail.com" className="hover:text-signature transition-colors">Kunal Parmar</a>
        </span>
        <span>·</span>
        <a href="https://github.com/Kunal130799" target="_blank" rel="noopener noreferrer" className="hover:text-signature transition-colors">
          GitHub
        </a>
      </div>
    </footer>
  )
}
