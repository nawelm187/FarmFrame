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
