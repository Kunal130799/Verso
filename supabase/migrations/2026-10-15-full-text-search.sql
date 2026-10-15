-- Full-text search for posts — run once in the Supabase SQL Editor.
-- Safe to re-run. Until this exists, /api/search falls back to substring
-- matching, so the app works before and after.

-- Weighted search document: title matches rank above excerpt, excerpt above body.
alter table public.posts add column if not exists search tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) stored;

create index if not exists posts_search_idx on public.posts using gin (search);

-- Ranked ids of public posts matching a search-engine-style query
-- ("quoted phrases", -excluded, or).
create or replace function public.search_posts(q text, max_results int default 30)
returns table (id uuid, rank real)
language sql stable
as $$
  select p.id, ts_rank(p.search, query) as rank
  from public.posts p, websearch_to_tsquery('english', q) as query
  where p.status = 'public' and p.search @@ query
  order by rank desc, p.published_at desc
  limit max_results
$$;
