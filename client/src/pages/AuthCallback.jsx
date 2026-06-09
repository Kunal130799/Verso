import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)

  // Fallback — if nothing resolves in 10s, send to signin
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 10000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (timedOut) { navigate('/signin', { replace: true }); return }
    if (loading) return
    if (!user)   { navigate('/signin', { replace: true }); return }
    if (!profile) return  // wait for profile fetch to complete

    if (!profile.terms_accepted_at) {
      navigate('/consent', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [user, profile, loading, timedOut, navigate])

  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] gap-3">
      <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
      </svg>
      <span className="text-faint text-sm font-sans">Signing you in…</span>
    </div>
  )
}
