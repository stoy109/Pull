begin;

do $$
begin
  create type public.app_role as enum ('admin', 'umkm', 'pekerja', 'supplier');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.account_status as enum ('active', 'suspended');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  business_name text,
  headline text,
  delivery_area text,
  phone text,
  role public.app_role,
  account_status public.account_status not null default 'active',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_account_status_idx on public.profiles(account_status);
create index if not exists profiles_last_active_at_idx on public.profiles(last_active_at desc);

create or replace function public.role_from_auth_metadata(
  app_metadata jsonb,
  user_metadata jsonb
)
returns public.app_role
language sql
immutable
set search_path = ''
as $$
  select case
    when app_metadata ->> 'role' = 'admin' then 'admin'::public.app_role
    when app_metadata ->> 'role' in ('umkm', 'pekerja', 'supplier')
      then (app_metadata ->> 'role')::public.app_role
    when user_metadata ->> 'role' in ('umkm', 'pekerja', 'supplier')
      then (user_metadata ->> 'role')::public.app_role
    else null
  end;
$$;

create or replace function public.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    display_name,
    business_name,
    headline,
    delivery_area,
    phone,
    role,
    last_active_at
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name'),
    new.raw_user_meta_data ->> 'business_name',
    new.raw_user_meta_data ->> 'headline',
    new.raw_user_meta_data ->> 'delivery_area',
    new.raw_user_meta_data ->> 'phone',
    public.role_from_auth_metadata(new.raw_app_meta_data, new.raw_user_meta_data),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    business_name = coalesce(excluded.business_name, public.profiles.business_name),
    headline = coalesce(excluded.headline, public.profiles.headline),
    delivery_area = coalesce(excluded.delivery_area, public.profiles.delivery_area),
    phone = coalesce(excluded.phone, public.profiles.phone),
    role = coalesce(public.profiles.role, excluded.role),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_profile_sync on auth.users;
create trigger on_auth_user_profile_sync
  after insert or update of email, raw_app_meta_data, raw_user_meta_data
  on auth.users
  for each row execute procedure public.sync_auth_user_profile();

insert into public.profiles (
  id,
  email,
  display_name,
  business_name,
  headline,
  delivery_area,
  phone,
  role,
  last_active_at,
  created_at,
  updated_at
)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'display_name', users.raw_user_meta_data ->> 'full_name'),
  users.raw_user_meta_data ->> 'business_name',
  users.raw_user_meta_data ->> 'headline',
  users.raw_user_meta_data ->> 'delivery_area',
  users.raw_user_meta_data ->> 'phone',
  public.role_from_auth_metadata(users.raw_app_meta_data, users.raw_user_meta_data),
  users.last_sign_in_at,
  users.created_at,
  now()
from auth.users as users
on conflict (id) do update set
  email = excluded.email,
  display_name = coalesce(excluded.display_name, public.profiles.display_name),
  business_name = coalesce(excluded.business_name, public.profiles.business_name),
  headline = coalesce(excluded.headline, public.profiles.headline),
  delivery_area = coalesce(excluded.delivery_area, public.profiles.delivery_area),
  phone = coalesce(excluded.phone, public.profiles.phone),
  role = coalesce(public.profiles.role, excluded.role),
  last_active_at = coalesce(public.profiles.last_active_at, excluded.last_active_at),
  updated_at = now();

create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'::public.app_role
      and account_status = 'active'::public.account_status
  );
$$;

create or replace function public.set_own_role(requested_role text)
returns public.app_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  parsed_role public.app_role;
  current_role public.app_role;
  current_status public.account_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if requested_role not in ('umkm', 'pekerja', 'supplier') then
    raise exception 'Role is not available for public onboarding';
  end if;

  parsed_role := requested_role::public.app_role;

  select role, account_status
    into current_role, current_status
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile is not available';
  end if;

  if current_status <> 'active'::public.account_status then
    raise exception 'Account is not active';
  end if;

  if current_role is not null and current_role <> parsed_role then
    raise exception 'Role can only be selected once';
  end if;

  update public.profiles
  set role = parsed_role,
      updated_at = now()
  where id = auth.uid();

  return parsed_role;
end;
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_active_admin());

drop policy if exists "profiles_update_own_safe_fields" on public.profiles;
create policy "profiles_update_own_safe_fields"
  on public.profiles
  for update
  to authenticated
  using (
    id = auth.uid()
    and account_status = 'active'::public.account_status
  )
  with check (
    id = auth.uid()
    and account_status = 'active'::public.account_status
  );

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (
  display_name,
  business_name,
  headline,
  delivery_area,
  phone,
  last_active_at,
  updated_at
) on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

revoke all on function public.set_own_role(text) from public, anon;
grant execute on function public.set_own_role(text) to authenticated, service_role;
grant execute on function public.is_active_admin() to authenticated, service_role;

commit;
