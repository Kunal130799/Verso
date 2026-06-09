# Phase 3 — Product Features

**Goal:** turn the working MVP into something that looks and feels like a real publishing product (Medium/Hashnode tier). This is the layer that separates Verso from the 500 other portfolio blogs.

One feature at a time. Each is independent, so you can reorder if you like.

---

## 1. Markdown editor with live preview

- Replace the plain textarea with a Markdown editor: write on the left, rendered preview on the right; on mobile, a Write/Preview tab toggle.
- Render Markdown safely with `react-markdown` (+ `remark-gfm` for tables/strikethrough). **Sanitize** output so user content can't inject scripts.
- Apply the reading typography from `DESIGN.md` to the rendered preview *and* the public post page so they match.

Prompt:
> "Swap the post content textarea for a Markdown editor with live preview (split on desktop, tabbed on mobile). Render with react-markdown + remark-gfm, sanitized. Style the rendered output with the Newsreader reading styles from DESIGN.md, used on both the editor preview and the public post page."

---

## 2. Cover images (Supabase Storage)

- Optional cover image per post, uploaded to the `covers` bucket created in Phase 1.
- Upload via the backend (or a signed upload URL) → store the public URL in `posts.cover_image_url`.
- Show the cover on the post page and feed cards.

Prompt:
> "Add optional cover-image upload to the post editor, storing files in the Supabase `covers` bucket and saving the public URL on the post. Show covers on post pages and feed cards. Validate file type and size."

---

## 3. Public profile pages — `/@username`

- First, let users **set their username once**: a Settings field that updates `profiles.username` (validate: unique, lowercase, url-safe; only editable while still the auto-generated default, or allow one change).
- Route `/@:username` shows the author's display name, avatar, bio, and a list of **their public posts**.

Prompt:
> "Add username editing in Settings (unique, url-safe, one-time change from the default). Build the public profile page at /@username showing the author's name, avatar, bio, and their public posts. Update post URLs to /@username/slug."

---

## 4. Tags

- Add up to ~5 tags when writing a post (create-on-the-fly into `tags`, link via `post_tags`).
- Show tags on the post page; clicking a tag → `/tag/:slug` listing public posts with that tag.

Prompt:
> "Add tagging: authors attach up to 5 tags per post (create new tags as needed), stored via the tags/post_tags tables. Show tags on posts; add a /tag/:slug page listing public posts for that tag."

---

## 5. Search

- A search box that queries public post titles (and optionally excerpts/tags).
- Backend `GET /api/search?q=` using Postgres text search (`ilike` to start, or full-text search for bonus points).

Prompt:
> "Add search over public posts by title (and excerpt). Backend route with a query param; frontend search box with a results page. Start simple with case-insensitive matching."

---

## 6. View counts

- Increment `posts.view_count` once per view of a public post (debounce so refreshes don't spam it; a simple per-session guard is fine).
- Display the count quietly on the post page and in "My Posts."

Prompt:
> "Increment view_count when a public post is viewed, guarded so a single session doesn't inflate it. Show the count subtly on the post page and in My Posts."

---

## 7. Draft autosave

- While writing, autosave the draft every few seconds (debounced) or on pause, so nothing is lost. Show a quiet "Saved" indicator.

Prompt:
> "Add debounced autosave for drafts while editing, with a subtle 'Saved' / 'Saving…' indicator. Don't autosave published posts without an explicit save."

---

## Definition of Done ✅

- [ ] Markdown editor with live preview, sanitized, styled per DESIGN.md
- [ ] Cover image upload working via Supabase Storage
- [ ] Username editing + public `/@username` profile pages
- [ ] Post URLs are `/@username/slug`
- [ ] Tags: add, display, and `/tag/:slug` pages
- [ ] Search over public posts
- [ ] View counts increment sensibly
- [ ] Draft autosave with indicator
- [ ] Redeployed; everything live

Now it looks like a product. Phase 4 makes it portfolio-ready.
