begin;

alter table public.pools
  add column if not exists catalog_product_id uuid
    references public.supplier_offers(id) on delete set null;

create index if not exists pools_catalog_product_idx
  on public.pools(catalog_product_id)
  where catalog_product_id is not null;

create table if not exists public.pool_join_history (
  pool_id uuid not null references public.pools(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  first_joined_at timestamptz not null default now(),
  primary key (pool_id, member_id)
);

insert into public.pool_join_history(pool_id, member_id, first_joined_at)
select pool_id, member_id, created_at
from public.pool_members
on conflict (pool_id, member_id) do nothing;

alter table public.pool_join_history enable row level security;
revoke all on table public.pool_join_history from public, anon, authenticated;
grant all on table public.pool_join_history to service_role;

with ranked_catalog as (
  select
    id,
    row_number() over (
      partition by supplier_id
      order by updated_at desc, created_at desc, id desc
    ) as catalog_position
  from public.supplier_offers
  where pool_id is null and status = 'active'
)
update public.supplier_offers as offers
set status = 'inactive'
from ranked_catalog
where offers.id = ranked_catalog.id
  and ranked_catalog.catalog_position > 1;

create unique index if not exists supplier_offers_one_active_catalog_idx
  on public.supplier_offers(supplier_id)
  where pool_id is null and status = 'active';

create or replace function public.upsert_supplier_product(
  offer_item_name text,
  offer_unit text,
  offer_unit_price numeric,
  offer_stock_quantity numeric,
  offer_min_order_quantity numeric,
  offer_category text,
  offer_description text default null,
  offer_status text default 'active',
  target_offer_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  offer_id uuid;
begin
  actor_role := public.current_active_role();
  if actor_role is distinct from 'supplier'::public.app_role then
    raise exception 'Active supplier account required';
  end if;
  if char_length(trim(offer_item_name)) not between 3 and 100
    or char_length(trim(offer_unit)) not between 1 and 30
    or char_length(trim(offer_category)) not between 2 and 80
    or offer_unit_price is null or offer_unit_price <= 0
    or offer_stock_quantity is null or offer_stock_quantity < 0
    or offer_min_order_quantity is null or offer_min_order_quantity <= 0 then
    raise exception 'Supplier product details are invalid';
  end if;
  if offer_description is not null and char_length(trim(offer_description)) > 1000 then
    raise exception 'Supplier product description is too long';
  end if;
  if offer_status not in ('active', 'inactive') then
    raise exception 'Supplier product status is invalid';
  end if;

  if target_offer_id is null then
    select id into offer_id
    from public.supplier_offers
    where supplier_id = actor_id and pool_id is null
    order by (status = 'active') desc, updated_at desc, created_at desc
    limit 1
    for update;
  else
    select id into offer_id
    from public.supplier_offers
    where id = target_offer_id
      and supplier_id = actor_id
      and pool_id is null
    for update;
    if offer_id is null then
      raise exception 'Owned catalog product is not available';
    end if;
  end if;

  if offer_id is null then
    insert into public.supplier_offers(
      supplier_id, item_name, unit, unit_price, stock_quantity,
      min_order_quantity, category, description, status
    ) values (
      actor_id, trim(offer_item_name), trim(offer_unit), offer_unit_price,
      offer_stock_quantity, offer_min_order_quantity, trim(offer_category),
      nullif(trim(offer_description), ''), offer_status
    ) returning id into offer_id;
  else
    update public.supplier_offers
    set item_name = trim(offer_item_name),
        unit = trim(offer_unit),
        unit_price = offer_unit_price,
        stock_quantity = offer_stock_quantity,
        min_order_quantity = offer_min_order_quantity,
        category = trim(offer_category),
        description = nullif(trim(offer_description), ''),
        status = offer_status
    where id = offer_id;
  end if;

  return offer_id;
end;
$$;

revoke all on function public.upsert_supplier_product(
  text, text, numeric, numeric, numeric, text, text, text, uuid
) from public, anon, authenticated, service_role;
grant execute on function public.upsert_supplier_product(
  text, text, numeric, numeric, numeric, text, text, text, uuid
) to authenticated;

create or replace function public.enforce_pool_initial_hour_window()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.deadline := now() + interval '1 hour';
  return new;
end;
$$;

revoke all on function public.enforce_pool_initial_hour_window()
  from public, anon, authenticated, service_role;

drop trigger if exists pools_enforce_initial_hour_window on public.pools;
create trigger pools_enforce_initial_hour_window
  before insert on public.pools
  for each row execute procedure public.enforce_pool_initial_hour_window();

create or replace function public.record_pool_first_join()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.pool_join_history(pool_id, member_id)
  values (new.pool_id, new.member_id)
  on conflict (pool_id, member_id) do nothing;

  if found then
    update public.pools
    set deadline = clock_timestamp() + interval '1 hour'
    where id = new.pool_id;
  end if;

  return new;
end;
$$;

revoke all on function public.record_pool_first_join()
  from public, anon, authenticated, service_role;

drop trigger if exists pool_members_record_first_join on public.pool_members;
create trigger pool_members_record_first_join
  after insert on public.pool_members
  for each row execute procedure public.record_pool_first_join();

drop function if exists public.create_pool(
  text, text, text, text, numeric, numeric, timestamptz, text,
  numeric, numeric, numeric, numeric, numeric, text
);

create or replace function public.create_pool(
  target_catalog_product_id uuid,
  pool_target_quantity numeric,
  pool_district text,
  pool_hub text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  catalog_product public.supplier_offers%rowtype;
  created_id uuid;
  pool_description text;
  target_discount numeric := 0;
begin
  actor_role := public.current_active_role();
  if actor_role is distinct from 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if target_catalog_product_id is null
    or pool_target_quantity is null or pool_target_quantity <= 0
    or pool_district is null
    or char_length(trim(pool_district)) not between 2 and 120
    or pool_hub is not null and char_length(trim(pool_hub)) > 200 then
    raise exception 'Pool details are invalid';
  end if;

  select offers.* into catalog_product
  from public.supplier_offers as offers
  join public.profiles as suppliers on suppliers.id = offers.supplier_id
  where offers.id = target_catalog_product_id
    and offers.pool_id is null
    and offers.status = 'active'
    and offers.stock_quantity > 0
    and offers.min_order_quantity <= offers.stock_quantity
    and char_length(trim(offers.category)) between 2 and 80
    and suppliers.role = 'supplier'::public.app_role
    and suppliers.account_status = 'active'::public.account_status;

  if not found then
    raise exception 'Active supplier catalog product is not available';
  end if;
  if pool_target_quantity < catalog_product.min_order_quantity
    or pool_target_quantity > catalog_product.stock_quantity then
    raise exception 'Pool target must fit the catalog order and stock limits';
  end if;

  if coalesce(catalog_product.description, '') ~ '^supplier_target_discount=([0-9]+([.][0-9]+)?)$' then
    target_discount := least(
      99,
      greatest(
        0,
        substring(catalog_product.description from '^supplier_target_discount=([0-9]+([.][0-9]+)?)$')::numeric
      )
    );
  end if;
  pool_description := case
    when target_discount > 0
      then 'Diskon ' || target_discount::text || '% berlaku saat target pool tercapai.'
    else 'Pool bahan baku ' || trim(catalog_product.item_name)
  end;

  insert into public.pools(
    owner_id, catalog_product_id, item_name, category, description, unit,
    target_quantity, min_threshold, tier1_price, tier2_price, market_price,
    district, deadline, hub
  ) values (
    actor_id, catalog_product.id, trim(catalog_product.item_name),
    trim(catalog_product.category), pool_description, trim(catalog_product.unit),
    pool_target_quantity, catalog_product.min_order_quantity,
    catalog_product.unit_price,
    greatest(0.01, round(catalog_product.unit_price * (100 - target_discount) / 100, 2)),
    catalog_product.unit_price, trim(pool_district), now() + interval '1 hour',
    nullif(trim(pool_hub), '')
  ) returning id into created_id;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'pool.created', 'pool', 'pool', created_id::text,
    'Membuat pool ' || trim(catalog_product.item_name), 'success',
    jsonb_build_object(
      'pool_id', created_id,
      'catalog_product_id', catalog_product.id,
      'item_name', trim(catalog_product.item_name)
    )
  );

  return created_id;
end;
$$;

revoke all on function public.create_pool(uuid, numeric, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.create_pool(uuid, numeric, text, text)
  to authenticated;

create or replace function public.create_supplier_order(
  target_pool_id uuid,
  target_offer_id uuid,
  order_quantity numeric
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  selected_pool public.pools%rowtype;
  selected_offer public.supplier_offers%rowtype;
  created_id uuid;
  calculated_unit_price numeric(14,2);
  calculated_subtotal numeric(16,2);
begin
  actor_role := public.current_active_role();
  if actor_role is distinct from 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if order_quantity is null or order_quantity <= 0 then
    raise exception 'Order quantity is invalid';
  end if;

  select * into selected_pool
  from public.pools
  where id = target_pool_id
  for update;

  if not found or selected_pool.owner_id <> actor_id
    or selected_pool.status not in ('threshold_met', 'ready')
    or selected_pool.current_quantity < selected_pool.min_threshold then
    raise exception 'Owned pool is not ready to order';
  end if;

  select * into selected_offer
  from public.supplier_offers
  where id = target_offer_id
  for update;

  if not found or selected_offer.status <> 'active'
    or selected_offer.pool_id is not null and selected_offer.pool_id <> target_pool_id
    or lower(selected_offer.item_name) <> lower(selected_pool.item_name)
    or lower(selected_offer.unit) <> lower(selected_pool.unit)
    or selected_offer.stock_quantity < order_quantity
    or selected_offer.min_order_quantity > order_quantity
    or order_quantity <> selected_pool.current_quantity
    or not exists (
      select 1 from public.profiles
      where id = selected_offer.supplier_id
        and role = 'supplier'::public.app_role
        and account_status = 'active'::public.account_status
    ) then
    raise exception 'Supplier offer cannot fulfill this order';
  end if;

  calculated_unit_price := case
    when selected_offer.id = selected_pool.catalog_product_id
      and selected_pool.current_quantity >= selected_pool.target_quantity
      and selected_pool.tier2_price is not null
      then selected_pool.tier2_price
    when selected_offer.id = selected_pool.catalog_product_id
      and selected_pool.tier1_price is not null
      then selected_pool.tier1_price
    else selected_offer.unit_price
  end;
  calculated_subtotal := round(order_quantity * calculated_unit_price, 2);

  insert into public.supplier_orders(
    pool_id, offer_id, buyer_id, supplier_id, quantity, unit,
    unit_price, subtotal, total
  ) values (
    target_pool_id, target_offer_id, actor_id, selected_offer.supplier_id,
    order_quantity, selected_offer.unit, calculated_unit_price,
    calculated_subtotal, calculated_subtotal
  ) returning id into created_id;

  if public.notification_is_enabled(selected_offer.supplier_id, 'orders') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      selected_offer.supplier_id, 'orders', 'Pesanan supplier baru',
      'Pesanan baru untuk ' || selected_pool.item_name,
      jsonb_build_object('order_id', created_id, 'pool_id', target_pool_id)
    );
  end if;

  return created_id;
end;
$$;

revoke all on function public.create_supplier_order(uuid, uuid, numeric)
  from public, anon, authenticated, service_role;
grant execute on function public.create_supplier_order(uuid, uuid, numeric)
  to authenticated;

commit;
