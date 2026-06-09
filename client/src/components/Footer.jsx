import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-wire mt-16">
      <div className="max-w-wide mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint font-sans">
        <span>© {new Date().getFullYear()} Verso</span>
        <nav className="flex items-center gap-4">
          <Link to="/privacy"    className="hover:text-ink transition-colors">Privacy</Link>
          <Link to="/terms"      className="hover:text-ink transition-colors">Terms</Link>
          <Link to="/guidelines" className="hover:text-ink transition-colors">Guidelines</Link>
        </nav>
      </div>
    </footer>
  )
}
