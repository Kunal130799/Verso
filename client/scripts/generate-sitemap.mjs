import { writeFileSync } from 'fs'

// Runs at build time (see package.json's `build` script) so the sitemap is
// served static from the same origin as the site — sitemap URLs must share
// the sitemap file's host, which rules out generating it on the API's domain
// the way /feed.xml does. Staleness (only updates on redeploy) is an
// acceptable trade-off for a blog that doesn't publish by the minute.
const SITE_URL = 'https://verso-one-ruby.vercel.app'
const API_URL = 'https://verso-y40x.onrender.com'

const staticPaths = ['/', '/about', '/privacy', '/terms', '/guidelines']

async function fetchAllPublicSlugs() {
  const posts = []
  let page = 1
  while (true) {
    const res = await fetch(`${API_URL}/api/posts?page=${page}&limit=100`)
    if (!res.ok) break
    const data = await res.json()
    for (const p of data.posts) posts.push({ slug: p.slug, updatedAt: p.published_at })
    if (page * 100 >= data.total) break
    page++
  }
  return posts
}

function urlEntry(loc, lastmod) {
  return `  <url>\n    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}\n  </url>`
}

async function main() {
  let posts = []
  try {
    posts = await fetchAllPublicSlugs()
  } catch (err) {
    console.warn('generate-sitemap: could not reach API, writing static-only sitemap:', err.message)
  }

  const urls = [
    ...staticPaths.map(p => urlEntry(`${SITE_URL}${p}`)),
    ...posts.map(p => urlEntry(`${SITE_URL}/posts/${p.slug}`, p.updatedAt)),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`

  writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
  console.log(`generate-sitemap: wrote ${urls.length} URLs`)
}

main()
