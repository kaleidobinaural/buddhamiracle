-- ==========================================
-- ★ Temple of Light - Database Schema
-- ==========================================

-- 1. Enable the pgvector extension for RAG (Task 2)
create extension if not exists vector;

-- 2. User Limits Table (chat credits + lotus count)
create table if not exists user_limits (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  chat_count integer default 0,
  last_chat_date text,
  membership_tier text default 'free',
  -- 🪷 Lotus credits: charged via Lemon Squeezy webhook, consumed per chat/ebook
  lotus_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2b. Webhook event log (prevents duplicate credit grants on retry)
create table if not exists webhook_logs (
  id uuid default gen_random_uuid() primary key,
  event_id text not null unique,  -- Lemon Squeezy event ID
  event_type text,
  processed_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. Scriptures Table (Task 2)
create table if not exists scriptures (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  metadata jsonb,
  -- ★ DIMENSION NOTE: gemini-embedding-001 returns 3072 dims, sliced to 1536.
  -- All seed scripts (seed_full.py, seed_sample.py) and the chat API (lib/chat.ts)
  -- must consistently use [:1536] slicing. Do NOT change this without re-seeding the DB.
  embedding vector(1536),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 4. Vector Search Function (Task 2)
create or replace function match_scriptures (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    scriptures.id,
    scriptures.content,
    scriptures.metadata,
    1 - (scriptures.embedding <=> query_embedding) as similarity
  from scriptures
  where 1 - (scriptures.embedding <=> query_embedding) > match_threshold
  order by scriptures.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 5. Row Level Security (RLS)
-- Wishes: Anyone can read, only authenticated users can insert their own.
alter table wishes enable row level security;

create policy "Anyone can view wishes" 
  on wishes for select 
  using (true);

create policy "Authenticated users can insert wishes" 
  on wishes for insert 
  with check (auth.role() = 'authenticated');

-- Scriptures: Read-only for public, admin only for insert (via service role).
alter table scriptures enable row level security;

create policy "Anyone can read scriptures" 
  on scriptures for select 
  using (true);

-- ==========================================
-- ★ wish_likes — Duplicate-like prevention
-- ==========================================
-- Run this in your Supabase SQL editor if you haven't already.

-- 6. wish_likes table (tracks which user liked which wish)
create table if not exists wish_likes (
  id           uuid default gen_random_uuid() primary key,
  wish_id      uuid not null references wishes(id) on delete cascade,
  user_email   text not null,
  created_at   timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Enforce one like per user per wish at the database level
  unique (wish_id, user_email)
);

alter table wish_likes enable row level security;

create policy "Users can view own likes"
  on wish_likes for select
  using (true);

create policy "Authenticated users can insert likes"
  on wish_likes for insert
  with check (true);

create policy "Authenticated users can delete own likes"
  on wish_likes for delete
  using (true);

-- 7. adjust_wish_likes RPC — atomic increment / decrement
--    Called from the PATCH /api/wishes handler to avoid race conditions.
create or replace function adjust_wish_likes(p_id uuid, p_delta int)
returns void
language plpgsql
as $$
begin
  update wishes
  set likes_count = greatest(0, coalesce(likes_count, 0) + p_delta)
  where id = p_id;
end;
$$;
