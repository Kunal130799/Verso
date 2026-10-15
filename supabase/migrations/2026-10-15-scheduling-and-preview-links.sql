-- Post scheduling + draft preview links — run once in the Supabase SQL
-- Editor BEFORE deploying the matching server code. Safe to re-run.

-- Scheduling: a scheduled post is a draft with scheduled_at set; the API
-- server flips it to public once that time has passed
-- (see server/src/lib/scheduler.js).
alter table public.posts add column if not exists scheduled_at timestamptz;

create index if not exists posts_scheduled_idx on public.posts (scheduled_at)
  where scheduled_at is not null;

-- Preview links: an unguessable token that lets anyone holding the link
-- read the post before it's public. null = no link; revoking clears it.
-- Never selected into public post responses — only the author sees it.
alter table public.posts add column if not exists preview_token uuid;

create unique index if not exists posts_preview_token_idx on public.posts (preview_token)
  where preview_token is not null;
