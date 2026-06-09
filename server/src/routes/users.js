import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/me
router.get('/me', requireAuth, async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles').select('*').eq('id', req.user.id).single()

  if (error || !profile) return res.status(404).json({ error: 'Profile not found' })
  res.json({ user: req.user, profile })
})

// POST /api/me/accept-terms
router.post('/me/accept-terms', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('profiles').update({ terms_accepted_at: new Date().toISOString() }).eq('id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// PUT /api/me
router.put('/me', requireAuth, async (req, res) => {
  const { display_name, bio, username } = req.body
  const updates = {}

  if (display_name !== undefined) updates.display_name = display_name.trim()
  if (bio          !== undefined) updates.bio = bio.trim()

  if (username !== undefined) {
    const clean = username.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '')
    if (!clean || clean.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' })
    if (clean.length > 30)          return res.status(400).json({ error: 'Username must be 30 characters or fewer' })

    const { data: existing } = await supabase
      .from('profiles').select('id').eq('username', clean).neq('id', req.user.id).maybeSingle()

    if (existing) return res.status(409).json({ error: 'Username already taken' })
    updates.username = clean
  }

  const { data: profile, error } = await supabase
    .from('profiles').update(updates).eq('id', req.user.id).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(profile)
})

// GET /api/my-posts (proxied through users router for convenience)
router.get('/my-posts', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, status, reading_time_minutes, view_count, created_at, updated_at, published_at')
    .eq('author_id', req.user.id)
    .order('updated_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ posts: data })
})

// DELETE /api/me
router.delete('/me', requireAuth, async (req, res) => {
  const { error: profileErr } = await supabase
    .from('profiles').delete().eq('id', req.user.id)

  if (profileErr) return res.status(500).json({ error: profileErr.message })

  const { error: authErr } = await supabase.auth.admin.deleteUser(req.user.id)
  if (authErr) return res.status(500).json({ error: authErr.message })

  res.json({ success: true })
})

export default router
