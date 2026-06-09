# Verso — Project Master Doc

> **Verso** *(noun)* — the left-hand page of an open book. A quiet, classic word for a place where people write and publish.
>
> **Tagline:** *A quieter place to write.*

This is the master reference for the whole project. Read this first, then work through the phase docs in order.

---

## What we're building

A blogging platform where anyone can sign in with Google, write posts in Markdown, and choose to keep each post **private** (only them), keep it as a **draft**, or publish it **public** for the world to read. Visitors can read public posts without an account. Writers get a public profile page at `verso.app/@username`.

The real goal: a **portfolio piece** that looks like a real product, deployed live, with a clean README and an architecture story you can explain in an interview. The blog is the vehicle; the polish is the point.

---

## Locked decisions

| Area | Decision |
|---|---|
| Name | **Verso** |
| Tagline | A quieter place to write. |
| Visual style | Minimal / editorial (Medium-like) |
| Theme | Light + dark, with a toggle |
| Accent color | Ink blue `#1F4E8C` |
| Fonts | **Newsreader** (serif) for reading/headings · **Inter** (sans) for UI |
| Editor | Markdown with live preview |
| Read access | Public posts readable without login |
| Profiles | Public profile pages at `/@username` |
| Tags | Yes |
| Search | Yes |
| Cover images | Yes (Supabase Storage) |
| Reading time + views | Yes |
| Comments / likes | No (skipped to keep scope tight) |
| Draft autosave | Yes |
| Username | Auto-generated from Google name, user can edit once |
| Account / post deletion | Yes |
| Repo | Monorepo (frontend + backend together) |
| Domain | Free `*.vercel.app` to start |

---

## The stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router → deployed on **Vercel**
- **Backend:** Node + Express REST API → deployed on **Render**
- **Database:** Supabase **Postgres**
- **Auth:** Supabase **Auth** with Google OAuth
- **File storage:** Supabase **Storage** (post cover images)

### Why this shape (your interview answer)

Supabase *alone* could run the whole app with no backend. We deliberately added a real Node API because that's the part that proves engineering skill — API design, auth verification, authorization rules. So:

```
  Browser (React on Vercel)
       │  1. "Sign in with Google"  ──────────────►  Supabase Auth
       │  ◄──────────────────────────  returns a session JWT
       │
       │  2. API calls with  Authorization: Bearer <JWT>
       ▼
  Node + Express API (on Render)
       │  3. verifies the JWT with Supabase
       │  4. enforces rules (only author edits own post, etc.)
       ▼
  Supabase Postgres + Storage
```

The frontend never talks to the database directly for writes — everything goes through your API. That's the story.

---

## Data model (high level)

- **profiles** — one row per user (id, username, display_name, avatar_url, bio, terms_accepted_at)
- **posts** — id, author_id, title, slug, content (markdown), excerpt, cover_image_url, status (`draft` / `private` / `public`), reading_time_minutes, view_count, timestamps
- **tags** + **post_tags** — many-to-many tagging

Full SQL is specified in `PHASE-1-foundation.md`. Claude Code will turn it into `supabase_schema.sql`, which you paste into the Supabase SQL Editor and run.

---

## The free-tier "keep it awake" trick (important)

Both free hosts go to sleep:
- **Render** sleeps a free service after **15 min** idle; cold start ≈ **1 min**.
- **Supabase** pauses a free project after **7 days** of no DB activity; wake ≈ **30 sec**.

**One ping fixes both.** The API exposes a `GET /health` endpoint that runs a tiny query against Supabase. A free pinger (UptimeRobot or cron-job.org) hits it every ~10 minutes. That single request keeps Render awake *and* resets Supabase's inactivity timer (because it touches the database). Result: your live link loads instantly when a recruiter clicks it. Setup is in `PHASE-1` and verified in `PHASE-4`.

---

## How these docs are organized

Read and execute in this order:

1. **`DESIGN.md`** — the look: colors, fonts, logo, component style.
2. **`CLAUDE_CODE_GUIDE.md`** — how to actually drive Claude Code (read before Phase 1).
3. **`PHASE-1-foundation.md`** — repo, scaffold, Supabase, Google login, deploy. (Ship a live skeleton.)
4. **`PHASE-2-core-mvp.md`** — posts CRUD, public/private/draft, public feed, consent at signup, deletion.
5. **`PHASE-3-product-features.md`** — markdown editor, cover images, profiles, tags, search, autosave.
6. **`PHASE-4-polish-portfolio.md`** — design polish, dark mode, README, LinkedIn post, final checklist.
7. **`LEGAL_CONTENT.md`** — ready-to-use Privacy Policy, Terms, Content Guidelines, consent copy.

Each phase ends with a **Definition of Done** checklist. Don't move to the next phase until the current one is checked off and deployed.
