begin;

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
      and selected_pool.current_quantity >= selected_pool.min_threshold
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
