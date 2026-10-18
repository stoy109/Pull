-- Notifications were only written for *state changes* (application status,
-- pool deadline, ratings, supplier orders). Two of the most important events
-- produced nothing:
--
--   1. a worker submits an application  -> the job owner was never told
--   2. a pool reaches its target        -> no member was ever told
--
-- Both are emitted from triggers rather than inside the RPCs so that every
-- write path is covered (current RPC, future RPC, admin SQL).
--
-- Both functions are SECURITY DEFINER so the insert bypasses notifications RLS,
-- and both honour the recipient's notification preferences through the existing
-- public.notification_is_enabled() helper (which defaults to true when a user
-- has no preferences row yet).

-- ---------------------------------------------------------------------------
-- 1. New application -> notify the job owner
-- ---------------------------------------------------------------------------
create or replace function public.notify_new_job_application()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  job_owner uuid;
  job_title text;
  worker_name text;
begin
  select postings.owner_id, postings.title
    into job_owner, job_title
    from public.job_postings as postings
   where postings.id = new.job_id;

  -- Missing job (should not happen) or owner applying to their own posting.
  if job_owner is null or job_owner = new.worker_id then
    return new;
  end if;

  if not public.notification_is_enabled(job_owner, 'jobs') then
    return new;
  end if;

  select coalesce(nullif(btrim(profiles.display_name), ''), 'Seorang pekerja')
    into worker_name
    from public.profiles as profiles
   where profiles.id = new.worker_id;

  insert into public.notifications (user_id, notification_type, title, body, data)
  values (
    job_owner,
    'jobs',
    'Lamaran baru masuk',
    left(
      coalesce(worker_name, 'Seorang pekerja') || ' melamar ' || coalesce(job_title, 'lowongan Anda'),
      500
    ),
    jsonb_build_object(
      'job_id', new.job_id,
      'application_id', new.id,
      'worker_id', new.worker_id
    )
  );

  return new;
end;
$$;

drop trigger if exists job_applications_notify_owner on public.job_applications;
create trigger job_applications_notify_owner
  after insert on public.job_applications
  for each row execute function public.notify_new_job_application();

-- ---------------------------------------------------------------------------
-- 2. Pool reaches its target -> notify the owner and every member
-- ---------------------------------------------------------------------------
create or replace function public.notify_pool_target_reached()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
  reached_target text;
begin
  -- Only fire on the transition from below target to at/above target.
  if old.current_quantity >= old.target_quantity then
    return new;
  end if;
  if new.target_quantity is null or new.target_quantity <= 0 then
    return new;
  end if;
  if new.current_quantity < new.target_quantity then
    return new;
  end if;

  -- numeric(14,3) always renders with three decimals; trim them for the copy.
  reached_target := rtrim(rtrim(new.target_quantity::text, '0'), '.');

  for recipient in
    select distinct targets.user_id
      from (
        select new.owner_id as user_id
        union
        select members.member_id
          from public.pool_members as members
         where members.pool_id = new.id
      ) as targets
     where targets.user_id is not null
  loop
    if public.notification_is_enabled(recipient, 'pools') then
      insert into public.notifications (user_id, notification_type, title, body, data)
      values (
        recipient,
        'pools',
        'Target pool tercapai',
        left(
          new.item_name || ' sudah mencapai target ' || reached_target || ' ' || new.unit,
          500
        ),
        jsonb_build_object(
          'pool_id', new.id,
          'target_quantity', new.target_quantity,
          'current_quantity', new.current_quantity
        )
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists pools_notify_target_reached on public.pools;
create trigger pools_notify_target_reached
  after update of current_quantity on public.pools
  for each row execute function public.notify_pool_target_reached();

-- Trigger functions are never called directly; keep them off the API surface.
revoke all on function public.notify_new_job_application() from public, anon, authenticated;
revoke all on function public.notify_pool_target_reached() from public, anon, authenticated;
