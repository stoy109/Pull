begin;

create table if not exists public.worker_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  availability text not null default 'available' check (
    availability in ('available', 'limited', 'unavailable')
  ),
  preferred_categories text[] not null default '{}'::text[] check (
    cardinality(preferred_categories) <= 10
  ),
  minimum_wage numeric(14,2) check (minimum_wage is null or minimum_wage >= 0),
  radius_km integer not null default 10 check (radius_km in (3, 5, 10, 20, 50)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worker_preferences enable row level security;

drop policy if exists "worker_preferences_read_own" on public.worker_preferences;
create policy "worker_preferences_read_own"
  on public.worker_preferences
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "worker_preferences_insert_own" on public.worker_preferences;
create policy "worker_preferences_insert_own"
  on public.worker_preferences
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.current_active_role() = 'pekerja'::public.app_role
  );

drop policy if exists "worker_preferences_update_own" on public.worker_preferences;
create policy "worker_preferences_update_own"
  on public.worker_preferences
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and public.current_active_role() = 'pekerja'::public.app_role
  );

drop trigger if exists worker_preferences_set_updated_at on public.worker_preferences;
create trigger worker_preferences_set_updated_at
  before update on public.worker_preferences
  for each row execute procedure public.set_row_updated_at();

create or replace function public.get_worker_job_board(
  district_filter text default null,
  category_filter text default null,
  minimum_wage numeric default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_district text := nullif(left(trim(district_filter), 80), '');
  normalized_category text := nullif(left(trim(category_filter), 80), '');
  normalized_wage numeric := greatest(coalesce(minimum_wage, 0), 0);
  result jsonb;
begin
  if public.current_active_role() is distinct from 'pekerja'::public.app_role then
    raise exception 'Active worker account required';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', jobs.id,
    'title', jobs.title,
    'description', jobs.description,
    'category', jobs.category,
    'district', jobs.district,
    'wage_amount', jobs.wage_amount,
    'wage_unit', jobs.wage_unit,
    'duration_days', jobs.duration_days,
    'start_date', jobs.start_date,
    'end_date', jobs.end_date,
    'hours_per_day', jobs.hours_per_day,
    'quota', jobs.quota,
    'requirements', jobs.requirements,
    'created_at', jobs.created_at,
    'owner_name', jobs.owner_name,
    'owner_verified', jobs.owner_verified,
    'latitude', jobs.latitude,
    'longitude', jobs.longitude
  ) order by jobs.created_at desc), '[]'::jsonb)
  into result
  from (
    select
      postings.*,
      coalesce(nullif(profiles.business_name, ''), nullif(profiles.display_name, ''), 'UMKM Pull') as owner_name,
      profiles.verification_level >= 2 as owner_verified,
      case when profiles.storefront_enabled then profiles.latitude else null end as latitude,
      case when profiles.storefront_enabled then profiles.longitude else null end as longitude
    from public.job_postings as postings
    join public.profiles as profiles on profiles.id = postings.owner_id
    where postings.status = 'published'
      and profiles.account_status = 'active'::public.account_status
      and (normalized_district is null or postings.district ilike '%' || normalized_district || '%')
      and (normalized_category is null or postings.category ilike '%' || normalized_category || '%')
      and (normalized_wage = 0 or postings.wage_amount >= normalized_wage)
    order by postings.created_at desc
    limit 50
  ) as jobs;

  return result;
end;
$$;

create or replace function public.get_my_worker_applications()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  result jsonb;
begin
  if public.current_active_role() is distinct from 'pekerja'::public.app_role then
    raise exception 'Active worker account required';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', applications.id,
    'job_id', applications.job_id,
    'message', applications.message,
    'status', applications.status,
    'created_at', applications.created_at,
    'updated_at', applications.updated_at,
    'owner_confirmed_at', applications.owner_confirmed_at,
    'worker_confirmed_at', applications.worker_confirmed_at,
    'completed_at', applications.completed_at,
    'job', jsonb_build_object(
      'id', jobs.id,
      'title', jobs.title,
      'description', jobs.description,
      'category', jobs.category,
      'district', jobs.district,
      'wage_amount', jobs.wage_amount,
      'wage_unit', jobs.wage_unit,
      'duration_days', jobs.duration_days,
      'start_date', jobs.start_date,
      'end_date', jobs.end_date,
      'hours_per_day', jobs.hours_per_day,
      'quota', jobs.quota,
      'requirements', jobs.requirements,
      'created_at', jobs.created_at,
      'owner_name', coalesce(nullif(profiles.business_name, ''), nullif(profiles.display_name, ''), 'UMKM Pull'),
      'owner_verified', profiles.verification_level >= 2,
      'latitude', case when profiles.storefront_enabled then profiles.latitude else null end,
      'longitude', case when profiles.storefront_enabled then profiles.longitude else null end
    )
  ) order by applications.created_at desc), '[]'::jsonb)
  into result
  from public.job_applications as applications
  join public.job_postings as jobs on jobs.id = applications.job_id
  join public.profiles as profiles on profiles.id = jobs.owner_id
  where applications.worker_id = actor_id;

  return result;
end;
$$;

create or replace function public.get_worker_job_contact_slug(target_job_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  contact_slug text;
begin
  if public.current_active_role() is distinct from 'pekerja'::public.app_role then
    raise exception 'Active worker account required';
  end if;
  if target_job_id is null then
    raise exception 'Job is required';
  end if;

  select profiles.public_slug
    into contact_slug
  from public.job_postings as jobs
  join public.profiles as profiles on profiles.id = jobs.owner_id
  where jobs.id = target_job_id
    and jobs.status = 'published'
    and profiles.role = 'umkm'::public.app_role
    and profiles.account_status = 'active'::public.account_status
    and profiles.phone is not null
    and exists (
      select 1
      from public.job_applications as applications
      where applications.job_id = jobs.id
        and applications.worker_id = auth.uid()
        and applications.status <> 'withdrawn'
    );

  if contact_slug is null then
    raise exception 'Published job contact is not available';
  end if;

  return contact_slug;
end;
$$;

create or replace function public.record_contact_redirect(
  profile_slug text,
  contact_channel text default 'whatsapp'
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
  raw_target text;
  digits text;
  redirect_target text;
begin
  if contact_channel not in ('whatsapp', 'website') then
    raise exception 'Contact channel is invalid';
  end if;

  select profiles.id,
         case contact_channel
           when 'whatsapp' then case
             when profiles.whatsapp_verified_at is not null
               or (
                 public.current_active_role() = 'pekerja'::public.app_role
                 and exists (
                   select 1
                   from public.job_applications as applications
                   join public.job_postings as jobs on jobs.id = applications.job_id
                   where applications.worker_id = auth.uid()
                     and applications.status <> 'withdrawn'
                     and jobs.owner_id = profiles.id
                 )
               )
               then profiles.phone
             else null
           end
           else profiles.website_url
         end
    into target_profile_id, raw_target
  from public.profiles as profiles
  where profiles.public_slug = lower(trim(profile_slug))
    and profiles.role = 'umkm'::public.app_role
    and profiles.account_status = 'active'::public.account_status
    and (
      profiles.storefront_enabled
      or (
        contact_channel = 'whatsapp'
        and public.current_active_role() = 'pekerja'::public.app_role
        and exists (
          select 1
          from public.job_applications as applications
          join public.job_postings as jobs on jobs.id = applications.job_id
          where applications.worker_id = auth.uid()
            and applications.status <> 'withdrawn'
            and jobs.owner_id = profiles.id
        )
      )
    );

  if target_profile_id is null or raw_target is null then
    raise exception 'Contact target is not available';
  end if;

  if contact_channel = 'whatsapp' then
    digits := regexp_replace(raw_target, '[^0-9]', '', 'g');
    if left(digits, 1) = '0' then
      digits := '62' || substr(digits, 2);
    end if;
    if char_length(digits) not between 8 and 15 then
      raise exception 'Contact target is not available';
    end if;
    redirect_target := 'https://wa.me/' || digits;
  else
    if raw_target !~ '^https://' then
      raise exception 'Contact target is not available';
    end if;
    redirect_target := raw_target;
  end if;

  insert into public.contact_redirect_logs(profile_id, viewer_id, channel)
  values (target_profile_id, auth.uid(), contact_channel);
  update public.profiles
  set contact_count = contact_count + 1
  where id = target_profile_id;

  return redirect_target;
end;
$$;

revoke all on table public.worker_preferences from anon, authenticated;
grant select, insert, update on table public.worker_preferences to authenticated;

revoke all on function public.get_worker_job_board(text, text, numeric)
  from public, anon, authenticated, service_role;
revoke all on function public.get_my_worker_applications()
  from public, anon, authenticated, service_role;
revoke all on function public.get_worker_job_contact_slug(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.get_worker_job_board(text, text, numeric) to authenticated;
grant execute on function public.get_my_worker_applications() to authenticated;
grant execute on function public.get_worker_job_contact_slug(uuid) to authenticated;

commit;
