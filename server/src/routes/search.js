import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

const FIELDS =
  'id, title, slug, excerpt, cover_image_url, reading_time_minutes, view_count, published_at, ' +
  'author:profiles!author_id(id, username, display_name, avatar_url), ' +
  'post_tags(tags(name, slug))'

// Ranked full-text search (title > excerpt > body, word stems, "phrases",
// -exclusions). Returns null when the search_posts() migration hasn't been
// run yet, so the caller can fall back.
async function rankedSearch(q) {
  const { data: hits, error } = await supabase.rpc('search_posts', { q, max_results: 30 })
  if (error) return null
  if (hits.length === 0) return []

  const { data, error: postsErr } = await supabase.from('posts').select(FIELDS).in('id', hits.map(h => h.id))
  if (postsErr) return null
  const order = new Map(hits.map((h, i) => [h.id, i]))
  return data.sort((a, b) => order.get(a.id) - order.get(b.id))
}

// Plain substring match — catches partial words ("crick" → cricket) that
// full-text search, which matches whole word stems, misses.
async function substringSearch(q) {
  // , ( ) are PostgREST filter syntax inside .or() — strip them so a query
  // containing them can't break the filter.
  const term = `%${q.replace(/[,()]/g, ' ')}%`
  const { data, error } = await supabase
    .from('posts')
    .select(FIELDS)
    .eq('status', 'public')
    .or(`title.ilike.${term},excerpt.ilike.${term}`)
    .order('published_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data
}

router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim().slice(0, 200)
  if (!q) return res.json({ posts: [] })

  try {
    const ranked = await rankedSearch(q)
    const posts = ranked?.length ? ranked : await substringSearch(q)
    res.json({ posts })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
