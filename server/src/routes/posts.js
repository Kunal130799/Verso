import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import { supabase } from '../lib/supabase.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { writeLimiter, viewLimiter } from '../middleware/rateLimit.js'

const router = Router()

// Explicit post columns rather than '*', which would also return the
// generated full-text `search` vector — large and useless to the client.
const POST_COLUMNS =
  'id, author_id, title, slug, content, excerpt, cover_image_url, status, ' +
  'reading_time_minutes, view_count, created_at, updated_at, published_at, scheduled_at'
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

function toSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80) || 'post'
}

function readingTime(content) {
  return Math.max(1, Math.round((content || '').trim().split(/\s+/).length / 200))
}

async function uniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug
  let n = 1
  while (true) {
    const q = supabase.from('posts').select('id').eq('slug', slug)
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

// GET /api/posts/trending — most-read public posts over the last 7 days,
// from the per-view log. Must be before /:id.
// ponytail: counts in JS from a capped scan of recent views — fine at this
// traffic; move to a SQL group-by (RPC) if weekly views outgrow the cap.
router.get('/trending', async (_req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: views, error } = await supabase
    .from('post_views').select('post_id').gte('viewed_at', since).limit(20000)
  if (error) return res.status(500).json({ error: error.message })

  const counts = new Map()
  for (const { post_id } of views) counts.set(post_id, (counts.get(post_id) || 0) + 1)
  const ranked = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([id]) => id)
  if (ranked.length === 0) return res.json({ posts: [] })

  const { data: posts, error: postsErr } = await supabase
    .from('posts')
    .select('id, title, slug, author:profiles!author_id(username, display_name)')
    .in('id', ranked)
    .eq('status', 'public')
  if (postsErr) return res.status(500).json({ error: postsErr.message })

  const top = posts
    .map(p => ({ ...p, week_views: counts.get(p.id) }))
    .sort((a, b) => b.week_views - a.week_views)
    .slice(0, 5)
  res.json({ posts: top })
})

// GET /api/posts/preview/:token — read a post through its secret preview
// link, whatever its status. Must be before /:id.
router.get('/preview/:token', async (req, res) => {
  const { token } = req.params
  if (!/^[0-9a-f-]{36}$/i.test(token)) return res.status(404).json({ error: 'Not found' })

  const { data: post, error } = await supabase
    .from('posts')
    .select(`${POST_COLUMNS}, profiles!author_id(id, username, display_name, avatar_url, bio), post_tags(tags(id, name, slug))`)
    .eq('preview_token', token)
    .maybeSingle()

  if (error || !post) return res.status(404).json({ error: 'Not found' })
  post.related = []
  post.is_bookmarked = false
  post.is_preview = true
  res.json(post)
})

// GET /api/posts/by-slug/:slug — must be before /:id
router.get('/by-slug/:slug', optionalAuth, async (req, res) => {
  const { slug } = req.params

  const { data: post, error } = await supabase
    .from('posts')
    .select(`${POST_COLUMNS}, profiles!author_id(id, username, display_name, avatar_url, bio), post_tags(tags(id, name, slug))`)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !post) return res.status(404).json({ error: 'Not found' })

  if (post.status !== 'public') {
    if (!req.user || req.user.id !== post.author_id) return res.status(404).json({ error: 'Not found' })
  }

  post.related = await relatedPosts(post)

  if (req.user) {
    const { data: bookmark } = await supabase
      .from('bookmarks').select('post_id').eq('user_id', req.user.id).eq('post_id', post.id).maybeSingle()
    post.is_bookmarked = !!bookmark
  } else {
    post.is_bookmarked = false
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
    .select(`${POST_COLUMNS}, profiles!author_id(id, username, display_name, avatar_url, bio), post_tags(tags(id, name, slug))`)
    .eq('id', req.params.id)
    .maybeSingle()

  if (error || !post) return res.status(404).json({ error: 'Not found' })

  if (post.status !== 'public') {
    if (!req.user || req.user.id !== post.author_id) return res.status(404).json({ error: 'Not found' })
  }

  res.json(post)
})

// POST /api/posts
router.post('/', requireAuth, writeLimiter, async (req, res) => {
  const { title, content = '', status = 'draft', excerpt = '', tags = [] } = req.body
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })

  const slug = await uniqueSlug(toSlug(title))

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
    .select(POST_COLUMNS)
    .single()

  if (error) return res.status(500).json({ error: error.message })

  if (tags.length > 0) await upsertTags(post.id, tags.slice(0, 5))

  res.status(201).json(post)
})

// PUT /api/posts/:id
router.put('/:id', requireAuth, async (req, res) => {
  const { data: existing } = await supabase
    .from('posts').select('id, author_id, status, published_at').eq('id', req.params.id).maybeSingle()

  if (!existing || existing.author_id !== req.user.id) return res.status(404).json({ error: 'Not found' })

  const { title, content, status, excerpt, tags, scheduled_at } = req.body
  const updates = {}

  // Scheduling: a scheduled post is a draft with scheduled_at set — the
  // scheduler publishes it when the time comes. null unschedules.
  if (scheduled_at !== undefined) {
    if (scheduled_at === null) {
      updates.scheduled_at = null
    } else {
      const when = new Date(scheduled_at)
      if (Number.isNaN(when.getTime())) return res.status(400).json({ error: 'Invalid schedule time' })
      if (when.getTime() < Date.now() - 60 * 1000) return res.status(400).json({ error: 'Pick a time in the future' })
      if (existing.status === 'public') return res.status(400).json({ error: 'This post is already published' })
      if (status !== undefined && status !== 'draft') return res.status(400).json({ error: 'Only drafts can be scheduled' })
      updates.scheduled_at = when.toISOString()
    }
  }

  if (title?.trim()) {
    updates.title = title.trim()
    // Drafts are often created before the title is final (autosave, or an
    // image added first) — keep the slug in step until the post is first
    // published, then freeze it so shared links don't break.
    if (!existing.published_at) updates.slug = await uniqueSlug(toSlug(updates.title), existing.id)
  }
  if (content  !== undefined) { updates.content = content; updates.reading_time_minutes = readingTime(content) }
  if (excerpt  !== undefined) updates.excerpt = excerpt
  if (status   !== undefined) {
    updates.status = status
    if (status !== 'draft') updates.scheduled_at = null
    if (status === 'public' && existing.status !== 'public') updates.published_at = new Date().toISOString()
  }

  const { data: post, error } = await supabase
    .from('posts').update(updates).eq('id', req.params.id).select(POST_COLUMNS).single()

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
router.post('/:id/view', viewLimiter, async (req, res) => {
  const { data: post } = await supabase
    .from('posts').select('id, status, view_count').eq('id', req.params.id).maybeSingle()

  if (!post || post.status !== 'public') return res.status(404).json({ error: 'Not found' })

  await supabase.from('posts').update({ view_count: post.view_count + 1 }).eq('id', req.params.id)
  await supabase.from('post_views').insert({ post_id: post.id })
  res.json({ success: true })
})

// POST /api/posts/:id/cover
router.post('/:id/cover', requireAuth, writeLimiter, upload.single('cover'), async (req, res) => {
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

// Preview link management — author only.
async function ownPost(req, res) {
  const { data: post } = await supabase
    .from('posts').select('id, author_id, preview_token').eq('id', req.params.id).maybeSingle()
  if (!post || post.author_id !== req.user.id) { res.status(404).json({ error: 'Not found' }); return null }
  return post
}

// GET /api/posts/:id/preview-link — current link token, or null
router.get('/:id/preview-link', requireAuth, async (req, res) => {
  const post = await ownPost(req, res)
  if (post) res.json({ token: post.preview_token })
})

// POST /api/posts/:id/preview-link — create the link (or return the existing one)
router.post('/:id/preview-link', requireAuth, async (req, res) => {
  const post = await ownPost(req, res)
  if (!post) return
  if (post.preview_token) return res.json({ token: post.preview_token })
  const token = randomUUID()
  const { error } = await supabase.from('posts').update({ preview_token: token }).eq('id', post.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ token })
})

// DELETE /api/posts/:id/preview-link — revoke; the old link stops working
router.delete('/:id/preview-link', requireAuth, async (req, res) => {
  const post = await ownPost(req, res)
  if (!post) return
  const { error } = await supabase.from('posts').update({ preview_token: null }).eq('id', post.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ token: null })
})

// DELETE /api/posts/:id/cover — remove the cover (the file stays in storage)
router.delete('/:id/cover', requireAuth, async (req, res) => {
  const { data: post } = await supabase
    .from('posts').select('id, author_id').eq('id', req.params.id).maybeSingle()

  if (!post || post.author_id !== req.user.id) return res.status(404).json({ error: 'Not found' })

  const { error } = await supabase.from('posts').update({ cover_image_url: null }).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ cover_image_url: null })
})

// Up to 3 public posts sharing a tag with `post`, backfilled with the latest public posts.
async function relatedPosts(post) {
  const fields = 'id, title, slug, excerpt, cover_image_url, reading_time_minutes, published_at'
  const tagIds = (post.post_tags || []).map(pt => pt.tags?.id).filter(Boolean)
  const picked = new Map()

  if (tagIds.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select(`${fields}, post_tags!inner(tag_id)`)
      .eq('status', 'public')
      .neq('id', post.id)
      .in('post_tags.tag_id', tagIds)
      .order('published_at', { ascending: false })
      .limit(10)
    for (const p of data || []) {
      if (picked.size >= 3) break
      delete p.post_tags
      picked.set(p.id, p)
    }
  }

  if (picked.size < 3) {
    const { data } = await supabase
      .from('posts')
      .select(fields)
      .eq('status', 'public')
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3 + picked.size)
    for (const p of data || []) {
      if (picked.size >= 3) break
      if (!picked.has(p.id)) picked.set(p.id, p)
    }
  }

  return [...picked.values()]
}

// POST /api/posts/:id/images — images inserted into the post body, separate from the cover
router.post('/:id/images', requireAuth, writeLimiter, upload.single('image'), async (req, res) => {
  const { data: post } = await supabase
    .from('posts').select('id, author_id').eq('id', req.params.id).maybeSingle()

  if (!post || post.author_id !== req.user.id) return res.status(404).json({ error: 'Not found' })
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Use JPG, PNG, WebP, or GIF' })
  }

  const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg')
  const path = `${req.user.id}/content/${req.params.id}-${Date.now()}.${ext}`

  const { error: upErr } = await supabase.storage
    .from('covers').upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: true })

  if (upErr) return res.status(500).json({ error: upErr.message })

  const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(path)

  res.json({ url: publicUrl })
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
