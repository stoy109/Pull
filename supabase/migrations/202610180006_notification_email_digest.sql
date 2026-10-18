-- Notifications are written by database triggers, so no application code ever
-- sees them: there is nothing to hook an e-mail send onto. A scheduled endpoint
-- collects the rows that have not been mailed yet and sends one digest per user.
--
-- Delivery is at-most-once per row because `emailed_at` is only stamped after
-- the provider accepts the message.

alter table public.notifications
  add column if not exists emailed_at timestamptz;

-- Users can opt out of e-mail without losing the in-app inbox.
alter table public.notification_preferences
  add column if not exists email_enabled boolean not null default true;

-- Partial index: the digest only ever scans rows that still need sending.
create index if not exists notifications_email_pending_idx
  on public.notifications (created_at)
  where emailed_at is null;

create or replace function public.list_pending_notifications(batch_size int default 200)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  notification_type text,
  title text,
  body text,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    notifications.id,
    notifications.user_id,
    profiles.email,
    profiles.display_name,
    notifications.notification_type,
    notifications.title,
    notifications.body,
    notifications.created_at
  from public.notifications as notifications
  join public.profiles as profiles
    on profiles.id = notifications.user_id
  left join public.notification_preferences as preferences
    on preferences.user_id = notifications.user_id
  where notifications.emailed_at is null
    and profiles.email is not null
    and profiles.account_status = 'active'::public.account_status
    and coalesce(preferences.email_enabled, true)
  order by notifications.created_at
  limit greatest(1, least(coalesce(batch_size, 200), 500));
$$;

create or replace function public.mark_notifications_emailed(target_ids uuid[])
returns int
language sql
security definer
set search_path = ''
as $$
  with updated as (
    update public.notifications
       set emailed_at = now()
     where id = any(target_ids)
       and emailed_at is null
    returning 1
  )
  select count(*)::int from updated;
$$;

-- Only the service role may read across users.
revoke all on function public.list_pending_notifications(int) from public, anon, authenticated;
revoke all on function public.mark_notifications_emailed(uuid[]) from public, anon, authenticated;
grant execute on function public.list_pending_notifications(int) to service_role;
grant execute on function public.mark_notifications_emailed(uuid[]) to service_role;
