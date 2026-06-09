import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

// GET /api/tags
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('tags').select('id, name, slug').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json({ tags: data })
})

// GET /api/tags/:slug
router.get('/:slug', async (req, res) => {
  const { data: tag } = await supabase
    .from('tags').select('id, name, slug').eq('slug', req.params.slug).single()

  if (!tag) return res.status(404).json({ error: 'Tag not found' })

  // Two-step query: reliable cross-version way to filter posts by tag
  const { data: postTagRows } = await supabase
    .from('post_tags').select('post_id').eq('tag_id', tag.id)

  const postIds = (postTagRows || []).map(r => r.post_id)

  if (postIds.length === 0) return res.json({ tag, posts: [] })

  const { data: posts, error } = await supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, published_at, ' +
      'author:profiles!author_id(id, username, display_name, avatar_url)'
    )
    .eq('status', 'public')
    .in('id', postIds)
    .order('published_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ tag, posts: posts || [] })
})

export default router
