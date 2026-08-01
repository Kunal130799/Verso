import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()
const SITE_URL = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim()

function escapeXml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// GET /feed.xml — RSS 2.0 feed of the latest 50 public posts
router.get('/feed.xml', async (_req, res) => {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('title, slug, excerpt, published_at, profiles!author_id(display_name, username)')
    .eq('status', 'public')
    .order('published_at', { ascending: false })
    .limit(50)

  if (error) return res.status(500).send('Feed unavailable')

  const items = (posts || []).map(p => {
    const url = `${SITE_URL}/posts/${p.slug}`
    const author = p.profiles?.display_name || p.profiles?.username || 'Verso'
    return `
  <item>
    <title>${escapeXml(p.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <description>${escapeXml(p.excerpt || '')}</description>
    <author>${escapeXml(author)}</author>
    <pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
  </item>`
  }).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Verso</title>
  <link>${SITE_URL}</link>
  <description>A quieter place to write.</description>
  <language>en</language>${items}
</channel>
</rss>`

  res.set('Content-Type', 'application/rss+xml; charset=utf-8')
  res.send(xml)
})

export default router
