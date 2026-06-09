import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function ConsentGate() {
  const { getToken, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleContinue = async () => {
    if (!checked) return
    setLoading(true)
    try {
      const token = getToken()
      await api.post('/api/me/accept-terms', {}, token)
      await refreshProfile()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-serif text-2xl font-medium text-ink mb-2">One last thing.</h1>
      <p className="text-faint text-sm font-sans mb-8">
        Before you start writing, please agree to our terms.
      </p>

      <div
        className="border border-wire rounded-xl p-6 mb-6 bg-surface"
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded accent-accent flex-shrink-0"
          />
          <span className="text-sm font-sans text-ink leading-relaxed">
            I agree to Verso's{' '}
            <Link to="/terms" target="_blank" className="text-accent hover:text-accent-hi underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank" className="text-accent hover:text-accent-hi underline">Privacy Policy</Link>
            , and I'll follow the{' '}
            <Link to="/guidelines" target="_blank" className="text-accent hover:text-accent-hi underline">Content Guidelines</Link>.
          </span>
        </label>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleContinue}
        disabled={!checked || loading}
        className="w-full py-3 rounded-lg text-sm font-sans font-medium text-white transition-colors disabled:opacity-40"
        style={{ backgroundColor: 'var(--accent)' }}
        onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
      >
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </div>
  )
}
