begin;

alter table public.kyc_submissions
  add column if not exists review_note text;

do $$
begin
  alter table public.kyc_submissions
    add constraint kyc_submissions_review_note_length_check
    check (review_note is null or char_length(review_note) <= 500);
exception when duplicate_object then null;
end
$$;

create or replace function public.get_admin_kyc_queue(
  status_filter text default 'pending',
  page_number integer default 1
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_status text := lower(nullif(trim(status_filter), ''));
  normalized_page integer := least(greatest(coalesce(page_number, 1), 1), 999);
  normalized_page_size constant integer := 12;
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;

  if normalized_status = 'all' then
    normalized_status := null;
  elsif normalized_status is not null
    and normalized_status not in ('pending', 'approved', 'rejected') then
    raise exception 'Unknown KYC status filter';
  end if;

  with filtered_submissions as (
    select
      submissions.id,
      submissions.user_id,
      profiles.email,
      profiles.display_name,
      profiles.business_name,
      profiles.role,
      profiles.kyc_status,
      profiles.verification_level,
      submissions.document_type,
      case
        when char_length(submissions.storage_path) <= 500
          and submissions.storage_path ~ (
            '^' || submissions.user_id::text || '/[A-Za-z0-9][A-Za-z0-9._/-]*$'
          )
          and submissions.storage_path not like '%..%'
          then submissions.storage_path
        else null
      end as storage_path,
      jsonb_strip_nulls(jsonb_build_object(
        'file_name', case
          when jsonb_typeof(submissions.metadata -> 'file_name') = 'string'
            or jsonb_typeof(submissions.metadata -> 'original_name') = 'string'
            or jsonb_typeof(submissions.metadata -> 'name') = 'string'
          then left(regexp_replace(trim(coalesce(
            submissions.metadata ->> 'file_name',
            submissions.metadata ->> 'original_name',
            submissions.metadata ->> 'name'
          )), '[[:cntrl:]]', '', 'g'), 160)
          else null
        end,
        'mime_type', case
          when lower(coalesce(
            submissions.metadata ->> 'mime_type',
            submissions.metadata ->> 'content_type',
            ''
          )) ~ '^[a-z0-9][a-z0-9.+-]{0,63}/[a-z0-9][a-z0-9.+-]{0,63}$'
          then left(lower(coalesce(
            submissions.metadata ->> 'mime_type',
            submissions.metadata ->> 'content_type'
          )), 129)
          else null
        end,
        'file_size', case
          when jsonb_typeof(submissions.metadata -> 'file_size') = 'number'
            and (submissions.metadata ->> 'file_size') ~ '^[0-9]{1,15}$'
          then to_jsonb((submissions.metadata ->> 'file_size')::bigint)
          when jsonb_typeof(submissions.metadata -> 'size') = 'number'
            and (submissions.metadata ->> 'size') ~ '^[0-9]{1,15}$'
          then to_jsonb((submissions.metadata ->> 'size')::bigint)
          else null
        end
      )) as metadata,
      submissions.status,
      submissions.reviewed_by,
      submissions.reviewed_at,
      submissions.review_note,
      submissions.rejection_reason,
      submissions.created_at
    from public.kyc_submissions as submissions
    join public.profiles as profiles on profiles.id = submissions.user_id
    where normalized_status is null or submissions.status = normalized_status
  ),
  paged_submissions as (
    select *
    from filtered_submissions
    order by created_at desc, id
    limit normalized_page_size
    offset (normalized_page - 1) * normalized_page_size
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered_submissions),
    'pending_count', (
      select count(*) from public.kyc_submissions where status = 'pending'
    ),
    'page', normalized_page,
    'page_size', normalized_page_size,
    'submissions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', paged.id,
        'user_id', paged.user_id,
        'email', paged.email,
        'display_name', paged.display_name,
        'business_name', paged.business_name,
        'role', paged.role,
        'profile_kyc_status', paged.kyc_status,
        'verification_level', paged.verification_level,
        'document_type', paged.document_type,
        'storage_path', paged.storage_path,
        'metadata', paged.metadata,
        'status', paged.status,
        'reviewed_by', paged.reviewed_by,
        'reviewed_at', paged.reviewed_at,
        'review_note', paged.review_note,
        'rejection_reason', paged.rejection_reason,
        'created_at', paged.created_at
      ) order by paged.created_at desc, paged.id)
      from paged_submissions as paged
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

create or replace function public.review_kyc_submission(
  submission_id uuid,
  approved boolean,
  review_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_note text := nullif(left(trim(review_note), 500), '');
  selected_submission public.kyc_submissions%rowtype;
  decision_status text;
begin
  if actor_id is null then
    raise exception 'Authentication required';
  end if;
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;
  if submission_id is null or approved is null then
    raise exception 'Submission and decision are required';
  end if;
  if not approved and normalized_note is null then
    raise exception 'A rejection note is required';
  end if;

  select submissions.*
    into selected_submission
  from public.kyc_submissions as submissions
  where submissions.id = submission_id
  for update;

  if not found then
    raise exception 'KYC submission is not available';
  end if;
  if selected_submission.status <> 'pending' then
    raise exception 'Only pending KYC submissions can be reviewed';
  end if;

  decision_status := case when approved then 'approved' else 'rejected' end;

  update public.kyc_submissions
  set status = decision_status,
      reviewed_by = actor_id,
      reviewed_at = now(),
      review_note = normalized_note,
      rejection_reason = case when approved then null else normalized_note end
  where id = submission_id;

  update public.profiles
  set kyc_status = case when approved then 'verified' else 'rejected' end,
      verification_level = case
        when approved then greatest(verification_level, 2::smallint)
        else verification_level
      end
  where id = selected_submission.user_id;

  if not found then
    raise exception 'KYC profile is not available';
  end if;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, 'admin'::public.app_role, 'profile.updated', 'account',
    'kyc_submission', submission_id::text,
    case when approved
      then 'Menyetujui verifikasi KYC pengguna'
      else 'Menolak verifikasi KYC pengguna'
    end,
    'success',
    jsonb_build_object(
      'user_id', selected_submission.user_id,
      'document_type', selected_submission.document_type,
      'decision', decision_status
    )
  );

  insert into public.notifications(user_id, notification_type, title, body, data)
  values (
    selected_submission.user_id,
    'system',
    case when approved then 'Verifikasi KYC disetujui' else 'Verifikasi KYC ditolak' end,
    case when approved
      then 'Pengajuan KYC Anda telah disetujui. Profil kini berstatus terverifikasi.'
      else left('Pengajuan KYC Anda ditolak. Catatan: ' || normalized_note, 500)
    end,
    jsonb_build_object('submission_id', submission_id, 'status', decision_status)
  );

  return jsonb_build_object(
    'id', submission_id,
    'user_id', selected_submission.user_id,
    'status', decision_status,
    'kyc_status', case when approved then 'verified' else 'rejected' end,
    'verification_level', case when approved then 2 else null end
  );
end;
$$;

create or replace function public.get_proposal_metrics(
  period_days integer default 30
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized_days integer := coalesce(period_days, 30);
  period_start timestamptz;
  pool_total_count bigint := 0;
  pool_completion_count bigint := 0;
  savings_sample_count bigint := 0;
  average_savings_percent numeric := 0;
  job_fill_count bigint := 0;
  average_job_fill_hours numeric := 0;
  confirmation_eligible_count bigint := 0;
  confirmation_completed_count bigint := 0;
  confirmed_worker_wage numeric := 0;
  supplier_completed_turnover numeric := 0;
  qr_profile_views bigint := 0;
  qr_contact_count bigint := 0;
  retention_base_count bigint := 0;
  retention_returning_count bigint := 0;
  kyc_pending bigint := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if not public.is_active_admin() then
    raise exception 'Administrator access required';
  end if;
  if normalized_days not between 1 and 365 then
    raise exception 'Period must be between 1 and 365 days';
  end if;

  period_start := now() - pg_catalog.make_interval(days => normalized_days);

  select
    count(*),
    count(*) filter (where pools.status = 'fulfilled')
  into pool_total_count, pool_completion_count
  from public.pools as pools
  where pools.created_at >= period_start;

  with fulfilled_pool_savings as (
    select distinct on (pools.id)
      pools.id,
      ((pools.market_price - orders.unit_price) / pools.market_price) * 100 as savings_percent
    from public.pools as pools
    join public.supplier_orders as orders on orders.pool_id = pools.id
    where pools.status = 'fulfilled'
      and pools.market_price is not null
      and pools.market_price > 0
      and orders.unit_price > 0
      and orders.status = 'completed'
      and orders.completed_at >= period_start
    order by pools.id, orders.completed_at desc, orders.id
  )
  select count(*), coalesce(round(avg(savings_percent), 2), 0)
    into savings_sample_count, average_savings_percent
  from fulfilled_pool_savings;

  with accepted_applications as (
    select distinct on (applications.id)
      applications.id,
      applications.job_id,
      logs.created_at as accepted_at,
      jobs.created_at as job_created_at,
      applications.owner_confirmed_at,
      applications.worker_confirmed_at
    from public.activity_logs as logs
    join public.job_applications as applications
      on applications.id::text = logs.target_id
    join public.job_postings as jobs on jobs.id = applications.job_id
    where logs.event_type = 'application.accepted'
      and logs.status = 'success'::public.activity_status
      and logs.created_at >= period_start
    order by applications.id, logs.created_at, logs.id
  ),
  filled_jobs as (
    select distinct on (job_id) job_id, accepted_at, job_created_at
    from accepted_applications
    order by job_id, accepted_at, id
  )
  select
    (select count(*) from filled_jobs),
    (select coalesce(round(avg(greatest(
      extract(epoch from (accepted_at - job_created_at)) / 3600,
      0
    )), 1), 0) from filled_jobs),
    (select count(*) from accepted_applications),
    (select count(*) from accepted_applications
      where owner_confirmed_at is not null and worker_confirmed_at is not null)
  into job_fill_count, average_job_fill_hours,
       confirmation_eligible_count, confirmation_completed_count;

  select coalesce(sum(jobs.wage_amount), 0)
    into confirmed_worker_wage
  from public.job_applications as applications
  join public.job_postings as jobs on jobs.id = applications.job_id
  where applications.status = 'completed'
    and applications.owner_confirmed_at is not null
    and applications.worker_confirmed_at is not null
    and applications.completed_at >= period_start;

  select coalesce(sum(orders.total), 0)
    into supplier_completed_turnover
  from public.supplier_orders as orders
  where orders.status = 'completed'
    and orders.completed_at >= period_start;

  select coalesce(sum(profiles.profile_views), 0)
    into qr_profile_views
  from public.profiles as profiles
  where profiles.role = 'umkm'::public.app_role
    and profiles.storefront_enabled;

  select count(*)
    into qr_contact_count
  from public.contact_redirect_logs as contacts
  where contacts.created_at >= period_start;

  with prior_active_users as (
    select distinct logs.actor_id
    from public.activity_logs as logs
    join public.profiles as profiles on profiles.id = logs.actor_id
    where logs.created_at >= now() - interval '60 days'
      and logs.created_at < now() - interval '30 days'
      and profiles.role is distinct from 'admin'::public.app_role
  ),
  current_active_users as (
    select distinct logs.actor_id
    from public.activity_logs as logs
    join public.profiles as profiles on profiles.id = logs.actor_id
    where logs.created_at >= now() - interval '30 days'
      and profiles.role is distinct from 'admin'::public.app_role
  )
  select count(*), count(current_active_users.actor_id)
    into retention_base_count, retention_returning_count
  from prior_active_users
  left join current_active_users using (actor_id);

  select count(*)
    into kyc_pending
  from public.kyc_submissions
  where status = 'pending';

  return jsonb_build_object(
    'period_days', normalized_days,
    'period_start', period_start,
    'generated_at', now(),
    'pool_completion_count', pool_completion_count,
    'pool_total_count', pool_total_count,
    'pool_completion_rate', case
      when pool_total_count > 0 then round(100.0 * pool_completion_count / pool_total_count, 1)
      else 0
    end,
    'average_savings_percent', average_savings_percent,
    'savings_sample_count', savings_sample_count,
    'job_fill_count', job_fill_count,
    'average_job_fill_hours', average_job_fill_hours,
    'confirmed_worker_wage', confirmed_worker_wage,
    'supplier_completed_turnover', supplier_completed_turnover,
    'confirmation_completed_count', confirmation_completed_count,
    'confirmation_eligible_count', confirmation_eligible_count,
    'confirmation_completion_rate', case
      when confirmation_eligible_count > 0 then round(100.0 * confirmation_completed_count / confirmation_eligible_count, 1)
      else 0
    end,
    'qr_profile_views', qr_profile_views,
    'qr_contact_count', qr_contact_count,
    'retention_30d_rate', case
      when retention_base_count > 0 then round(100.0 * retention_returning_count / retention_base_count, 1)
      else 0
    end,
    'retention_base_count', retention_base_count,
    'retention_returning_count', retention_returning_count,
    'kyc_pending', kyc_pending
  );
end;
$$;

revoke all on function public.get_admin_kyc_queue(text, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.review_kyc_submission(uuid, boolean, text)
  from public, anon, authenticated, service_role;
revoke all on function public.get_proposal_metrics(integer)
  from public, anon, authenticated, service_role;

grant execute on function public.get_admin_kyc_queue(text, integer)
  to authenticated;
grant execute on function public.review_kyc_submission(uuid, boolean, text)
  to authenticated;
grant execute on function public.get_proposal_metrics(integer)
  to authenticated;

commit;
