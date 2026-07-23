\set ON_ERROR_STOP on

begin;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at
)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'umkm1@smoke.test', '', now(), '{"role":"umkm"}', '{"display_name":"UMKM Satu","business_name":"Warung Satu"}', now(), now(), '628111111111', now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'umkm2@smoke.test', '', now(), '{"role":"umkm"}', '{"display_name":"UMKM Dua","business_name":"Warung Dua"}', now(), now(), null, null),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated', 'worker@smoke.test', '', now(), '{"role":"pekerja"}', '{"display_name":"Pekerja Uji"}', now(), now(), null, null),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated', 'supplier@smoke.test', '', now(), '{"role":"supplier"}', '{"display_name":"Supplier Uji","business_name":"Pasok Uji"}', now(), now(), null, null),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated', 'admin@smoke.test', '', now(), '{"role":"admin"}', '{"display_name":"Admin Uji"}', now(), now(), null, null);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select public.mark_current_phone_verified();
select public.upsert_business_profile(
  'warung-satu',
  'Warung Satu',
  'UMKM untuk pengujian proposal Pull.',
  'Kuliner',
  'Jalan Uji 1',
  'Bantul',
  -7.8,
  110.36,
  '628111111111',
  null,
  null,
  'https://example.com',
  true
);
select public.upsert_business_product(
  'Keripik Uji',
  'Makanan',
  'bungkus',
  12000,
  'Produk storefront smoke test.',
  null,
  true,
  null
);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select public.upsert_supplier_product(
  'Tepung Uji',
  'kg',
  9000,
  100,
  5,
  'Bahan baku',
  'supplier_target_discount=10',
  'active',
  null
) as catalog_id \gset
select public.upsert_supplier_product(
  'Tepung Uji',
  'kg',
  9000,
  100,
  5,
  'Bahan baku',
  'supplier_target_discount=10',
  'active',
  null
) as reused_catalog_id \gset

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$
declare
  active_catalog_id uuid;
begin
  select id into active_catalog_id
  from public.supplier_offers
  where supplier_id = '00000000-0000-0000-0000-000000000004'
    and pool_id is null
    and status = 'active';

  begin
    perform public.create_pool(active_catalog_id, 101, 'Bantul', 'Hub Uji');
    raise exception 'Expected overstock pool target to be rejected';
  exception when others then
    if sqlerrm <> 'Pool target must fit the catalog order and stock limits' then
      raise;
    end if;
  end;
end
$$;
select public.create_pool(
  :'catalog_id',
  10,
  'Bantul',
  'Hub Uji'
) as pool_id \gset
select deadline::text as initial_pool_deadline
from public.pools where id = :'pool_id' \gset

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select public.join_pool(:'pool_id', 10);
select deadline::text as first_join_deadline
from public.pools where id = :'pool_id' \gset

reset role;
delete from public.pool_members
where pool_id = :'pool_id' and member_id = '00000000-0000-0000-0000-000000000002';
update public.pools set current_quantity = 0, status = 'open' where id = :'pool_id';

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select public.join_pool(:'pool_id', 10);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
insert into storage.objects (bucket_id, name, owner, owner_id, metadata)
values (
  'kyc-documents',
  '00000000-0000-0000-0000-000000000004/izin-usaha.pdf',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  '{"mimetype":"application/pdf","size":100}'
);
select public.submit_kyc_record(
  'izin_usaha',
  '00000000-0000-0000-0000-000000000004/izin-usaha.pdf',
  '{"file_name":"izin-usaha.pdf","mime_type":"application/pdf","file_size":100}'
) as kyc_id \gset

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select public.get_admin_kyc_queue('pending', 1);
select public.review_kyc_submission(:'kyc_id', true, 'Dokumen valid.');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select public.get_supplier_workspace();

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$
declare
  active_catalog_id uuid;
  active_pool_id uuid;
begin
  select id into active_catalog_id
  from public.supplier_offers
  where supplier_id = '00000000-0000-0000-0000-000000000004'
    and pool_id is null
    and status = 'active';
  select id into active_pool_id
  from public.pools
  where owner_id = '00000000-0000-0000-0000-000000000001'
    and item_name = 'Tepung Uji';

  begin
    perform public.create_supplier_order(active_pool_id, active_catalog_id, 5);
    raise exception 'Expected partial pool order to be rejected';
  exception when others then
    if sqlerrm <> 'Supplier offer cannot fulfill this order' then
      raise;
    end if;
  end;
end
$$;
select public.create_supplier_order(:'pool_id', :'catalog_id', 10) as order_id \gset

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select public.set_supplier_order_status(:'order_id', 'accepted');
select public.set_supplier_order_status(:'order_id', 'processing');
select public.set_supplier_order_status(:'order_id', 'shipped');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select public.set_supplier_order_status(:'order_id', 'completed');
select public.submit_transaction_rating('supplier_order', :'order_id', 5, 'Supplier tepat waktu.');

select public.create_full_job_posting(
  'Bantu Produksi Uji',
  'Membantu proses produksi untuk pengujian alur.',
  'Produksi',
  'Bantul',
  150000,
  'per hari',
  1,
  current_date,
  current_date,
  1,
  8,
  'Disiplin dan teliti.',
  'published'
) as job_id \gset

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
insert into public.worker_preferences(
  user_id, availability, preferred_categories, minimum_wage, radius_km
) values (
  '00000000-0000-0000-0000-000000000003', 'available', array['Produksi'], 100000, 10
);
select public.get_worker_job_board(null, null, 0);
select 1 / ((public.get_worker_job_board(null, null, 0) @> jsonb_build_array(
  jsonb_build_object('id', :'job_id', 'latitude', -7.8, 'longitude', 110.36)
))::integer) as worker_job_coordinates_available;
select public.submit_job_application(:'job_id', 'Saya siap membantu produksi.') as application_id \gset
select public.get_worker_job_contact_slug(:'job_id') as worker_contact_slug \gset
select public.get_my_worker_applications();

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select public.set_application_status(:'application_id', 'accepted');
select public.confirm_job_completion(:'application_id');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select public.confirm_job_completion(:'application_id');
select public.submit_transaction_rating('job_application', :'application_id', 5, 'UMKM komunikatif.');

reset role;
select 1 / ((select status = 'fulfilled' from public.pools where id = :'pool_id')::integer) as pool_completed;
select 1 / ((select status = 'completed' from public.supplier_orders where id = :'order_id')::integer) as order_completed;
select 1 / ((select status = 'completed' from public.job_applications where id = :'application_id')::integer) as job_completed;
select 1 / ((select status = 'closed' from public.job_postings where id = :'job_id')::integer) as filled_job_closed;
select 1 / ((select count(*) = 1 from public.worker_certificates where application_id = :'application_id')::integer) as certificate_issued;
select 1 / ((select count(*) = 1 from public.worker_portfolio where application_id = :'application_id')::integer) as portfolio_published;
select 1 / ((select kyc_status = 'verified' and verification_level >= 2 from public.profiles where id = '00000000-0000-0000-0000-000000000004')::integer) as supplier_verified;
select 1 / ((select supplier_id = '00000000-0000-0000-0000-000000000004' from public.supplier_offers where id = :'catalog_id')::integer) as unverified_supplier_catalog_created;
select 1 / ((:'catalog_id' = :'reused_catalog_id')::integer) as supplier_catalog_row_reused;
select 1 / ((select count(*) = 1 from public.supplier_offers where supplier_id = '00000000-0000-0000-0000-000000000004' and pool_id is null and status = 'active')::integer) as one_active_supplier_catalog;
select 1 / ((select deadline between now() + interval '59 minutes' and now() + interval '61 minutes' from public.pools where id = :'pool_id')::integer) as pool_has_one_hour_window;
select 1 / ((:'first_join_deadline'::timestamptz > :'initial_pool_deadline'::timestamptz)::integer) as first_join_reset_deadline;
select 1 / ((select deadline = :'first_join_deadline'::timestamptz from public.pools where id = :'pool_id')::integer) as repeat_join_kept_deadline;
select 1 / ((select unit_price = 8100 from public.supplier_orders where id = :'order_id')::integer) as target_discount_applied;
select 1 / ((:'worker_contact_slug' = 'warung-satu')::integer) as worker_contact_slug_available;
select 1 / ((select count(*) = 1 from public.worker_preferences where user_id = '00000000-0000-0000-0000-000000000003')::integer) as worker_preferences_saved;
select 1 / ((select count(*) > 0 from public.notifications)::integer) as notifications_created;
select 1 / ((select coalesce(sum(points), 0) >= 10 from public.points_ledger where profile_id = '00000000-0000-0000-0000-000000000003')::integer) as worker_points_awarded;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select public.get_public_umkm_profile('warung-satu') as public_profile \gset
select public.record_public_profile_view('warung-satu');
select public.record_contact_redirect('warung-satu', 'whatsapp');

reset role;
select 1 / ((position('phone' in :'public_profile') = 0)::integer) as public_phone_masked;
select 1 / ((select profile_views = 1 and contact_count = 1 from public.profiles where id = '00000000-0000-0000-0000-000000000001')::integer) as storefront_events_recorded;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select public.get_proposal_metrics(30);

rollback;

\echo 'proposal smoke test passed'
