-- FarmFrame user data: one row per user, protected by row level security.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;
create policy "own select" on public.user_state for select using ((select auth.uid()) = user_id);
create policy "own insert" on public.user_state for insert with check ((select auth.uid()) = user_id);
create policy "own update" on public.user_state for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own delete" on public.user_state for delete using ((select auth.uid()) = user_id);

-- Data problem reports: anyone may submit, nobody can read them through the public API (review in the dashboard).
create table if not exists public.data_reports (
  id bigint generated always as identity primary key,
  category text not null check (char_length(category) between 1 and 60),
  page text not null check (char_length(page) between 1 and 200),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
alter table public.data_reports enable row level security;
create policy "anyone can report" on public.data_reports for insert to anon, authenticated with check (true);
