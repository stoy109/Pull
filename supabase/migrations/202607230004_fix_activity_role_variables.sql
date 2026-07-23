create or replace function public.record_current_login()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  stored_role public.app_role;
  stored_status public.account_status;
  last_sign_in timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select profiles.role, profiles.account_status
    into stored_role, stored_status
  from public.profiles
  where profiles.id = current_user_id;

  if not found then
    raise exception 'Profile is not available';
  end if;

  select users.last_sign_in_at
    into last_sign_in
  from auth.users
  where users.id = current_user_id;

  insert into public.activity_logs (
    actor_id,
    actor_role,
    event_type,
    category,
    target_type,
    target_id,
    description,
    status,
    metadata,
    idempotency_key
  )
  values (
    current_user_id,
    stored_role,
    case
      when stored_status = 'active'::public.account_status
        then 'auth.login_succeeded'
      else 'access.denied'
    end,
    'authentication'::public.activity_category,
    'account',
    current_user_id::text,
    case
      when stored_status = 'active'::public.account_status
        then 'Masuk ke akun Pull'
      else 'Login dibatasi karena akun tidak aktif'
    end,
    case
      when stored_status = 'active'::public.account_status
        then 'success'::public.activity_status
      else 'denied'::public.activity_status
    end,
    jsonb_build_object('source', 'authenticated_session'),
    'login:' || coalesce(last_sign_in::text, date_trunc('minute', now())::text)
  )
  on conflict (actor_id, idempotency_key)
    where actor_id is not null and idempotency_key is not null
  do nothing;

  if stored_status = 'active'::public.account_status then
    update public.profiles
    set last_active_at = now(),
        updated_at = now()
    where id = current_user_id;
  end if;

  return stored_status = 'active'::public.account_status;
end;
$$;

create or replace function public.record_current_logout()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  stored_role public.app_role;
  logout_bucket bigint := floor(extract(epoch from now()) / 300);
begin
  if current_user_id is null then
    return false;
  end if;

  select profiles.role
    into stored_role
  from public.profiles
  where profiles.id = current_user_id;

  if not found then
    return false;
  end if;

  insert into public.activity_logs (
    actor_id,
    actor_role,
    event_type,
    category,
    target_type,
    target_id,
    description,
    status,
    metadata,
    idempotency_key
  )
  values (
    current_user_id,
    stored_role,
    'auth.logout',
    'authentication'::public.activity_category,
    'account',
    current_user_id::text,
    'Keluar dari akun Pull',
    'success'::public.activity_status,
    '{}'::jsonb,
    'logout:' || logout_bucket::text
  )
  on conflict (actor_id, idempotency_key)
    where actor_id is not null and idempotency_key is not null
  do nothing;

  return true;
end;
$$;

create or replace function public.record_access_denied(required_role text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  stored_role public.app_role;
  stored_status public.account_status;
  parsed_required_role public.app_role;
  denied_bucket bigint := floor(extract(epoch from now()) / 300);
  requested_area text;
begin
  if current_user_id is null then
    return false;
  end if;

  if required_role not in ('admin', 'umkm', 'pekerja', 'supplier') then
    raise exception 'Unknown role';
  end if;

  parsed_required_role := required_role::public.app_role;

  select profiles.role, profiles.account_status
    into stored_role, stored_status
  from public.profiles
  where profiles.id = current_user_id;

  if not found or stored_role is null then
    return false;
  end if;

  if stored_role = parsed_required_role
    and stored_status = 'active'::public.account_status then
    return false;
  end if;

  requested_area := case parsed_required_role
    when 'admin'::public.app_role then '/admin'
    when 'umkm'::public.app_role then '/dashboard'
    when 'pekerja'::public.app_role then '/worker'
    when 'supplier'::public.app_role then '/supplier'
  end;

  insert into public.activity_logs (
    actor_id,
    actor_role,
    event_type,
    category,
    target_type,
    target_id,
    description,
    status,
    metadata,
    idempotency_key
  )
  values (
    current_user_id,
    stored_role,
    'access.denied',
    'system'::public.activity_category,
    'route_area',
    requested_area,
    'Akses ke area role lain ditolak',
    'denied'::public.activity_status,
    jsonb_build_object('required_role', parsed_required_role),
    'denied:' || parsed_required_role::text || ':' || denied_bucket::text
  )
  on conflict (actor_id, idempotency_key)
    where actor_id is not null and idempotency_key is not null
  do nothing;

  return true;
end;
$$;
