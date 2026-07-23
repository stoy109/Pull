create or replace function public.set_own_role(requested_role text)
returns public.app_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  parsed_role public.app_role;
  stored_role public.app_role;
  stored_status public.account_status;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if requested_role not in ('umkm', 'pekerja', 'supplier') then
    raise exception 'Role is not available for public onboarding';
  end if;

  parsed_role := requested_role::public.app_role;

  select role, account_status
    into stored_role, stored_status
  from public.profiles
  where id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile is not available';
  end if;

  if stored_status <> 'active'::public.account_status then
    raise exception 'Account is not active';
  end if;

  if stored_role is not null and stored_role <> parsed_role then
    raise exception 'Role can only be selected once';
  end if;

  update public.profiles
  set role = parsed_role,
      updated_at = now()
  where id = auth.uid();

  return parsed_role;
end;
$$;
