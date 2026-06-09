-- VERSO SCHEMA — run once in Supabase SQL Editor

-- 1. PROFILES
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

-- 5. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    'user_' || substr(new.id::text, 1, 8),
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

-- 6. Auto-touch updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- 7. Row Level Security
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
create policy "users delete own profile" on public.profiles
  for delete using (auth.uid() = id);

create policy "tags readable" on public.tags for select using (true);
create policy "post_tags readable" on public.post_tags for select using (true);

-- 8. Storage bucket for covers (run in Supabase dashboard or here)
-- insert into storage.buckets (id, name, public) values ('covers', 'covers', true)
-- on conflict do nothing;
