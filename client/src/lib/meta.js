function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Updates document.title plus the OG/Twitter meta tags used for link previews
// and search indexing. Client-side only — social-media crawlers that don't
// execute JS (most of them) will still see index.html's static defaults.
export function setPageMeta({ title, description, image, url, type = 'article' }) {
  if (title) {
    document.title = title
    setMeta('property', 'og:title', title)
    setMeta('name', 'twitter:title', title)
  }
  if (description) {
    setMeta('name', 'description', description)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:description', description)
  }
  setMeta('property', 'og:type', type)
  setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
  if (image) {
    setMeta('property', 'og:image', image)
    setMeta('name', 'twitter:image', image)
  }
  if (url) setMeta('property', 'og:url', url)
}
