import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="rule-ribbon" />
      <div className="max-w-wide mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint font-sans">
        <span>© {new Date().getFullYear()} Verso</span>
        <nav className="flex items-center gap-4">
          <Link to="/privacy"    className="hover:text-signature transition-colors">Privacy</Link>
          <Link to="/terms"      className="hover:text-signature transition-colors">Terms</Link>
          <Link to="/guidelines" className="hover:text-signature transition-colors">Guidelines</Link>
        </nav>
      </div>
    </footer>
  )
}
