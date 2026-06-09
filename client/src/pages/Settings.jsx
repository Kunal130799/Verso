import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function Settings() {
  const { user, profile, setProfile, getToken, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [bio, setBio]                 = useState('')
  const [saving, setSaving]           = useState(false)
  const [saveMsg, setSaveMsg]         = useState(null)
  const [saveError, setSaveError]     = useState(null)
  const [deleteStep, setDeleteStep]   = useState(0) // 0, 1, 2
  const [deleting, setDeleting]       = useState(false)

  useEffect(() => {
    document.title = 'Settings — Verso'
  }, [])

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      setUsername(profile.username || '')
      setBio(profile.bio || '')
    }
  }, [profile])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    setSaveError(null)
    try {
      const token = getToken()
      const updates = { display_name: displayName, bio }
      if (username !== profile?.username) updates.username = username
      const updated = await api.put('/api/me', updates, token)
      setProfile(updated)
      setSaveMsg('Saved.')
      setTimeout(() => setSaveMsg(null), 2500)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteStep < 2) { setDeleteStep(s => s + 1); return }
    setDeleting(true)
    try {
      const token = getToken()
      await api.delete('/api/me', token)
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      alert(err.message)
      setDeleting(false)
      setDeleteStep(0)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl font-medium text-ink mb-8">Settings</h1>

      {/* Profile form */}
      <form onSubmit={handleSave} className="space-y-5 mb-12">
        <div>
          <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-1.5">
            Display name
          </label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={80}
            className="w-full px-3 py-2 text-sm font-sans bg-surface border border-wire rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-1.5">
            Username
          </label>
          <div className="flex items-center gap-0 border border-wire rounded-lg overflow-hidden focus-within:border-accent transition-colors">
            <span className="px-3 py-2 text-sm font-sans text-faint bg-surface border-r border-wire">@</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              minLength={3}
              maxLength={30}
              className="flex-1 px-3 py-2 text-sm font-sans bg-surface text-ink focus:outline-none"
            />
          </div>
          <p className="text-xs text-faint font-sans mt-1">Lowercase letters, numbers, underscores, hyphens.</p>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-faint uppercase tracking-wide mb-1.5">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="A sentence about you."
            className="w-full px-3 py-2 text-sm font-sans bg-surface border border-wire rounded-lg text-ink placeholder:text-faint focus:outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-sans font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--accent)' }}
            onMouseOver={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          {saveMsg && <span className="text-sm font-sans text-faint">{saveMsg}</span>}
          {saveError && <span className="text-sm font-sans text-red-500">{saveError}</span>}
        </div>
      </form>

      {/* Danger zone */}
      <div className="border border-red-200 rounded-xl p-5" style={{ borderColor: '#fca5a5' }}>
        <h2 className="text-sm font-sans font-semibold text-ink mb-1">Delete account</h2>
        <p className="text-xs font-sans text-faint mb-4">
          Permanently deletes your profile and all your posts. This can't be undone.
        </p>
        {deleteStep === 0 && (
          <button
            onClick={() => setDeleteStep(1)}
            className="text-sm font-sans text-red-500 hover:text-red-700 transition-colors"
          >
            Delete my account
          </button>
        )}
        {deleteStep === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-sans font-medium text-ink">Are you sure? All your posts will be deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-sans font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Yes, delete everything
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="px-4 py-2 text-sm font-sans border border-wire rounded-lg text-faint hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {deleteStep === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-sans font-medium text-ink">Last chance. This really can't be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-4 py-2 text-sm font-sans font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete my account'}
              </button>
              <button
                onClick={() => setDeleteStep(0)}
                className="px-4 py-2 text-sm font-sans border border-wire rounded-lg text-faint hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
