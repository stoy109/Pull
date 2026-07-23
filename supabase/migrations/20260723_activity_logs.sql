create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade
);

alter table public.profiles
  add column if not exists is_admin boolean;

update public.profiles
set is_admin = false
where is_admin is null;

alter table public.profiles
  alter column is_admin set default false,
  alter column is_admin set not null;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('umkm', 'pekerja', 'supplier', 'admin')),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz not null default now(),
  constraint activity_logs_action_format
    check (action ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'),
  constraint activity_logs_entity_type
    check (entity_type is null or entity_type in ('pool', 'job', 'application', 'profile', 'user')),
  constraint activity_logs_metadata_max_2kb
    check (octet_length(metadata::text) <= 2048)
);

create index if not exists activity_logs_created_at_idx
  on public.activity_logs (created_at desc);
create index if not exists activity_logs_user_created_at_idx
  on public.activity_logs (user_id, created_at desc);
create index if not exists activity_logs_role_created_at_idx
  on public.activity_logs (role, created_at desc);
create index if not exists activity_logs_action_created_at_idx
  on public.activity_logs (action, created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_select_own" on public.activity_logs;
create policy "activity_logs_select_own"
on public.activity_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Deliberately no INSERT policy: application writes use the service-role client.
grant select on public.profiles to authenticated;
grant select on public.activity_logs to authenticated;
grant all on public.activity_logs to service_role;

create or replace function public.get_active_users_count(
  since_at timestamptz default null
)
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select count(distinct user_id)::bigint
  from public.activity_logs
  where since_at is null or created_at >= since_at;
$$;

revoke all on function public.get_active_users_count(timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_active_users_count(timestamptz)
  to service_role;
