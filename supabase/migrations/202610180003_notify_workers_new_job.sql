-- Workers had no way to learn that a job was published in their own district:
-- the Papan Loker only updates when they open it. This adds a fan-out
-- notification on publish, scoped to the worker's own district.
--
-- Matching mirrors the filter already used by get_worker_job_board():
-- `job_postings.district ilike '%' || worker district || '%'`, checked in both
-- directions so "Laweyan" and "Kec. Laweyan" still match.
--
-- Fan-out is capped at 200 recipients per posting so one publish cannot flood
-- the notifications table.

create or replace function public.notify_workers_new_job()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient uuid;
  job_district text := btrim(coalesce(new.district, ''));
  wage_text text;
begin
  -- Only published postings, and only on the transition into "published".
  if new.status is distinct from 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status is not distinct from 'published' then
    return new;
  end if;
  if job_district = '' then
    return new;
  end if;

  wage_text := rtrim(rtrim(to_char(new.wage_amount, 'FM999999999990.00'), '0'), '.');

  for recipient in
    select profiles.id
      from public.profiles as profiles
      left join public.worker_preferences as preferences
        on preferences.user_id = profiles.id
     where profiles.role = 'pekerja'::public.app_role
       and profiles.account_status = 'active'::public.account_status
       and btrim(coalesce(profiles.district, '')) <> ''
       and (
         profiles.district ilike '%' || job_district || '%'
         or job_district ilike '%' || btrim(profiles.district) || '%'
       )
       -- "unavailable" workers explicitly do not want work right now.
       and coalesce(preferences.availability, 'available') <> 'unavailable'
     order by profiles.id
     limit 200
  loop
    if public.notification_is_enabled(recipient, 'jobs') then
      insert into public.notifications (user_id, notification_type, title, body, data)
      values (
        recipient,
        'jobs',
        'Lowongan baru di sekitar Anda',
        left(
          new.title || ' — ' || job_district || ', upah ' || coalesce(wage_text, '0') || ' ' || coalesce(new.wage_unit, ''),
          500
        ),
        jsonb_build_object(
          'job_id', new.id,
          'district', job_district,
          'category', new.category
        )
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists job_postings_notify_workers on public.job_postings;
create trigger job_postings_notify_workers
  after insert or update of status on public.job_postings
  for each row execute function public.notify_workers_new_job();

revoke all on function public.notify_workers_new_job() from public, anon, authenticated;
