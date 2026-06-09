import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim()
  if (!q) return res.json({ posts: [] })

  const term = `%${q}%`

  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, published_at, ' +
      'author:profiles!author_id(id, username, display_name, avatar_url), ' +
      'post_tags(tags(name, slug))'
    )
    .eq('status', 'public')
    .or(`title.ilike.${term},excerpt.ilike.${term}`)
    .order('published_at', { ascending: false })
    .limit(30)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ posts: data })
})

export default router
