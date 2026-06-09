# Phase 1 — Foundation

**Goal:** a live, deployed skeleton where you can sign in with Google and see your own name on screen. No blog features yet — just the bones, wired end to end and online.

**Why first:** once login + deploy work, every later feature is easy. Most projects die because people leave deployment for last and hit a wall. We deploy on day one.

---

## Prerequisites (accounts — all free, no card)

- GitHub account (the repo connects everything)
- Supabase account → create a new project (save the DB password)
- Vercel account (sign in with GitHub)
- Render account (sign in with GitHub)
- A Google Cloud project for OAuth credentials (free)
- Node.js 18+ installed locally

---

## Step 1 — Monorepo scaffold

Ask Claude Code to create this structure:

```
verso/
├── client/        # React (Vite) + Tailwind + React Router
├── server/        # Node + Express API
├── docs/          # these .md files live here
├── .gitignore     # must ignore both .env files and node_modules
└── README.md
```

Prompt:
> "Create a monorepo named `verso` with a `client` folder (Vite + React + Tailwind + React Router) and a `server` folder (Node + Express). Set up `.gitignore` for node_modules and `.env`. Add `.env.example` files in both. Don't build features yet — just the scaffold, and confirm both run locally."

Verify: `client` runs on its dev server, `server` responds on its port.

---

## Step 2 — Supabase project + Google OAuth

This part you do in the **Supabase dashboard** (Claude Code can't click for you, so follow along):

1. **Google Cloud Console** → create OAuth credentials (Web application). Add Supabase's callback URL as an authorized redirect URI. (Supabase shows you the exact URL in the next step.)
2. **Supabase** → Authentication → Providers → **Google** → paste your Google Client ID + Secret → enable. Copy the redirect/callback URL Supabase gives you back into Google Cloud.
3. **Supabase → Authentication → URL Configuration:** add your local URL (e.g. `http://localhost:5173`) and later your Vercel URL to the allowed redirect list.
4. Grab from **Supabase → Project Settings → API**: the **Project URL**, the **anon public key**, the **service_role key**, and the **JWT secret**.

> The redirect-URL setup is the #1 thing people get wrong. If Google login fails, it's almost always a missing/incorrect redirect URL. Double-check it matches in both Google Cloud and Supabase.

---

## Step 3 — The database schema

Give Claude Code the SQL below and have it save it as `supabase_schema.sql`. Then paste it into **Supabase → SQL Editor → Run**.

```sql
-- VERSO SCHEMA — run once in Supabase SQL Editor

-- 1. PROFILES (one row per user, linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text default '',
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- 2. POST STATUS enum
do $$ begin
  create type post_status as enum ('draft', 'private', 'public');
exception when duplicate_object then null;
end $$;

-- 3. POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  content text not null default '',
  excerpt text default '',
  cover_image_url text,
  status post_status not null default 'draft',
  reading_time_minutes int not null default 1,
  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (author_id, slug)
);

create index if not exists posts_status_published_idx on public.posts (status, published_at desc);
create index if not exists posts_author_idx on public.posts (author_id);

-- 4. TAGS + join table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null
);

create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- 5. Auto-create a profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    'user_' || substr(new.id::text, 1, 8),   -- temp username; app lets user set a real one
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6. Auto-touch updated_at on posts
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- 7. Row Level Security (defense in depth — the Node API is the main gatekeeper)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;

create policy "public posts are readable" on public.posts
  for select using (status = 'public');
create policy "authors read own posts" on public.posts
  for select using (auth.uid() = author_id);
create policy "authors insert own posts" on public.posts
  for insert with check (auth.uid() = author_id);
create policy "authors update own posts" on public.posts
  for update using (auth.uid() = author_id);
create policy "authors delete own posts" on public.posts
  for delete using (auth.uid() = author_id);

create policy "profiles are readable" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "tags readable" on public.tags for select using (true);
create policy "post_tags readable" on public.post_tags for select using (true);
```

**Note on RLS:** your Node API uses the `service_role` key, which *bypasses* RLS — so the API enforces all the real rules in code. The policies above are a safety net for any direct client access. Good practice to keep, and a nice thing to mention in an interview.

Also create a **Storage bucket** named `covers` (public read) for post cover images — do this in Supabase → Storage, or ask Claude Code to include the SQL/policy for it. (Used in Phase 3, fine to set up now.)

---

## Step 4 — Auth flow wiring

Prompt Claude Code:
> "Wire up Supabase Google login. In `/client`, use `@supabase/supabase-js` so a user can click 'Sign in with Google' and get a session. In `/server`, add middleware that reads the `Authorization: Bearer <token>` header and verifies it with Supabase, attaching the user to the request. Add a protected `GET /api/me` route that returns the logged-in user's profile. Then in the client, after login, call `/api/me` and show the user's name. Follow README.md for the architecture and keep secrets in the right .env files."

Verify locally: click sign in → Google → land back logged in → your name shows. The frontend got the token, the backend verified it, the DB returned your profile. That's the entire architecture working.

---

## Step 5 — The `/health` keep-alive endpoint

Prompt:
> "Add a `GET /health` route on the server that runs a tiny query against Supabase (e.g. select 1 from a table) and returns 200 OK. This will be pinged to keep both Render and Supabase awake."

---

## Step 6 — Deploy (do this now, not later)

1. Push the repo to GitHub.
2. **Frontend → Vercel:** import the GitHub repo, set root to `client`, add env vars (Supabase URL, anon key, API base URL). Deploy → get `verso.vercel.app`.
3. **Backend → Render:** new Web Service from the repo, root `server`, add env vars (service_role key, JWT secret, Supabase URL). Deploy → get an `onrender.com` API URL.
4. Point the frontend's API base URL env var at the Render URL; redeploy frontend.
5. Add your Vercel URL to Supabase's allowed redirect URLs (Step 2.3) so Google login works in production.
6. **Keep-alive:** create a free **UptimeRobot** or **cron-job.org** monitor that pings `https://<your-render-url>/health` every ~10 minutes.

Prompt for help:
> "Walk me through deploying client to Vercel and server to Render step by step. Ask me for any dashboard values you need. Then tell me exactly what to put in the keep-alive pinger."

---

## Definition of Done ✅

- [ ] Monorepo on GitHub, `.env` files gitignored, `.env.example` present
- [ ] Supabase project created; schema run successfully (tables visible)
- [ ] Google login works **locally** and **on the live Vercel URL**
- [ ] Backend verifies the JWT; `/api/me` returns your profile
- [ ] `/health` endpoint live and green in UptimeRobot/cron-job.org
- [ ] Live frontend (Vercel) talks to live backend (Render)
- [ ] You can explain the login→JWT→API→DB flow out loud

When all boxes are checked, you have a deployed, authenticated app. Move to Phase 2.
