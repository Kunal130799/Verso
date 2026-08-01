# Feature Backlog

Ideas not yet built, for later. Grouped by effort. Nothing here is scheduled —
pick from it when there's appetite for more.

## Cheap — reuses what's already built

- **Trending / most-read this week** — a "Trending" section built on the
  `post_views` table (already logs a timestamped row per view for the
  analytics chart). Surfaces what's getting read *right now*, not just
  total-views-ever like the existing view counts.
- **Reading progress bar** on the post page — thin bar that fills as you
  scroll.
- **Editor word count** — small addition to the Markdown editor toolbar.
- **Markdown export** — download a post's raw `.md` from the editor or My
  Posts.

## Medium

- **Post scheduling** — pick a future publish date/time instead of just
  draft → public. Needs a `scheduled_at` column and something to flip status
  at the right time (a cron-pinged endpoint, similar to the existing
  `/health` keep-alive pinger).
- **Full-text search upgrade** — current search is almost certainly
  `ILIKE`-based substring matching; Postgres full-text search (`tsvector`)
  would give real relevance ranking.
- **Responsive/optimized images** — cover and inline images are stored
  as-uploaded; resizing to a few sizes on upload would cut page weight.
- **Draft preview links** — a private, unguessable link to share a draft for
  feedback before publishing, without making it fully public.

## Bigger — real scope, needs its own design pass

- **Post revision history** — track edits over time, view/restore a
  previous version. New schema + UI, not a small addition.
- **Newsletter digest** — periodic email of new posts to subscribers. Needs
  an email service (Resend, etc.) and a subscriber list — new territory.

## Explicitly deferred (needs a product decision first, not just build time)

- **Comments or likes** — the original design doc ruled these out
  ("Comments/likes: NO — out of scope"). Still the most commonly-expected
  blog feature if that decision gets revisited.
- **Following authors + notifications** — no follow graph exists at all;
  a real feature (new table, feed logic, possibly email), not a tweak.
