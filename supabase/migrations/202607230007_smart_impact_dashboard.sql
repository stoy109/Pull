begin;

create table public.impact_action_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  item_type text not null check (item_type in ('job_posting', 'job_application', 'supplier_offer')),
  item_id uuid not null,
  action_type text not null check (action_type in ('followed_up', 'dismissed')),
  note text check (note is null or char_length(note) <= 300),
  previous_priority text not null check (previous_priority in ('high', 'medium', 'low')),
  created_at timestamptz not null default now()
);

create index impact_action_logs_item_created_idx
  on public.impact_action_logs(item_type, item_id, created_at desc);
create index impact_action_logs_actor_created_idx
  on public.impact_action_logs(actor_id, created_at desc);

alter table public.impact_action_logs enable row level security;

create policy "impact_action_logs_admin_read"
  on public.impact_action_logs
  for select
  to authenticated
  using (public.is_active_admin());

revoke all on public.impact_action_logs from anon, authenticated;
grant select on public.impact_action_logs to authenticated;
grant all on public.impact_action_logs to service_role;

create or replace function public.record_impact_action(
  target_item_type text,
  target_item_id uuid,
  requested_action text,
  action_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_user_id uuid := auth.uid();
  calculated_priority text;
  target_exists boolean := false;
  created_log_id uuid;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  if target_item_type not in ('job_posting', 'job_application', 'supplier_offer') then
    raise exception 'Unknown impact item type';
  end if;

  if requested_action not in ('followed_up', 'dismissed') then
    raise exception 'Unknown impact action';
  end if;

  if target_item_type = 'job_posting' then
    select
      true,
      case
        when jobs.status = 'published'
          and not exists (
            select 1 from public.job_applications
            where job_applications.job_id = jobs.id
          )
          and jobs.created_at < now() - interval '3 days' then 'high'
        when jobs.status = 'published'
          and not exists (
            select 1 from public.job_applications
            where job_applications.job_id = jobs.id
          ) then 'medium'
        else 'low'
      end
    into target_exists, calculated_priority
    from public.job_postings as jobs
    where jobs.id = target_item_id;
  elsif target_item_type = 'job_application' then
    select
      true,
      case
        when applications.status = 'submitted'
          and applications.created_at < now() - interval '2 days' then 'high'
        when applications.status = 'submitted' then 'medium'
        else 'low'
      end
    into target_exists, calculated_priority
    from public.job_applications as applications
    where applications.id = target_item_id;
  else
    select
      true,
      case
        when offers.status = 'active'
          and offers.created_at < now() - interval '14 days' then 'high'
        when offers.status = 'active'
          and offers.created_at < now() - interval '7 days' then 'medium'
        else 'low'
      end
    into target_exists, calculated_priority
    from public.supplier_offers as offers
    where offers.id = target_item_id;
  end if;

  if not coalesce(target_exists, false) then
    raise exception 'Impact item is not available';
  end if;

  insert into public.impact_action_logs (
    actor_id,
    item_type,
    item_id,
    action_type,
    note,
    previous_priority
  )
  values (
    actor_user_id,
    target_item_type,
    target_item_id,
    requested_action,
    nullif(left(trim(action_note), 300), ''),
    calculated_priority
  )
  returning id into created_log_id;

  return jsonb_build_object(
    'id', created_log_id,
    'item_type', target_item_type,
    'item_id', target_item_id,
    'action_type', requested_action,
    'previous_priority', calculated_priority,
    'created_at', now()
  );
end;
$$;

create or replace function public.get_admin_impact_dashboard(
  period_days integer default 30,
  category_filter text default null,
  priority_filter text default null,
  page_number integer default 1,
  page_size integer default 15,
  app_timezone text default 'Asia/Jakarta'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_days integer := case
    when period_days = 7 then 7
    when period_days = 90 then 90
    else 30
  end;
  normalized_category text;
  normalized_priority text;
  normalized_page integer := greatest(coalesce(page_number, 1), 1);
  normalized_page_size integer := least(greatest(coalesce(page_size, 15), 1), 50);
  normalized_timezone text;
  period_start timestamptz;
  result jsonb;
begin
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  if category_filter is not null and category_filter <> '' then
    if category_filter not in ('recruitment', 'supplier') then
      raise exception 'Unknown impact category';
    end if;
    normalized_category := category_filter;
  end if;

  if priority_filter is not null and priority_filter <> '' then
    if priority_filter not in ('high', 'medium', 'low') then
      raise exception 'Unknown impact priority';
    end if;
    normalized_priority := priority_filter;
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

  with impact_items as (
    select
      'job_posting'::text as item_type,
      jobs.id as item_id,
      jobs.title as item_name,
      'recruitment'::text as category,
      jobs.status,
      case
        when jobs.status = 'published'
          and not exists (
            select 1 from public.job_applications
            where job_applications.job_id = jobs.id
          )
          and jobs.created_at < now() - interval '3 days' then 'high'
        when jobs.status = 'published'
          and not exists (
            select 1 from public.job_applications
            where job_applications.job_id = jobs.id
          ) then 'medium'
        else 'low'
      end::text as priority,
      jobs.created_at as event_time,
      coalesce(owners.business_name, owners.display_name, 'UMKM Pull') as owner_name,
      case
        when jobs.status = 'published'
          and not exists (
            select 1 from public.job_applications
            where job_applications.job_id = jobs.id
          ) then 'Promosikan lowongan agar segera menerima pelamar.'
        when jobs.status = 'published' then 'Tinjau pelamar dan lanjutkan proses seleksi.'
        else 'Tidak memerlukan tindak lanjut segera.'
      end::text as recommendation
    from public.job_postings as jobs
    left join public.profiles as owners on owners.id = jobs.owner_id
    where jobs.created_at >= period_start

    union all

    select
      'job_application'::text,
      applications.id,
      'Lamaran ' || coalesce(workers.display_name, 'Pekerja Pull') || ' - ' || jobs.title,
      'recruitment'::text,
      applications.status,
      case
        when applications.status = 'submitted'
          and applications.created_at < now() - interval '2 days' then 'high'
        when applications.status = 'submitted' then 'medium'
        else 'low'
      end::text,
      applications.created_at,
      coalesce(jobs_owners.business_name, jobs_owners.display_name, 'UMKM Pull'),
      case
        when applications.status = 'submitted'
          and applications.created_at < now() - interval '2 days'
          then 'Ingatkan UMKM untuk meninjau lamaran yang menunggu.'
        when applications.status = 'submitted'
          then 'Pantau respons UMKM terhadap lamaran baru.'
        else 'Proses lamaran sudah memiliki keputusan.'
      end::text
    from public.job_applications as applications
    join public.job_postings as jobs on jobs.id = applications.job_id
    left join public.profiles as workers on workers.id = applications.worker_id
    left join public.profiles as jobs_owners on jobs_owners.id = jobs.owner_id
    where applications.created_at >= period_start

    union all

    select
      'supplier_offer'::text,
      offers.id,
      offers.item_name,
      'supplier'::text,
      offers.status,
      case
        when offers.status = 'active'
          and offers.created_at < now() - interval '14 days' then 'high'
        when offers.status = 'active'
          and offers.created_at < now() - interval '7 days' then 'medium'
        else 'low'
      end::text,
      offers.created_at,
      coalesce(suppliers.business_name, suppliers.display_name, 'Supplier Pull'),
      case
        when offers.status = 'active'
          and offers.created_at < now() - interval '14 days'
          then 'Konfirmasi ulang harga dan ketersediaan penawaran lama.'
        when offers.status = 'active'
          and offers.created_at < now() - interval '7 days'
          then 'Periksa apakah penawaran masih relevan bagi UMKM.'
        else 'Penawaran masih baru atau tidak aktif.'
      end::text
    from public.supplier_offers as offers
    left join public.profiles as suppliers on suppliers.id = offers.supplier_id
    where offers.created_at >= period_start
  ),
  items_with_action as (
    select
      items.*,
      latest_action.action_type as latest_action,
      latest_action.created_at as action_time
    from impact_items as items
    left join lateral (
      select logs.action_type, logs.created_at
      from public.impact_action_logs as logs
      where logs.item_type = items.item_type
        and logs.item_id = items.item_id
      order by logs.created_at desc
      limit 1
    ) as latest_action on true
  ),
  filtered_items as (
    select *
    from items_with_action
    where (normalized_category is null or category = normalized_category)
      and (normalized_priority is null or priority = normalized_priority)
  ),
  paged_items as (
    select *
    from filtered_items
    order by
      case priority when 'high' then 1 when 'medium' then 2 else 3 end,
      event_time desc,
      item_id
    limit normalized_page_size
    offset (normalized_page - 1) * normalized_page_size
  )
  select jsonb_build_object(
    'generated_at', now(),
    'period_days', normalized_days,
    'category_filter', normalized_category,
    'priority_filter', normalized_priority,
    'metrics', jsonb_build_object(
      'active_jobs', case when normalized_category is null or normalized_category = 'recruitment' then (
        select count(*) from public.job_postings
        where status = 'published' and created_at >= period_start
      ) else 0 end,
      'applications', case when normalized_category is null or normalized_category = 'recruitment' then (
        select count(*) from public.job_applications
        where created_at >= period_start
      ) else 0 end,
      'placement_rate', case when normalized_category is null or normalized_category = 'recruitment' then coalesce((
        select round(
          100.0 * count(*) filter (where status = 'accepted') / nullif(count(*), 0),
          1
        )
        from public.job_applications
        where created_at >= period_start
      ), 0) else 0 end,
      'active_supplier_offers', case when normalized_category is null or normalized_category = 'supplier' then (
        select count(*) from public.supplier_offers
        where status = 'active' and created_at >= period_start
      ) else 0 end
    ),
    'priority_summary', jsonb_build_object(
      'high', (select count(*) from filtered_items where priority = 'high'),
      'medium', (select count(*) from filtered_items where priority = 'medium'),
      'low', (select count(*) from filtered_items where priority = 'low'),
      'pending', (select count(*) from filtered_items where latest_action is null)
    ),
    'recommendations', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'item_type', recommendations.item_type,
          'item_id', recommendations.item_id,
          'item_name', recommendations.item_name,
          'priority', recommendations.priority,
          'recommendation', recommendations.recommendation
        )
        order by
          case recommendations.priority when 'high' then 1 when 'medium' then 2 else 3 end,
          recommendations.event_time
      )
      from (
        select * from filtered_items
        where latest_action is null and priority in ('high', 'medium')
        order by case priority when 'high' then 1 else 2 end, event_time
        limit 5
      ) as recommendations
    ), '[]'::jsonb),
    'total', (select count(*) from filtered_items),
    'page', normalized_page,
    'page_size', normalized_page_size,
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'item_type', paged.item_type,
          'item_id', paged.item_id,
          'item_name', paged.item_name,
          'category', paged.category,
          'status', paged.status,
          'priority', paged.priority,
          'event_time', paged.event_time,
          'owner_name', paged.owner_name,
          'recommendation', paged.recommendation,
          'latest_action', paged.latest_action,
          'action_time', paged.action_time
        )
        order by
          case paged.priority when 'high' then 1 when 'medium' then 2 else 3 end,
          paged.event_time desc
      )
      from paged_items as paged
    ), '[]'::jsonb),
    'action_log', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', actions.id,
          'actor_name', coalesce(admins.display_name, admins.email, 'Administrator'),
          'item_type', actions.item_type,
          'item_id', actions.item_id,
          'item_name', coalesce(
            (select jobs.title from public.job_postings as jobs where actions.item_type = 'job_posting' and jobs.id = actions.item_id),
            (select 'Lamaran - ' || jobs.title from public.job_applications as applications join public.job_postings as jobs on jobs.id = applications.job_id where actions.item_type = 'job_application' and applications.id = actions.item_id),
            (select offers.item_name from public.supplier_offers as offers where actions.item_type = 'supplier_offer' and offers.id = actions.item_id),
            'Item tidak tersedia'
          ),
          'action_type', actions.action_type,
          'note', actions.note,
          'previous_priority', actions.previous_priority,
          'created_at', actions.created_at
        )
        order by actions.created_at desc
      )
      from (
        select * from public.impact_action_logs
        where created_at >= period_start
        order by created_at desc
        limit 10
      ) as actions
      left join public.profiles as admins on admins.id = actions.actor_id
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.record_impact_action(text, uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.get_admin_impact_dashboard(integer, text, text, integer, integer, text)
  from public, anon, authenticated;

grant execute on function public.record_impact_action(text, uuid, text, text)
  to authenticated, service_role;
grant execute on function public.get_admin_impact_dashboard(integer, text, text, integer, integer, text)
  to authenticated, service_role;

commit;
