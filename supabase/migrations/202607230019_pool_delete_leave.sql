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

  if not found
    or selected_pool.status not in ('open', 'threshold_met')
    or selected_pool.deadline <= now() then
    raise exception 'Pool membership can no longer be changed';
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

create or replace function public.delete_pool(target_pool_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  selected_pool public.pools%rowtype;
begin
  actor_role := public.current_active_role();
  if actor_role is distinct from 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;

  select * into selected_pool
  from public.pools
  where id = target_pool_id
  for update;

  if not found or selected_pool.owner_id <> actor_id then
    raise exception 'Owned pool is not available';
  end if;
  if exists (
    select 1 from public.supplier_orders where pool_id = target_pool_id
  ) then
    raise exception 'Pool with an order cannot be deleted';
  end if;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'pool.deleted', 'pool', 'pool', target_pool_id::text,
    'Menghapus pool ' || selected_pool.item_name, 'success',
    jsonb_build_object('pool_id', target_pool_id, 'item_name', selected_pool.item_name)
  );

  delete from public.pools where id = target_pool_id;
end;
$$;

revoke all on function public.leave_pool(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.delete_pool(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.leave_pool(uuid) to authenticated;
grant execute on function public.delete_pool(uuid) to authenticated;

commit;
