import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

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
