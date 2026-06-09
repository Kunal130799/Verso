import { supabase } from '../lib/supabase.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }
  const { data: { user }, error } = await supabase.auth.getUser(header.slice(7))
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  req.user = user
  next()
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) { req.user = null; return next() }
  const { data: { user } } = await supabase.auth.getUser(header.slice(7))
  req.user = user || null
  next()
}
