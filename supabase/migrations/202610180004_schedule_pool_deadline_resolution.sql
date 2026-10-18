-- Pool deadlines only resolve when something calls resolve_due_pools(), which
-- until now only an admin could trigger manually. Without a scheduler, pools sat
-- in 'open' forever after their deadline passed and nobody was notified.
--
-- This schedules the existing function once an hour. resolve_due_pools() is
-- safe to run without a session: when auth.uid() is null it takes the
-- administrator path and resolves every due pool in one transaction.
--
-- The schedule is recreated on every migration run so the job definition stays
-- in version control instead of living only in the live database.
--
-- If pg_cron is unavailable (not enabled on the project, or the caller lacks
-- permission) the migration still succeeds and simply leaves a notice.

do $$
begin
  begin
    create extension if not exists pg_cron;
  exception
    when insufficient_privilege or feature_not_supported then
      raise notice 'pg_cron tidak dapat diaktifkan; pengingat deadline pool dilewati';
      return;
  end;

  if not exists (select 1 from pg_catalog.pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron tidak tersedia; pengingat deadline pool dilewati';
    return;
  end if;

  -- Replace any previous definition so re-running this migration is idempotent.
  if exists (select 1 from cron.job where jobname = 'resolve-due-pools-hourly') then
    perform cron.unschedule('resolve-due-pools-hourly');
  end if;

  perform cron.schedule(
    'resolve-due-pools-hourly',
    '5 * * * *',
    'select public.resolve_due_pools();'
  );
end
$$;
