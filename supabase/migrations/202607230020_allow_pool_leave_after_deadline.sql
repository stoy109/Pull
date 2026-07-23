begin;

create or replace function public.leave_pool(target_pool_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  selected_pool public.pools%rowtype;
  joined_quantity numeric;
  next_quantity numeric;
begin
  actor_role := public.current_active_role();
  if actor_role is distinct from 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;

  select * into selected_pool
  from public.pools
  where id = target_pool_id
  for update;

  if not found then
    raise exception 'Pool membership is not available';
  end if;
  if selected_pool.status in ('ordered', 'fulfilled')
    or exists (
      select 1
      from public.supplier_orders
      where pool_id = target_pool_id
        and status not in ('rejected', 'cancelled')
    ) then
    raise exception 'Pool membership is locked by an order';
  end if;

  select quantity into joined_quantity
  from public.pool_members
  where pool_id = target_pool_id and member_id = actor_id
  for update;

  if not found then
    raise exception 'Pool membership is not available';
  end if;

  delete from public.pool_members
  where pool_id = target_pool_id and member_id = actor_id;

  next_quantity := greatest(0, selected_pool.current_quantity - joined_quantity);
  update public.pools
  set current_quantity = next_quantity,
      status = case
        when selected_pool.status = 'cancelled' then 'cancelled'
        when selected_pool.deadline <= now() and next_quantity >= selected_pool.min_threshold then 'ready'
        when selected_pool.deadline <= now() then 'expired'
        when next_quantity >= selected_pool.min_threshold then 'threshold_met'
        else 'open'
      end
  where id = target_pool_id;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'pool.left', 'pool', 'pool', target_pool_id::text,
    'Keluar dari pool ' || selected_pool.item_name, 'success',
    jsonb_build_object('pool_id', target_pool_id, 'quantity', joined_quantity)
  );
end;
$$;

revoke all on function public.leave_pool(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.leave_pool(uuid) to authenticated;

commit;
