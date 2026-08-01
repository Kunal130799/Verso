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

// GET /api/my-posts/analytics — daily view counts across all your posts,
// last 30 days (including zero-view days, so the chart has no gaps)
router.get('/my-posts/analytics', requireAuth, async (req, res) => {
  const { data: myPosts } = await supabase
    .from('posts').select('id').eq('author_id', req.user.id)

  const postIds = (myPosts || []).map(p => p.id)
  const DAYS = 30
  const since = new Date(Date.now() - DAYS * 86400000).toISOString()

  const buckets = {}
  for (let i = 0; i < DAYS; i++) {
    const day = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    buckets[day] = 0
  }

  if (postIds.length > 0) {
    const { data: views, error } = await supabase
      .from('post_views')
      .select('viewed_at')
      .in('post_id', postIds)
      .gte('viewed_at', since)

    if (error) return res.status(500).json({ error: error.message })

    for (const v of views || []) {
      const day = v.viewed_at.slice(0, 10)
      if (day in buckets) buckets[day]++
    }
  }

  const series = Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, views]) => ({ date, views }))

  res.json({ series })
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
