begin;

create or replace function public.create_pool(
  target_catalog_product_id uuid,
  pool_district text,
  pool_hub text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplier_minimum numeric;
begin
  select offers.min_order_quantity
    into supplier_minimum
  from public.supplier_offers as offers
  where offers.id = target_catalog_product_id
    and offers.pool_id is null
    and offers.status = 'active';

  if supplier_minimum is null or supplier_minimum <= 0 then
    raise exception 'Active supplier catalog product is not available';
  end if;

  return public.create_pool(
    target_catalog_product_id,
    supplier_minimum,
    pool_district,
    pool_hub
  );
end;
$$;

revoke all on function public.create_pool(uuid, numeric, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.create_pool(uuid, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.create_pool(uuid, text, text)
  to authenticated;

commit;
