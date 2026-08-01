import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// GET /api/profile/top/contributors — ranked by public post count
router.get('/top/contributors', async (req, res) => {
  const { data: rows, error } = await supabase
    .from('posts').select('author_id').eq('status', 'public')

  if (error) return res.status(500).json({ error: error.message })

  const counts = {}
  for (const { author_id } of rows) counts[author_id] = (counts[author_id] || 0) + 1

  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
  if (ranked.length === 0) return res.json({ contributors: [] })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .in('id', ranked.map(([id]) => id))

  const byId = Object.fromEntries((profiles || []).map(p => [p.id, p]))
  const contributors = ranked
    .filter(([id]) => byId[id])
    .map(([id, post_count]) => ({ ...byId[id], post_count }))

  res.json({ contributors })
})

// GET /api/profile/:username
router.get('/:username', async (req, res) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio, created_at')
    .eq('username', req.params.username)
    .single()

  if (error || !profile) return res.status(404).json({ error: 'Profile not found' })

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, published_at, post_tags(tags(name, slug))')
    .eq('author_id', profile.id)
    .eq('status', 'public')
    .order('published_at', { ascending: false })

  res.json({ profile, posts: posts || [] })
})

export default router
