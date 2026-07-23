begin;

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
  if actor_role <> 'supplier'::public.app_role then
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
    where id = target_offer_id
      and supplier_id = actor_id
      and pool_id is null
    returning id into offer_id;
    if offer_id is null then
      raise exception 'Owned catalog product is not available';
    end if;
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

commit;
