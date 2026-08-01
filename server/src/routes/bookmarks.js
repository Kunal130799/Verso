import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/bookmarks — the signed-in user's saved posts, most recent first
router.get('/', requireAuth, async (req, res) => {
  const { data: rows, error } = await supabase
    .from('bookmarks')
    .select(
      'created_at, posts(id, title, slug, excerpt, cover_image_url, reading_time_minutes, ' +
      'view_count, published_at, status, author:profiles!author_id(id, username, display_name, avatar_url))'
    )
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  // A post can go private/be deleted after being bookmarked — drop those.
  const posts = (rows || []).map(r => r.posts).filter(p => p && p.status === 'public')
  res.json({ posts })
})

// POST /api/bookmarks/:postId
router.post('/:postId', requireAuth, async (req, res) => {
  const { data: post } = await supabase
    .from('posts').select('id, status').eq('id', req.params.postId).maybeSingle()

  if (!post || post.status !== 'public') return res.status(404).json({ error: 'Not found' })

  const { error } = await supabase
    .from('bookmarks')
    .upsert({ user_id: req.user.id, post_id: post.id }, { onConflict: 'user_id,post_id' })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ bookmarked: true })
})

// DELETE /api/bookmarks/:postId
router.delete('/:postId', requireAuth, async (req, res) => {
  const { error } = await supabase
    .from('bookmarks').delete().eq('user_id', req.user.id).eq('post_id', req.params.postId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ bookmarked: false })
})

export default router
