import { Router } from 'express'
import multer from 'multer'
import { supabase } from '../lib/supabase.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80)
}

function readingTime(content) {
  return Math.max(1, Math.round((content || '').trim().split(/\s+/).length / 200))
}

async function uniqueSlug(authorId, baseSlug, excludeId = null) {
  let slug = baseSlug
  let n = 1
  while (true) {
    const q = supabase.from('posts').select('id').eq('author_id', authorId).eq('slug', slug)
    if (excludeId) q.neq('id', excludeId)
    const { data } = await q.maybeSingle()
    if (!data) return slug
    slug = `${baseSlug}-${n++}`
  }
}

// GET /api/posts — public feed
router.get('/', async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page  || '1'))
  const limit = Math.min(50, parseInt(req.query.limit || '20'))
  const from  = (page - 1) * limit
  const to    = from + limit - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select(
      'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, published_at, created_at, ' +
      'author:profiles!author_id(id, username, display_name, avatar_url), ' +
      'post_tags(tags(name, slug))',
      { count: 'exact' }
    )
    .eq('status', 'public')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ posts: data, total: count, page, limit })
})

// GET /api/posts/by-slug/:username/:slug — must be before /:id
router.get('/by-slug/:username/:slug', optionalAuth, async (req, res) => {
  const { username, slug } = req.params

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('username', username).maybeSingle()

  if (!profile) return res.status(404).json({ error: 'Not found' })

  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles!author_id(id, username, display_name, avatar_url, bio), post_tags(tags(id, name, slug))')
    .eq('slug', slug)
    .eq('author_id', profile.id)
    .maybeSingle()

  if (error || !post) return res.status(404).json({ error: 'Not found' })

  if (post.status !== 'public') {
    if (!req.user || req.user.id !== post.author_id) return res.status(404).json({ error: 'Not found' })
  }

  res.json(post)
})

// GET /api/my-posts — author's own posts (all statuses)
router.get('/my', requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, status, reading_time_minutes, view_count, created_at, updated_at, published_at')
    .eq('author_id', req.user.id)
    .order('updated_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ posts: data })
})

// GET /api/posts/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select('*, profiles!author_id(id, username, display_name, avatar_url, bio), post_tags(tags(id, name, slug))')
    .eq('id', req.params.id)
    .maybeSingle()

  if (error || !post) return res.status(404).json({ error: 'Not found' })

  if (post.status !== 'public') {
    if (!req.user || req.user.id !== post.author_id) return res.status(404).json({ error: 'Not found' })
  }

  res.json(post)
})

// POST /api/posts
router.post('/', requireAuth, async (req, res) => {
  const { title, content = '', status = 'draft', excerpt = '', tags = [] } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })

  const slug = await uniqueSlug(req.user.id, toSlug(title))

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: req.user.id,
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt.trim() || content.slice(0, 150),
      status,
      reading_time_minutes: readingTime(content),
      published_at: status === 'public' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  if (tags.length > 0) await upsertTags(post.id, tags.slice(0, 5))

  res.status(201).json(post)
})

// PUT /api/posts/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { data: existing } = await supabase
    .from('posts').select('id, author_id, status').eq('id', req.params.id).maybeSingle()

  if (!existing || existing.author_id !== req.user.id) return res.status(404).json({ error: 'Not found' })

  const { title, content, status, excerpt, tags } = req.body
  const updates = {}
  if (title    !== undefined) updates.title = title.trim()
  if (content  !== undefined) { updates.content = content; updates.reading_time_minutes = readingTime(content) }
  if (excerpt  !== undefined) updates.excerpt = excerpt
  if (status   !== undefined) {
    updates.status = status
    if (status === 'public' && existing.status !== 'public') updates.published_at = new Date().toISOString()
  }

  const { data: post, error } = await supabase
    .from('posts').update(updates).eq('id', req.params.id).select().single()

  if (error) return res.status(500).json({ error: error.message })

  if (tags !== undefined) {
    await supabase.from('post_tags').delete().eq('post_id', req.params.id)
    if (tags.length > 0) await upsertTags(req.params.id, tags.slice(0, 5))
  }

  res.json(post)
})

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const { data: existing } = await supabase
    .from('posts').select('id, author_id').eq('id', req.params.id).maybeSingle()

  if (!existing || existing.author_id !== req.user.id) return res.status(404).json({ error: 'Not found' })

  const { error } = await supabase.from('posts').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

// POST /api/posts/:id/view
router.post('/:id/view', async (req, res) => {
  const { data: post } = await supabase
    .from('posts').select('id, status, view_count').eq('id', req.params.id).maybeSingle()

  if (!post || post.status !== 'public') return res.status(404).json({ error: 'Not found' })

  await supabase.from('posts').update({ view_count: post.view_count + 1 }).eq('id', req.params.id)
  res.json({ success: true })
})

// POST /api/posts/:id/cover
router.post('/:id/cover', requireAuth, upload.single('cover'), async (req, res) => {
  const { data: post } = await supabase
    .from('posts').select('id, author_id').eq('id', req.params.id).maybeSingle()

  if (!post || post.author_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Use JPG, PNG, WebP, or GIF' })
  }

  const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg')
  const path = `${req.user.id}/${req.params.id}-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('covers').upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true })

  if (upErr) return res.status(500).json({ error: upErr.message })

  const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)

  await supabase.from('posts').update({ cover_image_url: publicUrl }).eq('id', req.params.id)

  res.json({ cover_image_url: publicUrl })
})

async function upsertTags(postId, names) {
  for (const name of names) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    if (!slug) continue
    const { data: tag } = await supabase
      .from('tags').upsert({ name: name.trim(), slug }, { onConflict: 'slug' }).select().single()
    if (tag) {
      await supabase.from('post_tags')
        .upsert({ post_id: postId, tag_id: tag.id }, { onConflict: 'post_id,tag_id' })
    }
  }
}

export default router
