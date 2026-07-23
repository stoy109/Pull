begin;

create or replace function public.get_admin_users(
  search_query text default null,
  role_filter text default null,
  status_filter text default null,
  page_number integer default 1,
  page_size integer default 10,
  app_timezone text default 'Asia/Jakarta'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_search text := nullif(left(trim(search_query), 80), '');
  normalized_role public.app_role;
  normalized_status public.account_status;
  normalized_page integer := greatest(coalesce(page_number, 1), 1);
  normalized_page_size integer := least(greatest(coalesce(page_size, 10), 1), 50);
  normalized_timezone text;
  today_start timestamptz;
  result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  if role_filter is not null and role_filter <> '' then
    if role_filter not in ('admin', 'umkm', 'pekerja', 'supplier') then
      raise exception 'Unknown role filter';
    end if;
    normalized_role := role_filter::public.app_role;
  end if;

  if status_filter is not null and status_filter <> '' then
    if status_filter not in ('active', 'suspended') then
      raise exception 'Unknown status filter';
    end if;
    normalized_status := status_filter::public.account_status;
  end if;

  select timezone_names.name
    into normalized_timezone
  from pg_catalog.pg_timezone_names as timezone_names
  where timezone_names.name = app_timezone;

  normalized_timezone := coalesce(normalized_timezone, 'Asia/Jakarta');
  today_start := date_trunc('day', now() at time zone normalized_timezone)
    at time zone normalized_timezone;

  with filtered_profiles as (
    select
      profiles.id,
      profiles.email,
      profiles.display_name,
      profiles.business_name,
      profiles.role,
      profiles.account_status,
      profiles.last_active_at,
      profiles.created_at,
      (
        select count(*)
        from public.activity_logs as logs
        where logs.actor_id = profiles.id
          and logs.created_at >= today_start
      ) as activities_today
    from public.profiles
    where (normalized_role is null or profiles.role = normalized_role)
      and (normalized_status is null or profiles.account_status = normalized_status)
      and (
        normalized_search is null
        or profiles.email ilike '%' || normalized_search || '%'
        or profiles.display_name ilike '%' || normalized_search || '%'
        or profiles.business_name ilike '%' || normalized_search || '%'
      )
  ),
  paged_profiles as (
    select *
    from filtered_profiles
    order by created_at desc, id
    limit normalized_page_size
    offset (normalized_page - 1) * normalized_page_size
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered_profiles),
    'page', normalized_page,
    'page_size', normalized_page_size,
    'users', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', paged.id,
            'email', paged.email,
            'display_name', paged.display_name,
            'business_name', paged.business_name,
            'role', paged.role,
            'account_status', paged.account_status,
            'last_active_at', paged.last_active_at,
            'activities_today', paged.activities_today,
            'created_at', paged.created_at
          )
          order by paged.created_at desc, paged.id
        )
        from paged_profiles as paged
      ),
      '[]'::jsonb
    )
  ) into result;

  return result;
end;
$$;

create or replace function public.set_user_account_status(
  target_user_id uuid,
  requested_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_user_id uuid := auth.uid();
  parsed_status public.account_status;
  target_profile public.profiles%rowtype;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  if target_user_id is null then
    raise exception 'Target user is required';
  end if;

  if target_user_id = actor_user_id then
    raise exception 'Administrator cannot change their own account status';
  end if;

  if requested_status not in ('active', 'suspended') then
    raise exception 'Unknown account status';
  end if;

  parsed_status := requested_status::public.account_status;

  select profiles.*
    into target_profile
  from public.profiles
  where profiles.id = target_user_id
  for update;

  if not found then
    raise exception 'Target profile is not available';
  end if;

  if target_profile.role = 'admin'::public.app_role then
    raise exception 'Administrator accounts cannot be moderated from this action';
  end if;

  if target_profile.account_status is distinct from parsed_status then
    update public.profiles
    set account_status = parsed_status,
        updated_at = now()
    where id = target_user_id;
  end if;

  return jsonb_build_object(
    'id', target_user_id,
    'account_status', parsed_status,
    'changed', target_profile.account_status is distinct from parsed_status
  );
end;
$$;

create or replace function public.get_admin_activity_page(
  period_days integer default 7,
  role_filter text default null,
  result_filter text default null,
  search_query text default null,
  page_number integer default 1,
  page_size integer default 20,
  app_timezone text default 'Asia/Jakarta'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_days integer := case when period_days = 30 then 30 else 7 end;
  normalized_role public.app_role;
  normalized_result public.activity_status;
  normalized_search text := nullif(left(trim(search_query), 80), '');
  normalized_page integer := greatest(coalesce(page_number, 1), 1);
  normalized_page_size integer := least(greatest(coalesce(page_size, 20), 1), 50);
  normalized_timezone text;
  period_start timestamptz;
  result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  if role_filter is not null and role_filter <> '' then
    if role_filter not in ('admin', 'umkm', 'pekerja', 'supplier') then
      raise exception 'Unknown role filter';
    end if;
    normalized_role := role_filter::public.app_role;
  end if;

  if result_filter is not null and result_filter <> '' then
    if result_filter not in ('success', 'failed', 'denied') then
      raise exception 'Unknown result filter';
    end if;
    normalized_result := result_filter::public.activity_status;
  end if;

  select timezone_names.name
    into normalized_timezone
  from pg_catalog.pg_timezone_names as timezone_names
  where timezone_names.name = app_timezone;

  normalized_timezone := coalesce(normalized_timezone, 'Asia/Jakarta');
  period_start := (
    date_trunc('day', now() at time zone normalized_timezone)
    - ((normalized_days - 1)::text || ' days')::interval
  ) at time zone normalized_timezone;

  with filtered_logs as (
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
      logs.metadata,
      logs.created_at
    from public.activity_logs as logs
    left join public.profiles as profiles on profiles.id = logs.actor_id
    where logs.created_at >= period_start
      and (normalized_role is null or logs.actor_role = normalized_role)
      and (normalized_result is null or logs.status = normalized_result)
      and (
        normalized_search is null
        or profiles.email ilike '%' || normalized_search || '%'
        or profiles.display_name ilike '%' || normalized_search || '%'
        or profiles.business_name ilike '%' || normalized_search || '%'
        or logs.event_type ilike '%' || normalized_search || '%'
        or logs.description ilike '%' || normalized_search || '%'
        or logs.target_id ilike '%' || normalized_search || '%'
      )
  ),
  paged_logs as (
    select *
    from filtered_logs
    order by created_at desc, id
    limit normalized_page_size
    offset (normalized_page - 1) * normalized_page_size
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered_logs),
    'success_count', (
      select count(*) from filtered_logs
      where status = 'success'::public.activity_status
    ),
    'attention_count', (
      select count(*) from filtered_logs
      where status in ('failed'::public.activity_status, 'denied'::public.activity_status)
    ),
    'unique_actors', (
      select count(distinct actor_id) from filtered_logs
      where actor_id is not null
    ),
    'page', normalized_page,
    'page_size', normalized_page_size,
    'activities', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', paged.id,
            'actor_id', paged.actor_id,
            'actor_name', paged.actor_name,
            'actor_email', paged.actor_email,
            'actor_role', paged.actor_role,
            'event_type', paged.event_type,
            'category', paged.category,
            'target_type', paged.target_type,
            'target_id', paged.target_id,
            'description', paged.description,
            'status', paged.status,
            'metadata', paged.metadata,
            'created_at', paged.created_at
          )
          order by paged.created_at desc, paged.id
        )
        from paged_logs as paged
      ),
      '[]'::jsonb
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_admin_users(text, text, text, integer, integer, text)
  from public, anon, authenticated;
revoke all on function public.set_user_account_status(uuid, text)
  from public, anon, authenticated;
revoke all on function public.get_admin_activity_page(integer, text, text, text, integer, integer, text)
  from public, anon, authenticated;

grant execute on function public.get_admin_users(text, text, text, integer, integer, text)
  to authenticated, service_role;
grant execute on function public.set_user_account_status(uuid, text)
  to authenticated, service_role;
grant execute on function public.get_admin_activity_page(integer, text, text, text, integer, integer, text)
  to authenticated, service_role;

commit;
