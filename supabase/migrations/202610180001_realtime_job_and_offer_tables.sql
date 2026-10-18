-- components/realtime-refresh.tsx subscribes to seven tables, but migration
-- 202607230009 only published four of them (pools, pool_members,
-- supplier_orders, notifications). Job postings, job applications and supplier
-- offers therefore never triggered a live refresh — new loker and incoming
-- lamaran only appeared after a manual reload.
--
-- This migration completes the publication so the UI contract matches reality.

do $$
declare
  target text;
begin
  if not exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
    raise notice 'supabase_realtime publication not found; skipping';
    return;
  end if;

  foreach target in array array['job_postings', 'job_applications', 'supplier_offers']
  loop
    if not exists (
      select 1
        from pg_catalog.pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = target
    ) then
      execute format('alter publication supabase_realtime add table public.%I', target);
    end if;
  end loop;
end
$$;

-- Realtime still respects RLS: each subscriber only receives rows it may read.
-- Verify with:
--   select tablename from pg_publication_tables
--    where pubname = 'supabase_realtime' order by 1;
