begin;

create table public.job_postings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 10 and 500),
  status text not null default 'published' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings(id) on delete cascade,
  worker_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 5 and 300),
  status text not null default 'submitted' check (status in ('submitted', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, worker_id)
);

create table public.supplier_offers (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.profiles(id) on delete cascade,
  item_name text not null check (char_length(item_name) between 3 and 100),
  unit text not null check (char_length(unit) between 1 and 30),
  unit_price numeric(14,2) not null check (unit_price > 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_postings_owner_created_idx on public.job_postings(owner_id, created_at desc);
create index job_postings_status_created_idx on public.job_postings(status, created_at desc);
create index job_applications_worker_created_idx on public.job_applications(worker_id, created_at desc);
create index job_applications_job_created_idx on public.job_applications(job_id, created_at desc);
create index supplier_offers_supplier_created_idx on public.supplier_offers(supplier_id, created_at desc);

alter table public.job_postings enable row level security;
alter table public.job_applications enable row level security;
alter table public.supplier_offers enable row level security;

create policy "job_postings_read_relevant" on public.job_postings
  for select to authenticated
  using (status = 'published' or owner_id = auth.uid() or public.is_active_admin());
create policy "job_applications_read_relevant" on public.job_applications
  for select to authenticated
  using (
    worker_id = auth.uid()
    or public.is_active_admin()
    or exists (
      select 1 from public.job_postings
      where job_postings.id = job_applications.job_id
        and job_postings.owner_id = auth.uid()
    )
  );
create policy "supplier_offers_read_relevant" on public.supplier_offers
  for select to authenticated
  using (status = 'active' or supplier_id = auth.uid() or public.is_active_admin());

revoke all on public.job_postings, public.job_applications, public.supplier_offers from anon, authenticated;
grant select on public.job_postings, public.job_applications, public.supplier_offers to authenticated;
grant all on public.job_postings, public.job_applications, public.supplier_offers to service_role;

create or replace function public.create_job_posting(job_title text, job_description text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare actor_id uuid := auth.uid(); created_id uuid;
begin
  if not exists (select 1 from public.profiles where id = actor_id and role = 'umkm' and account_status = 'active') then
    raise exception 'Active UMKM account required';
  end if;
  insert into public.job_postings(owner_id, title, description)
  values (actor_id, trim(job_title), trim(job_description)) returning id into created_id;
  insert into public.activity_logs(actor_id, actor_role, event_type, category, target_type, target_id, description, status)
  values (actor_id, 'umkm', 'job.published', 'recruitment', 'job_posting', created_id::text, 'Menerbitkan lowongan ' || trim(job_title), 'success');
  return created_id;
end; $$;

create or replace function public.submit_job_application(target_job_id uuid, application_message text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare actor_id uuid := auth.uid(); created_id uuid; job_title text;
begin
  if not exists (select 1 from public.profiles where id = actor_id and role = 'pekerja' and account_status = 'active') then
    raise exception 'Active worker account required';
  end if;
  select title into job_title from public.job_postings where id = target_job_id and status = 'published';
  if not found then raise exception 'Published job is not available'; end if;
  insert into public.job_applications(job_id, worker_id, message)
  values (target_job_id, actor_id, trim(application_message)) returning id into created_id;
  insert into public.activity_logs(actor_id, actor_role, event_type, category, target_type, target_id, description, status, metadata)
  values (actor_id, 'pekerja', 'application.submitted', 'recruitment', 'job_application', created_id::text, 'Mengirim lamaran untuk ' || job_title, 'success', jsonb_build_object('job_id', target_job_id));
  return created_id;
end; $$;

create or replace function public.create_supplier_offer(offer_item_name text, offer_unit text, offer_unit_price numeric)
returns uuid language plpgsql security definer set search_path = '' as $$
declare actor_id uuid := auth.uid(); created_id uuid;
begin
  if not exists (select 1 from public.profiles where id = actor_id and role = 'supplier' and account_status = 'active') then
    raise exception 'Active supplier account required';
  end if;
  insert into public.supplier_offers(supplier_id, item_name, unit, unit_price)
  values (actor_id, trim(offer_item_name), trim(offer_unit), offer_unit_price) returning id into created_id;
  insert into public.activity_logs(actor_id, actor_role, event_type, category, target_type, target_id, description, status)
  values (actor_id, 'supplier', 'supplier.offer_created', 'supplier', 'supplier_offer', created_id::text, 'Membuat penawaran ' || trim(offer_item_name), 'success');
  return created_id;
end; $$;

revoke all on function public.create_job_posting(text, text) from public, anon, authenticated;
revoke all on function public.submit_job_application(uuid, text) from public, anon, authenticated;
revoke all on function public.create_supplier_offer(text, text, numeric) from public, anon, authenticated;
grant execute on function public.create_job_posting(text, text) to authenticated, service_role;
grant execute on function public.submit_job_application(uuid, text) to authenticated, service_role;
grant execute on function public.create_supplier_offer(text, text, numeric) to authenticated, service_role;

commit;
