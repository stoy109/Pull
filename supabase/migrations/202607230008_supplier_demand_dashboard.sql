begin;

create or replace function public.record_current_activity(
  activity_event_type text,
  activity_target_type text,
  activity_target_id text,
  activity_description text,
  activity_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  stored_role public.app_role;
  stored_status public.account_status;
  event_category public.activity_category;
  created_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select profiles.role, profiles.account_status
    into stored_role, stored_status
  from public.profiles as profiles
  where profiles.id = current_user_id;

  if not found or stored_role is null or stored_status <> 'active'::public.account_status then
    raise exception 'Active profile is required';
  end if;

  event_category := case
    when activity_event_type in ('profile.updated', 'role.changed')
      then 'account'::public.activity_category
    when activity_event_type in ('job.created', 'job.published', 'application.submitted')
      then 'recruitment'::public.activity_category
    when activity_event_type in ('pool.created', 'pool.joined')
      then 'pool'::public.activity_category
    when activity_event_type = 'supplier.offer_created'
      then 'supplier'::public.activity_category
    else null
  end;

  if event_category is null then
    raise exception 'Activity event is not available';
  end if;

  if activity_event_type in ('job.created', 'job.published', 'pool.created', 'pool.joined')
    and stored_role <> 'umkm'::public.app_role then
    raise exception 'UMKM account required';
  end if;

  if activity_event_type = 'application.submitted'
    and stored_role <> 'pekerja'::public.app_role then
    raise exception 'Worker account required';
  end if;

  if activity_event_type = 'supplier.offer_created'
    and stored_role <> 'supplier'::public.app_role then
    raise exception 'Supplier account required';
  end if;

  if activity_metadata is null or jsonb_typeof(activity_metadata) <> 'object' then
    raise exception 'Activity metadata must be an object';
  end if;

  if octet_length(activity_metadata::text) > 2048 then
    raise exception 'Activity metadata is too large';
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
    metadata
  )
  values (
    current_user_id,
    stored_role,
    activity_event_type,
    event_category,
    nullif(left(trim(activity_target_type), 80), ''),
    nullif(left(trim(activity_target_id), 160), ''),
    coalesce(nullif(left(trim(activity_description), 500), ''), activity_event_type),
    'success'::public.activity_status,
    activity_metadata
  )
  returning id into created_id;

  return created_id;
end;
$$;

create or replace function public.get_supplier_demands()
returns table (
  id uuid,
  requester_key text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles as profiles
    where profiles.id = auth.uid()
      and profiles.role = 'supplier'::public.app_role
      and profiles.account_status = 'active'::public.account_status
  ) then
    raise exception 'Active supplier account required';
  end if;

  return query
  select
    logs.id,
    md5(coalesce(logs.actor_id::text, logs.id::text)) as requester_key,
    jsonb_strip_nulls(jsonb_build_object(
      'pool_id', logs.metadata -> 'pool_id',
      'product_name', logs.metadata -> 'product_name',
      'item_name', logs.metadata -> 'item_name',
      'commodity', logs.metadata -> 'commodity',
      'name', logs.metadata -> 'name',
      'category', logs.metadata -> 'category',
      'target_quantity', logs.metadata -> 'target_quantity',
      'quantity', logs.metadata -> 'quantity',
      'volume', logs.metadata -> 'volume',
      'current_quantity', logs.metadata -> 'current_quantity',
      'unit', logs.metadata -> 'unit',
      'district', logs.metadata -> 'district',
      'location', logs.metadata -> 'location',
      'status', logs.metadata -> 'status',
      'deadline_at', logs.metadata -> 'deadline_at',
      'deadline', logs.metadata -> 'deadline',
      'pool_leader', coalesce(
        nullif(profiles.business_name, ''),
        nullif(logs.metadata ->> 'pool_leader', ''),
        'Data terlindungi'
      ),
      'whatsapp_masked', 'Nomor disembunyikan'
    )) as metadata,
    logs.created_at
  from public.activity_logs as logs
  left join public.profiles as profiles on profiles.id = logs.actor_id
  where logs.event_type = 'pool.created'
    and logs.status = 'success'::public.activity_status
  order by logs.created_at desc
  limit 100;
end;
$$;

create or replace function public.get_active_users_count(
  since_at timestamptz default null
)
returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  active_count bigint;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  select count(distinct logs.actor_id)::bigint
    into active_count
  from public.activity_logs as logs
  where logs.actor_id is not null
    and (since_at is null or logs.created_at >= since_at);

  return active_count;
end;
$$;

revoke all on function public.record_current_activity(text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.get_supplier_demands()
  from public, anon, authenticated, service_role;
revoke all on function public.get_active_users_count(timestamptz)
  from public, anon, authenticated, service_role;

grant execute on function public.record_current_activity(text, text, text, text, jsonb)
  to authenticated;
grant execute on function public.get_supplier_demands()
  to authenticated;
grant execute on function public.get_active_users_count(timestamptz)
  to authenticated;

commit;
