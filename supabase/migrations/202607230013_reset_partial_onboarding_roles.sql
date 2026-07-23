begin;

update auth.users as users
set raw_user_meta_data =
  (coalesce(users.raw_user_meta_data, '{}'::jsonb) - 'role')
  || jsonb_build_object(
    'pending_role',
    coalesce(
      users.raw_user_meta_data ->> 'role',
      (select profiles.role::text from public.profiles as profiles where profiles.id = users.id)
    )
  )
where users.raw_user_meta_data ->> 'onboarding_step' in ('profile', 'review')
  and coalesce(
    users.raw_user_meta_data ->> 'role',
    (select profiles.role::text from public.profiles as profiles where profiles.id = users.id)
  ) in ('umkm', 'pekerja', 'supplier');

update public.profiles as profiles
set role = null,
    updated_at = now()
where profiles.role in ('umkm'::public.app_role, 'pekerja'::public.app_role, 'supplier'::public.app_role)
  and exists (
    select 1
    from auth.users as users
    where users.id = profiles.id
      and users.raw_user_meta_data ->> 'onboarding_step' in ('profile', 'review')
  );

commit;
