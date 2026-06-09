# Verso — A quieter place to write.

A minimal blogging platform where you sign in with Google, write in Markdown, and publish public or keep private. Built as a portfolio piece — deployed live, clean architecture, explainable in an interview.

## Live demo

> Add your Vercel URL here once deployed.

---

## Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast DX, real-world toolchain |
| Routing | React Router v6 | Clean SPA routing with `/@username` profile URLs |
| Backend | Node + Express | Proves engineering skill — API design, auth, authorization |
| Auth | Supabase Auth + Google OAuth | Zero-password, production-grade |
| Database | Supabase Postgres | SQL, RLS, triggers — real database story |
| Storage | Supabase Storage | Cover image uploads |
| Deploy | Vercel (frontend) + Render (backend) | Both free tier, both live |

## Architecture

```
Browser (React on Vercel)
     │  1. Sign in with Google ──────────► Supabase Auth
     │  ◄──────────────────── session JWT
     │
     │  2. API calls with Authorization: Bearer <JWT>
     ▼
Node + Express API (on Render)
     │  3. Verifies JWT via Supabase
     │  4. Enforces authorship rules
     ▼
Supabase Postgres + Storage
```

The frontend never writes to the database directly. Everything goes through the API.

## Features

- Google sign-in, one-time consent gate
- Write posts in Markdown with live split-pane preview
- Draft / Private / Public post status
- Optional cover image per post (Supabase Storage)
- Public feed, single post page, public profile pages `/@username`
- Tags with `/tag/:slug` listing pages
- Full-text search over public posts
- View counts (per-session guard)
- Draft autosave with "Saved" indicator
- Username editing in Settings
- Delete account (cascades all data)
- Light + dark mode, persisted to localStorage, defaults to system preference
- `/privacy`, `/terms`, `/guidelines` pages

## Local setup

```bash
# Clone
git clone <repo-url>
cd verso

# Server
cd server
cp .env.example .env  # fill in Supabase keys
npm install
npm run dev           # http://localhost:3001

# Client (new terminal)
cd client
cp .env.example .env  # fill in Supabase keys + API URL
npm install
npm run dev           # http://localhost:5173
```

Run the SQL in `supabase_schema.sql` in your Supabase SQL Editor before starting.

## Key decisions (interview notes)

**Separate Node API instead of Supabase direct.**
Supabase alone could run the whole app. We deliberately add a Node API because it's the part that demonstrates real engineering: JWT verification, authorization rules, slug generation, reading-time calculation, file upload handling. The architectural story is cleaner and more interesting.

**Private posts return 404, not 403.**
Returning 403 would tell the requester the post exists but they can't see it. A 404 reveals nothing — the post simply doesn't exist to them. This is the correct privacy-preserving behavior, and a common interview question.

**JWT verified server-side on every request.**
The `author_id` is never trusted from the request body — only from the verified JWT. This prevents any user from claiming ownership of another user's content.

**Single health-check ping keeps both free hosts awake.**
Render sleeps after 15 min idle; Supabase pauses after 7 days of no DB activity. `GET /health` runs a tiny Supabase query. One UptimeRobot/cron-job.org pinger hitting it every ~10 min keeps both awake simultaneously. Result: the live demo loads instantly.

**Autosave only for drafts.**
Autosaving a published post on every keystroke would re-publish potentially unfinished edits. Autosave fires only when status is `draft`, so authors can edit freely without accidentally publishing partial changes.
