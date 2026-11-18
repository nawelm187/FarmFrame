-- FarmFrame database. Safe to run again at any time (every statement is idempotent).
-- Security model: the browser only holds the public (publishable) key, so every table is protected by row level security
-- and by minimal grants; nothing here is readable or writable by the public API unless a policy below says so.

-- 0. Account lifecycle helpers (used by the policies below; the rest of the lifecycle is section 4).
create table if not exists public.account_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deleted_at timestamptz not null default now(),
  purge_at timestamptz not null
);
alter table public.account_status enable row level security;   -- no policy: only the functions in section 4 touch it
revoke all on public.account_status from anon, authenticated;
create or replace function public.account_active(p_uid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.account_status where user_id = p_uid)
$$;
revoke execute on function public.account_active(uuid) from public, anon;
grant execute on function public.account_active(uuid) to authenticated;

-- 1. Per-user synced data: one row per user. Only that user can read or change it.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;
-- The data must be a JSON object and at most about 1 MB, so one account cannot fill the database.
alter table public.user_state drop constraint if exists user_state_shape;
alter table public.user_state add constraint user_state_shape check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 1000000);
drop policy if exists "own select" on public.user_state; drop policy if exists "own insert" on public.user_state; drop policy if exists "own update" on public.user_state; drop policy if exists "own delete" on public.user_state;
-- While an account is scheduled for deletion (section 4) its data is closed: nothing can be read or written until it is restored.
create policy "own select" on public.user_state for select to authenticated using ((select auth.uid()) = user_id and public.account_active((select auth.uid())));
create policy "own insert" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id and public.account_active((select auth.uid())));
create policy "own update" on public.user_state for update to authenticated using ((select auth.uid()) = user_id and public.account_active((select auth.uid()))) with check ((select auth.uid()) = user_id and public.account_active((select auth.uid())));
create policy "own delete" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);
-- The server sets the timestamp; the client cannot forge it.
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists user_state_touch on public.user_state;
create trigger user_state_touch before insert or update on public.user_state for each row execute function public.touch_updated_at();
-- Minimal grants: signed-out visitors (anon) have no access at all.
revoke all on public.user_state from anon, authenticated;
grant select, insert, update, delete on public.user_state to authenticated;

-- 2. Data problem reports: anyone may send one, nobody can read them through the public API (review them in the dashboard).
create table if not exists public.data_reports (
  id bigint generated always as identity primary key,
  category text not null check (char_length(category) between 1 and 60),
  page text not null check (char_length(page) between 1 and 200),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
alter table public.data_reports enable row level security;
drop policy if exists "anyone can report" on public.data_reports;
create policy "anyone can report" on public.data_reports for insert to anon, authenticated with check (true);
revoke all on public.data_reports from anon, authenticated;
grant insert on public.data_reports to anon, authenticated;
-- Flood guard: at most 100 reports per hour in total. It must run as the table owner because the sender has no right to read the table.
create index if not exists data_reports_created_at on public.data_reports (created_at);
create or replace function public.reports_cap() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.data_reports where created_at > now() - interval '1 hour') >= 100 then raise exception 'too many reports, try again later'; end if;
  return new;
end $$;
revoke execute on function public.reports_cap() from public, anon, authenticated;
drop trigger if exists reports_cap on public.data_reports;
create trigger reports_cap before insert on public.data_reports for each row execute function public.reports_cap();

-- 3. Daily quota for the AI analysis, so nobody can run up the bill. Only the server (service role) can use it.
-- user_id 00000000-0000-0000-0000-000000000000 holds the counter for everybody together.
create table if not exists public.ai_usage (
  day date not null, user_id uuid not null, n int not null default 0, primary key (day, user_id)
);
alter table public.ai_usage enable row level security;   -- no policy: closed to the public API
revoke all on public.ai_usage from anon, authenticated;
create or replace function public.ai_take(p_user uuid, p_user_max int, p_global_max int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare u int; g int;
begin
  delete from public.ai_usage where day < current_date - 30;
  insert into public.ai_usage (day, user_id, n) values (current_date, p_user, 1)
    on conflict (day, user_id) do update set n = public.ai_usage.n + 1 returning n into u;
  if u > p_user_max then return false; end if;
  insert into public.ai_usage (day, user_id, n) values (current_date, '00000000-0000-0000-0000-000000000000', 1)
    on conflict (day, user_id) do update set n = public.ai_usage.n + 1 returning n into g;
  return g <= p_global_max;
end $$;
revoke execute on function public.ai_take(uuid, int, int) from public, anon, authenticated;
grant execute on function public.ai_take(uuid, int, int) to service_role;

-- 4. Account lifecycle, anonymous history and the administrator view.
-- Errors use PostgREST's PTnnn codes, so the HTTP status is the number after PT (see docs/ERRORES.md).
-- 4a. Anonymous history: what happened and when, never who. After an account is erased nothing personal is left.
create table if not exists public.account_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  kind text not null check (kind in ('created', 'deletion_requested', 'restored', 'erased_now', 'purged'))
);
create index if not exists account_events_at on public.account_events (at);
alter table public.account_events enable row level security;
revoke all on public.account_events from anon, authenticated;
create or replace function public.log_account_created() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.account_events (kind) values ('created'); return new; end $$;
drop trigger if exists farmframe_account_created on auth.users;
create trigger farmframe_account_created after insert on auth.users for each row execute function public.log_account_created();

-- 4b. What the signed-in person can do with their own account. Each one checks the token, and the destructive ones the typed email.
create or replace function public.my_account_state() returns json language sql stable security definer set search_path = '' as $$
  select coalesce((select json_build_object('deleted', true, 'deleted_at', s.deleted_at, 'purge_at', s.purge_at) from public.account_status s where s.user_id = auth.uid()), json_build_object('deleted', false))
$$;
create or replace function public.request_account_deletion(p_confirm text) returns timestamptz language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); mail text := lower(coalesce(auth.jwt() ->> 'email', '')); due timestamptz;
begin
  if uid is null then raise exception 'login required' using errcode = 'PT401'; end if;
  if mail = '' or lower(trim(coalesce(p_confirm, ''))) <> mail then raise exception 'confirmation does not match' using errcode = 'PT400'; end if;
  insert into public.account_status (user_id, deleted_at, purge_at) values (uid, now(), now() + interval '30 days') on conflict (user_id) do nothing;
  if found then insert into public.account_events (kind) values ('deletion_requested'); end if;
  select purge_at into due from public.account_status where user_id = uid;
  return due;
end $$;
create or replace function public.restore_account() returns boolean language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'login required' using errcode = 'PT401'; end if;
  delete from public.account_status where user_id = uid and purge_at > now();
  if not found then return false; end if;
  insert into public.account_events (kind) values ('restored');
  return true;
end $$;
create or replace function public.erase_my_account(p_confirm text) returns boolean language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); mail text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  if uid is null then raise exception 'login required' using errcode = 'PT401'; end if;
  if mail = '' or lower(trim(coalesce(p_confirm, ''))) <> mail then raise exception 'confirmation does not match' using errcode = 'PT400'; end if;
  insert into public.account_events (kind) values ('erased_now');
  delete from auth.users where id = uid;   -- cascades to user_state, account_status, sessions and identities
  return true;
end $$;
revoke execute on function public.my_account_state(), public.request_account_deletion(text), public.restore_account(), public.erase_my_account(text) from public, anon;
grant execute on function public.my_account_state(), public.request_account_deletion(text), public.restore_account(), public.erase_my_account(text) to authenticated;

-- 4c. Real erasure after the 30 days. Runs every night through pg_cron; see docs/SEGURIDAD.md for how to enable the extension.
create or replace function public.purge_due_accounts() returns int language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  with gone as (delete from auth.users u using public.account_status s where u.id = s.user_id and s.purge_at <= now() returning u.id)
  select count(*) into n from gone;
  insert into public.account_events (kind) select 'purged' from generate_series(1, n);
  return n;
end $$;
revoke execute on function public.purge_due_accounts() from public, anon, authenticated;
grant execute on function public.purge_due_accounts() to service_role;
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('farmframe-purge', '17 3 * * *', 'select public.purge_due_accounts()');
  end if;
end $$;

-- 4d. Visitors online now: a random per-tab id, no account, no IP, no cookie. Rows older than 10 minutes are removed.
create table if not exists public.presence (session_id uuid primary key, seen_at timestamptz not null default now());
create index if not exists presence_seen_at on public.presence (seen_at);
create table if not exists public.daily_peak (day date primary key, peak int not null);
alter table public.presence enable row level security; alter table public.daily_peak enable row level security;
revoke all on public.presence, public.daily_peak from anon, authenticated;
create or replace function public.heartbeat(p_session uuid) returns void language plpgsql security definer set search_path = '' as $$
declare n int;
begin
  if p_session is null then return; end if;
  if random() < 0.05 then delete from public.presence where seen_at < now() - interval '10 minutes'; end if;
  -- Flood guard: the table cannot grow past 5000 live rows, whatever is sent.
  if (select count(*) from public.presence) >= 5000 and not exists (select 1 from public.presence where session_id = p_session) then return; end if;
  insert into public.presence (session_id, seen_at) values (p_session, now()) on conflict (session_id) do update set seen_at = now();
  select count(*) into n from public.presence where seen_at > now() - interval '2 minutes';
  insert into public.daily_peak (day, peak) values (current_date, n) on conflict (day) do update set peak = greatest(public.daily_peak.peak, excluded.peak);
end $$;
revoke execute on function public.heartbeat(uuid) from public;
grant execute on function public.heartbeat(uuid) to anon, authenticated;

-- 4e. Administrator view. Only people listed in public.admins can call it. Add yourself once, from the SQL Editor:
--   insert into public.admins (user_id) select id from auth.users where email = 'your@email';
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
create or replace function public.admin_stats() returns json language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'login required' using errcode = 'PT401'; end if;
  if not exists (select 1 from public.admins where user_id = auth.uid()) then raise exception 'forbidden' using errcode = 'PT403'; end if;
  return json_build_object(
    'active_now', (select count(*) from public.presence where seen_at > now() - interval '2 minutes'),
    'accounts_total', (select count(*) from auth.users),
    'accounts_pending_deletion', (select count(*) from public.account_status),
    'created_since_install', (select count(*) from public.account_events where kind = 'created'),
    'events_by_day', (select coalesce(json_agg(r order by r.day, r.kind), '[]'::json) from (select at::date as day, kind, count(*) as n from public.account_events where at > now() - interval '30 days' group by 1, 2) r),
    'peak_by_day', (select coalesce(json_agg(p order by p.day), '[]'::json) from (select day, peak from public.daily_peak where day > current_date - 30) p));
end $$;
revoke execute on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;
