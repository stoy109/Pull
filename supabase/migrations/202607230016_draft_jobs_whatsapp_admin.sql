begin;

create or replace function public.delete_draft_job(target_job_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  deleted_title text;
begin
  actor_role := public.current_active_role();
  if actor_role is distinct from 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if target_job_id is null then
    raise exception 'Draft job is required';
  end if;

  delete from public.job_postings as jobs
  where jobs.id = target_job_id
    and jobs.owner_id = actor_id
    and jobs.status = 'draft'
    and not exists (
      select 1
      from public.job_applications as applications
      where applications.job_id = jobs.id
    )
  returning jobs.title into deleted_title;

  if deleted_title is null then
    raise exception 'Owned draft job is not available';
  end if;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'job.updated', 'recruitment', 'job_posting',
    target_job_id::text, 'Menghapus draft lowongan ' || deleted_title, 'success',
    jsonb_build_object('job_id', target_job_id, 'deleted', true)
  );

  return target_job_id;
end;
$$;

revoke all on function public.delete_draft_job(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.delete_draft_job(uuid) to authenticated;

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where lower(email) = 'r.pinontoan19@gmail.com';

update public.profiles
set role = 'admin'::public.app_role,
    account_status = 'active'::public.account_status,
    updated_at = now()
where id in (
  select id from auth.users where lower(email) = 'r.pinontoan19@gmail.com'
);

commit;
