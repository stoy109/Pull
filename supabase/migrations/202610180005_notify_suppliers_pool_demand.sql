-- Suppliers only learned about demand when a UMKM explicitly sent an offer
-- request. A pool that matches their catalogue appeared silently.
--
-- This notifies every active supplier whose catalogue item matches the pool's
-- item name. Matching is bidirectional (same approach as the district match in
-- 202610180003) so "Kain" finds "Kain Katun 30s" and vice versa.
--
-- Only runs on creation, only for pools that are open for demand, and is capped
-- at 200 recipients so one pool cannot flood the table.

create or replace function public.notify_suppliers_pool_demand()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplier uuid;
  item text := btrim(coalesce(new.item_name, ''));
  quantity_text text;
begin
  if item = '' then
    return new;
  end if;
  if new.status not in ('open', 'threshold_met') then
    return new;
  end if;

  quantity_text := rtrim(rtrim(new.target_quantity::text, '0'), '.');

  for supplier in
    select distinct offers.supplier_id
      from public.supplier_offers as offers
      join public.profiles as profiles
        on profiles.id = offers.supplier_id
     where offers.status = 'active'
       and profiles.role = 'supplier'::public.app_role
       and profiles.account_status = 'active'::public.account_status
       and (
         offers.item_name ilike '%' || item || '%'
         or item ilike '%' || btrim(offers.item_name) || '%'
       )
     order by offers.supplier_id
     limit 200
  loop
    if public.notification_is_enabled(supplier, 'pools') then
      insert into public.notifications (user_id, notification_type, title, body, data)
      values (
        supplier,
        'pools',
        'Kebutuhan pool baru',
        left(
          'Pool ' || item || ' butuh ' || quantity_text || ' ' || new.unit
            || ' di ' || new.district,
          500
        ),
        jsonb_build_object(
          'pool_id', new.id,
          'item_name', new.item_name,
          'district', new.district,
          'target_quantity', new.target_quantity
        )
      );
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists pools_notify_suppliers on public.pools;
create trigger pools_notify_suppliers
  after insert on public.pools
  for each row execute function public.notify_suppliers_pool_demand();

revoke all on function public.notify_suppliers_pool_demand() from public, anon, authenticated;
