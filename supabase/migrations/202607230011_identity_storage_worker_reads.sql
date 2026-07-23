begin;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  850000,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "kyc_documents_insert_own" on storage.objects;
create policy "kyc_documents_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "kyc_documents_select_own_or_admin" on storage.objects;
create policy "kyc_documents_select_own_or_admin"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_active_admin()
    )
  );

drop policy if exists "kyc_documents_delete_own" on storage.objects;
create policy "kyc_documents_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create or replace function public.mark_current_phone_verified()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  verified_phone text;
  verified_at timestamptz;
  result jsonb;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  select users.phone, users.phone_confirmed_at
    into verified_phone, verified_at
  from auth.users as users
  where users.id = actor_id;

  if verified_phone is null or verified_at is null then
    raise exception 'A confirmed phone number is required';
  end if;

  update public.profiles
  set phone = verified_phone,
      whatsapp_verified_at = verified_at,
      verification_level = greatest(verification_level, 1::smallint)
  where id = actor_id
    and account_status = 'active'::public.account_status;

  if not found then
    raise exception 'Active profile is required';
  end if;

  select jsonb_build_object(
    'phone_verified', true,
    'verification_level', profiles.verification_level,
    'verified_at', profiles.whatsapp_verified_at
  )
  into result
  from public.profiles as profiles
  where profiles.id = actor_id;

  return result;
end;
$$;

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
  if public.current_active_role() <> 'pekerja'::public.app_role then
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
    'owner_verified', jobs.owner_verified
  ) order by jobs.created_at desc), '[]'::jsonb)
  into result
  from (
    select
      postings.*,
      coalesce(nullif(profiles.business_name, ''), nullif(profiles.display_name, ''), 'UMKM Pull') as owner_name,
      profiles.verification_level >= 2 as owner_verified
    from public.job_postings as postings
    join public.profiles as profiles on profiles.id = postings.owner_id
    where postings.status = 'published'
      and (normalized_district is null or postings.district ilike '%' || normalized_district || '%')
      and (normalized_category is null or postings.category ilike '%' || normalized_category || '%')
      and (postings.wage_amount is null or postings.wage_amount >= normalized_wage)
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
  if public.current_active_role() <> 'pekerja'::public.app_role then
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
      'owner_verified', profiles.verification_level >= 2
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

revoke all on function public.mark_current_phone_verified()
  from public, anon, authenticated, service_role;
revoke all on function public.get_worker_job_board(text, text, numeric)
  from public, anon, authenticated, service_role;
revoke all on function public.get_my_worker_applications()
  from public, anon, authenticated, service_role;

grant execute on function public.mark_current_phone_verified()
  to authenticated;
grant execute on function public.get_worker_job_board(text, text, numeric)
  to authenticated;
grant execute on function public.get_my_worker_applications()
  to authenticated;

do $$
declare
  job_exists boolean := false;
begin
  if exists (
    select 1 from pg_catalog.pg_extension where extname = 'pg_cron'
  ) then
    execute 'select exists (select 1 from cron.job where jobname = ''pull-resolve-due-pools'')'
      into job_exists;
    if not job_exists then
      perform cron.schedule(
        'pull-resolve-due-pools',
        '*/5 * * * *',
        'select public.resolve_due_pools()'
      );
    end if;
  end if;
end
$$;

commit;
