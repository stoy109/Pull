do $$
begin
  if not exists (select 1 from auth.users) then
    raise exception 'Cannot seed activity demo: auth.users contains no users. Create at least one user first.';
  end if;
end
$$;

delete from public.activity_logs
where metadata ->> 'seed' = 'activity-demo';

with numbered_users as (
  select id, row_number() over (order by created_at, id) as rn
  from auth.users
),
user_total as (
  select count(*)::bigint as total
  from numbered_users
),
generated as (
  select
    series.n,
    users.id as user_id,
    ((series.n - 1) / 4)::integer as cycle,
    (array['umkm', 'pekerja', 'supplier', 'admin'])[((series.n - 1) % 4) + 1] as role
  from generate_series(1, 32) as series(n)
  cross join user_total
  join numbered_users as users
    on users.rn = ((series.n - 1) % user_total.total) + 1
),
events as (
  select
    *,
    gen_random_uuid() as entity_id,
    case role
      when 'umkm' then case when cycle < 6 then 'pool.create' else 'job.post' end
      when 'pekerja' then (array['job.view', 'job.apply', 'profile.update'])[(cycle % 3) + 1]
      when 'supplier' then (array['pool.view', 'supplier.offer', 'profile.update'])[(cycle % 3) + 1]
      else (array['admin.review', 'admin.user.update', 'activity.export'])[(cycle % 3) + 1]
    end as action
  from generated
)
insert into public.activity_logs (
  user_id,
  role,
  action,
  entity_type,
  entity_id,
  metadata,
  ip,
  user_agent,
  created_at
)
select
  user_id,
  role,
  action,
  case
    when action = 'job.apply' then 'application'
    when action like 'pool.%' then 'pool'
    when action like 'job.%' then 'job'
    when action like 'profile.%' then 'profile'
    when action like 'admin.user.%' then 'user'
    else null
  end,
  entity_id,
  jsonb_build_object('seed', 'activity-demo') ||
    case action
      when 'pool.create' then jsonb_build_object(
        'pool_id', entity_id,
        'product_name', (array[
          'Kain Katun Combed 30s',
          'Pewarna Batik Sintetis',
          'Standing Pouch 500 ml',
          'Gula Aren Curah',
          'Minyak Goreng',
          'Kardus Pengiriman'
        ])[(cycle % 6) + 1],
        'category', (array[
          'Tekstil & Kain',
          'Bahan Kerajinan',
          'Kemasan',
          'Bahan Pangan',
          'Bahan Pangan',
          'Kemasan'
        ])[(cycle % 6) + 1],
        'target_quantity', (array[500, 200, 10000, 300, 600, 1200])[(cycle % 6) + 1],
        'current_quantity', (array[350, 120, 8000, 180, 420, 700])[(cycle % 6) + 1],
        'unit', (array['kg', 'kg', 'pcs', 'kg', 'liter', 'pcs'])[(cycle % 6) + 1],
        'location', (array['Laweyan', 'Pasar Kliwon', 'Serengan', 'Banjarsari', 'Jebres', 'Sukoharjo'])[(cycle % 6) + 1],
        'deadline_at', now() + make_interval(days => cycle + 2),
        'pool_leader', (array['Dapur Sari', 'Batik Sekar', 'Kriya Solo', 'Pangan Jaya', 'Warung Makmur', 'Kemas Bersama'])[(cycle % 6) + 1],
        'whatsapp_masked', '0812••••321',
        'status', 'waiting'
      )
      when 'job.post' then jsonb_build_object(
        'job_id', entity_id,
        'title', 'Staf Produksi Harian',
        'status', 'active'
      )
      when 'job.apply' then jsonb_build_object(
        'application_id', entity_id,
        'job_id', format('demo-job-%s', cycle + 1),
        'owner_id', (select id from numbered_users where rn = 1),
        'umkm_id', (select id from numbered_users where rn = 1),
        'status', 'submitted'
      )
      when 'supplier.offer' then jsonb_build_object(
        'pool_id', format('demo-pool-%s', cycle + 1),
        'status', 'submitted'
      )
      else jsonb_build_object('demo_sequence', n)
    end,
  format('10.23.0.%s', n)::inet,
  'Pull activity demo seed/1.0',
  now() - make_interval(hours => n)
from events;
