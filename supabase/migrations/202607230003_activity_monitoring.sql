begin;

do $$
begin
  create type public.activity_category as enum (
    'authentication',
    'account',
    'recruitment',
    'pool',
    'supplier',
    'system'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.activity_status as enum ('success', 'failed', 'denied');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role public.app_role,
  event_type text not null,
  category public.activity_category not null,
  target_type text,
  target_id text,
  description text not null,
  status public.activity_status not null default 'success',
  metadata jsonb not null default '{}'::jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  constraint activity_logs_event_type_check check (
    event_type = any (array[
      'auth.login_succeeded',
      'auth.logout',
      'profile.updated',
      'account.suspended',
      'account.reactivated',
      'role.changed',
      'access.denied',
      'job.created',
      'job.published',
      'job.updated',
      'application.accepted',
      'application.rejected',
      'assignment.completed',
      'application.submitted',
      'application.withdrawn',
      'work.confirmed',
      'rating.submitted',
      'pool.created',
      'pool.joined',
      'pool.status_changed',
      'supplier.offer_created',
      'supplier.order_status_changed'
    ])
  ),
  constraint activity_logs_description_length_check check (
    char_length(description) between 1 and 500
  ),
  constraint activity_logs_target_type_length_check check (
    target_type is null or char_length(target_type) between 1 and 80
  ),
  constraint activity_logs_target_id_length_check check (
    target_id is null or char_length(target_id) between 1 and 160
  ),
  constraint activity_logs_metadata_object_check check (
    jsonb_typeof(metadata) = 'object'
  ),
  constraint activity_logs_idempotency_length_check check (
    idempotency_key is null or char_length(idempotency_key) between 1 and 200
  )
);

create index if not exists activity_logs_created_at_idx
  on public.activity_logs(created_at desc);
create index if not exists activity_logs_actor_created_idx
  on public.activity_logs(actor_id, created_at desc);
create index if not exists activity_logs_role_created_idx
  on public.activity_logs(actor_role, created_at desc);
create index if not exists activity_logs_status_created_idx
  on public.activity_logs(status, created_at desc);
create unique index if not exists activity_logs_actor_idempotency_idx
  on public.activity_logs(actor_id, idempotency_key)
  where actor_id is not null and idempotency_key is not null;

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_select_self_or_admin" on public.activity_logs;
create policy "activity_logs_select_self_or_admin"
  on public.activity_logs
  for select
  to authenticated
  using (actor_id = auth.uid() or public.is_active_admin());

revoke all on table public.activity_logs from anon, authenticated;
grant select on table public.activity_logs to authenticated;
grant all on table public.activity_logs to service_role;

create or replace function public.record_current_login()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_role public.app_role;
  current_status public.account_status;
  last_sign_in timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select profiles.role, profiles.account_status
    into current_role, current_status
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
    current_role,
    case
      when current_status = 'active'::public.account_status
        then 'auth.login_succeeded'
      else 'access.denied'
    end,
    'authentication'::public.activity_category,
    'account',
    current_user_id::text,
    case
      when current_status = 'active'::public.account_status
        then 'Masuk ke akun Pull'
      else 'Login dibatasi karena akun tidak aktif'
    end,
    case
      when current_status = 'active'::public.account_status
        then 'success'::public.activity_status
      else 'denied'::public.activity_status
    end,
    jsonb_build_object('source', 'authenticated_session'),
    'login:' || coalesce(last_sign_in::text, date_trunc('minute', now())::text)
  )
  on conflict (actor_id, idempotency_key)
    where actor_id is not null and idempotency_key is not null
  do nothing;

  if current_status = 'active'::public.account_status then
    update public.profiles
    set last_active_at = now(),
        updated_at = now()
    where id = current_user_id;
  end if;

  return current_status = 'active'::public.account_status;
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
  current_role public.app_role;
  logout_bucket bigint := floor(extract(epoch from now()) / 300);
begin
  if current_user_id is null then
    return false;
  end if;

  select profiles.role
    into current_role
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
    current_role,
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

create or replace function public.touch_current_user_presence()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  touched_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.profiles
  set last_active_at = now(),
      updated_at = now()
  where id = current_user_id
    and account_status = 'active'::public.account_status
    and (
      last_active_at is null
      or last_active_at < now() - interval '60 seconds'
    )
  returning last_active_at into touched_at;

  if touched_at is null then
    select profiles.last_active_at
      into touched_at
    from public.profiles
    where profiles.id = current_user_id
      and profiles.account_status = 'active'::public.account_status;
  end if;

  if touched_at is null then
    raise exception 'Active profile is not available';
  end if;

  return touched_at;
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
  current_role public.app_role;
  current_status public.account_status;
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
    into current_role, current_status
  from public.profiles
  where profiles.id = current_user_id;

  if not found or current_role is null then
    return false;
  end if;

  if current_role = parsed_required_role
    and current_status = 'active'::public.account_status then
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
    current_role,
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

create or replace function public.log_profile_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity_actor_id uuid := coalesce(auth.uid(), new.id);
  activity_actor_role public.app_role;
begin
  select profiles.role
    into activity_actor_role
  from public.profiles
  where profiles.id = activity_actor_id;

  if old.role is distinct from new.role and new.role is not null then
    insert into public.activity_logs (
      actor_id,
      actor_role,
      event_type,
      category,
      target_type,
      target_id,
      description,
      status,
      metadata
    )
    values (
      activity_actor_id,
      activity_actor_role,
      'role.changed',
      'account'::public.activity_category,
      'profile',
      new.id::text,
      'Peran akun ditetapkan menjadi ' || new.role::text,
      'success'::public.activity_status,
      jsonb_build_object('previous_role', old.role, 'new_role', new.role)
    );
  end if;

  if old.account_status is distinct from new.account_status then
    insert into public.activity_logs (
      actor_id,
      actor_role,
      event_type,
      category,
      target_type,
      target_id,
      description,
      status,
      metadata
    )
    values (
      activity_actor_id,
      activity_actor_role,
      case
        when new.account_status = 'suspended'::public.account_status
          then 'account.suspended'
        else 'account.reactivated'
      end,
      'account'::public.activity_category,
      'profile',
      new.id::text,
      case
        when new.account_status = 'suspended'::public.account_status
          then 'Akun pengguna ditangguhkan'
        else 'Akun pengguna diaktifkan kembali'
      end,
      'success'::public.activity_status,
      jsonb_build_object(
        'previous_status', old.account_status,
        'new_status', new.account_status
      )
    );
  end if;

  if old.display_name is distinct from new.display_name
    or old.business_name is distinct from new.business_name
    or old.headline is distinct from new.headline
    or old.delivery_area is distinct from new.delivery_area
    or old.phone is distinct from new.phone then
    insert into public.activity_logs (
      actor_id,
      actor_role,
      event_type,
      category,
      target_type,
      target_id,
      description,
      status,
      metadata
    )
    values (
      activity_actor_id,
      activity_actor_role,
      'profile.updated',
      'account'::public.activity_category,
      'profile',
      new.id::text,
      'Memperbarui informasi profil',
      'success'::public.activity_status,
      '{}'::jsonb
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_profile_activity on public.profiles;
create trigger on_profile_activity
  after update of role, account_status, display_name, business_name, headline, delivery_area, phone
  on public.profiles
  for each row execute procedure public.log_profile_activity();

create or replace function public.get_admin_monitoring(
  period_days integer default 7,
  role_filter text default null,
  app_timezone text default 'Asia/Jakarta'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_days integer;
  normalized_role public.app_role;
  normalized_timezone text;
  today_start timestamptz;
  period_start timestamptz;
  result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  normalized_days := case when period_days = 30 then 30 else 7 end;

  if role_filter is not null and role_filter <> '' then
    if role_filter not in ('admin', 'umkm', 'pekerja', 'supplier') then
      raise exception 'Unknown role filter';
    end if;
    normalized_role := role_filter::public.app_role;
  end if;

  select timezone_names.name
    into normalized_timezone
  from pg_catalog.pg_timezone_names as timezone_names
  where timezone_names.name = app_timezone;

  normalized_timezone := coalesce(normalized_timezone, 'Asia/Jakarta');
  today_start := date_trunc('day', now() at time zone normalized_timezone)
    at time zone normalized_timezone;
  period_start := (
    date_trunc('day', now() at time zone normalized_timezone)
    - ((normalized_days - 1)::text || ' days')::interval
  ) at time zone normalized_timezone;

  select jsonb_build_object(
    'generated_at', now(),
    'period_days', normalized_days,
    'role_filter', normalized_role,
    'metrics', jsonb_build_object(
      'active_users', (
        select count(*)
        from public.profiles
        where account_status = 'active'::public.account_status
          and last_active_at >= now() - interval '15 minutes'
          and (normalized_role is null or role = normalized_role)
      ),
      'activities_today', (
        select count(*)
        from public.activity_logs
        where created_at >= today_start
          and (normalized_role is null or actor_role = normalized_role)
      ),
      'total_users', (
        select count(*)
        from public.profiles
        where normalized_role is null or role = normalized_role
      ),
      'attention', (
        (
          select count(*)
          from public.activity_logs
          where created_at >= today_start
            and status in (
              'failed'::public.activity_status,
              'denied'::public.activity_status
            )
            and (normalized_role is null or actor_role = normalized_role)
        )
        +
        (
          select count(*)
          from public.profiles
          where account_status = 'suspended'::public.account_status
            and (normalized_role is null or role = normalized_role)
        )
      )
    ),
    'user_distribution', (
      select jsonb_build_object(
        'admin', count(*) filter (where role = 'admin'::public.app_role),
        'umkm', count(*) filter (where role = 'umkm'::public.app_role),
        'pekerja', count(*) filter (where role = 'pekerja'::public.app_role),
        'supplier', count(*) filter (where role = 'supplier'::public.app_role),
        'unassigned', count(*) filter (where role is null)
      )
      from public.profiles
    ),
    'activity_distribution', (
      select jsonb_build_object(
        'admin', count(*) filter (where actor_role = 'admin'::public.app_role),
        'umkm', count(*) filter (where actor_role = 'umkm'::public.app_role),
        'pekerja', count(*) filter (where actor_role = 'pekerja'::public.app_role),
        'supplier', count(*) filter (where actor_role = 'supplier'::public.app_role)
      )
      from public.activity_logs
      where created_at >= period_start
        and (normalized_role is null or actor_role = normalized_role)
    ),
    'trend', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'date', day_series.day::date,
            'count', coalesce(day_counts.activity_count, 0)
          )
          order by day_series.day
        ),
        '[]'::jsonb
      )
      from generate_series(
        period_start at time zone normalized_timezone,
        date_trunc('day', now() at time zone normalized_timezone),
        interval '1 day'
      ) as day_series(day)
      left join lateral (
        select count(*) as activity_count
        from public.activity_logs
        where (created_at at time zone normalized_timezone)::date = day_series.day::date
          and (normalized_role is null or actor_role = normalized_role)
      ) as day_counts on true
    ),
    'recent_activities', (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', recent.id,
            'actor_id', recent.actor_id,
            'actor_name', recent.actor_name,
            'actor_email', recent.actor_email,
            'actor_role', recent.actor_role,
            'event_type', recent.event_type,
            'category', recent.category,
            'target_type', recent.target_type,
            'target_id', recent.target_id,
            'description', recent.description,
            'status', recent.status,
            'created_at', recent.created_at
          )
          order by recent.created_at desc
        ),
        '[]'::jsonb
      )
      from (
        select
          logs.id,
          logs.actor_id,
          coalesce(profiles.display_name, profiles.business_name, 'Pengguna Pull') as actor_name,
          profiles.email as actor_email,
          logs.actor_role,
          logs.event_type,
          logs.category,
          logs.target_type,
          logs.target_id,
          logs.description,
          logs.status,
          logs.created_at
        from public.activity_logs as logs
        left join public.profiles as profiles on profiles.id = logs.actor_id
        where logs.created_at >= period_start
          and (normalized_role is null or logs.actor_role = normalized_role)
        order by logs.created_at desc
        limit 12
      ) as recent
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.record_current_login() from public, anon, authenticated;
revoke all on function public.record_current_logout() from public, anon, authenticated;
revoke all on function public.touch_current_user_presence() from public, anon, authenticated;
revoke all on function public.record_access_denied(text) from public, anon, authenticated;
revoke all on function public.get_admin_monitoring(integer, text, text) from public, anon, authenticated;
revoke all on function public.log_profile_activity() from public, anon, authenticated;

grant execute on function public.record_current_login() to authenticated, service_role;
grant execute on function public.record_current_logout() to authenticated, service_role;
grant execute on function public.touch_current_user_presence() to authenticated, service_role;
grant execute on function public.record_access_denied(text) to authenticated, service_role;
grant execute on function public.get_admin_monitoring(integer, text, text) to authenticated, service_role;

commit;
