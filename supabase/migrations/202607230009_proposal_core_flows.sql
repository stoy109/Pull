begin;

alter table public.profiles
  add column if not exists public_slug text,
  add column if not exists business_description text,
  add column if not exists business_category text,
  add column if not exists business_address text,
  add column if not exists district text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists logo_url text,
  add column if not exists cover_url text,
  add column if not exists website_url text,
  add column if not exists storefront_enabled boolean not null default false,
  add column if not exists whatsapp_verified_at timestamptz,
  add column if not exists verification_level smallint not null default 0,
  add column if not exists kyc_status text not null default 'not_submitted',
  add column if not exists trust_score numeric(5,2) not null default 0,
  add column if not exists rating_count integer not null default 0,
  add column if not exists profile_views bigint not null default 0,
  add column if not exists contact_count bigint not null default 0;

with slug_source as (
  select
    id,
    coalesce(
      nullif(trim(both '-' from lower(regexp_replace(
        coalesce(nullif(trim(business_name), ''), nullif(trim(display_name), ''), 'profile'),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      ))),
      ''
    )) as base_slug
  from public.profiles
  where public_slug is null
)
update public.profiles as profiles
set public_slug = trim(both '-' from left(coalesce(slug_source.base_slug, 'profile'), 60))
  || '-' || replace(profiles.id::text, '-', '')
from slug_source
where profiles.id = slug_source.id;

alter table public.profiles
  alter column public_slug set default ('profile-' || replace(gen_random_uuid()::text, '-', '')),
  alter column public_slug set not null;

create unique index if not exists profiles_public_slug_key
  on public.profiles(lower(public_slug));
create index if not exists profiles_public_storefront_idx
  on public.profiles(storefront_enabled, role, account_status)
  where storefront_enabled;


do $$
begin
  alter table public.profiles add constraint profiles_public_slug_format_check
    check (
      char_length(public_slug) between 3 and 100
      and public_slug = lower(public_slug)
      and public_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    );
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.profiles add constraint profiles_geo_check
    check (
      (latitude is null and longitude is null)
      or (latitude between -90 and 90 and longitude between -180 and 180)
    );
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.profiles add constraint profiles_verification_level_check
    check (verification_level between 0 and 2);
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.profiles add constraint profiles_kyc_status_check
    check (kyc_status in ('not_submitted', 'pending', 'verified', 'rejected'));
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter table public.profiles add constraint profiles_trust_metrics_check
    check (
      trust_score between 0 and 100
      and rating_count >= 0
      and profile_views >= 0
      and contact_count >= 0
    );
exception when duplicate_object then null;
end
$$;

create table if not exists public.business_products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (char_length(category) between 2 and 80),
  description text check (description is null or char_length(description) <= 1000),
  unit text not null check (char_length(unit) between 1 and 30),
  price numeric(14,2) not null check (price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  item_name text not null check (char_length(item_name) between 2 and 120),
  category text not null check (char_length(category) between 2 and 80),
  description text not null check (char_length(description) between 5 and 1000),
  unit text not null check (char_length(unit) between 1 and 30),
  target_quantity numeric(14,3) not null check (target_quantity > 0),
  current_quantity numeric(14,3) not null default 0 check (current_quantity >= 0),
  min_threshold numeric(14,3) not null check (min_threshold > 0),
  tier1_price numeric(14,2) check (tier1_price is null or tier1_price > 0),
  tier2_price numeric(14,2) check (tier2_price is null or tier2_price > 0),
  market_price numeric(14,2) check (market_price is null or market_price > 0),
  district text not null check (char_length(district) between 2 and 120),
  latitude numeric(9,6),
  longitude numeric(9,6),
  deadline timestamptz not null,
  status text not null default 'open' check (
    status in ('open', 'threshold_met', 'ready', 'ordered', 'fulfilled', 'expired', 'cancelled')
  ),
  supplier_id uuid references public.profiles(id) on delete set null,
  hub text check (hub is null or char_length(hub) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pools_quantity_check check (
    min_threshold <= target_quantity and current_quantity <= target_quantity
  ),
  constraint pools_geo_check check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  )
);

create table if not exists public.pool_members (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  quantity numeric(14,3) not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pool_id, member_id)
);

alter table public.job_postings
  add column if not exists category text,
  add column if not exists district text,
  add column if not exists wage_amount numeric(14,2),
  add column if not exists wage_unit text,
  add column if not exists duration_days integer,
  add column if not exists start_date date,
  add column if not exists end_date date,
  add column if not exists quota integer not null default 1,
  add column if not exists hours_per_day numeric(4,2),
  add column if not exists requirements text;

do $$
begin
  alter table public.job_postings add constraint job_postings_details_check check (
    (category is null or char_length(category) between 2 and 80)
    and (district is null or char_length(district) between 2 and 120)
    and (wage_amount is null or wage_amount > 0)
    and (wage_unit is null or char_length(wage_unit) between 1 and 40)
    and (duration_days is null or duration_days > 0)
    and (start_date is null or end_date is null or end_date >= start_date)
    and quota > 0
    and (hours_per_day is null or hours_per_day > 0 and hours_per_day <= 24)
    and (requirements is null or char_length(requirements) <= 1500)
  );
exception when duplicate_object then null;
end
$$;

alter table public.job_applications
  add column if not exists owner_confirmed_at timestamptz,
  add column if not exists worker_confirmed_at timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.job_applications
  drop constraint if exists job_applications_status_check;
alter table public.job_applications
  add constraint job_applications_status_check
  check (status in ('submitted', 'accepted', 'rejected', 'withdrawn', 'completed'));

alter table public.supplier_offers
  add column if not exists pool_id uuid references public.pools(id) on delete cascade,
  add column if not exists stock_quantity numeric(14,3) not null default 0,
  add column if not exists min_order_quantity numeric(14,3) not null default 1,
  add column if not exists category text,
  add column if not exists description text;

do $$
begin
  alter table public.supplier_offers add constraint supplier_offers_catalog_check check (
    stock_quantity >= 0
    and min_order_quantity > 0
    and (category is null or char_length(category) between 2 and 80)
    and (description is null or char_length(description) <= 1000)
  );
exception when duplicate_object then null;
end
$$;

create unique index if not exists supplier_offers_pool_supplier_key
  on public.supplier_offers(pool_id, supplier_id)
  where pool_id is not null;

create table if not exists public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete restrict,
  offer_id uuid not null references public.supplier_offers(id) on delete restrict,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  supplier_id uuid not null references public.profiles(id) on delete restrict,
  quantity numeric(14,3) not null check (quantity > 0),
  unit text not null check (char_length(unit) between 1 and 30),
  unit_price numeric(14,2) not null check (unit_price > 0),
  subtotal numeric(16,2) not null check (subtotal > 0),
  total numeric(16,2) not null check (total > 0 and total >= subtotal),
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'rejected', 'processing', 'shipped', 'completed', 'cancelled')
  ),
  accepted_at timestamptz,
  shipped_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint supplier_orders_parties_check check (buyer_id <> supplier_id)
);

create unique index if not exists supplier_orders_one_live_pool_idx
  on public.supplier_orders(pool_id)
  where status in ('pending', 'accepted', 'processing', 'shipped');

create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references public.profiles(id) on delete cascade,
  rated_profile_id uuid not null references public.profiles(id) on delete cascade,
  job_application_id uuid references public.job_applications(id) on delete cascade,
  supplier_order_id uuid references public.supplier_orders(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  review text check (review is null or char_length(review) between 3 and 1000),
  created_at timestamptz not null default now(),
  constraint ratings_transaction_check check (
    (job_application_id is not null)::integer
      + (supplier_order_id is not null)::integer = 1
  ),
  constraint ratings_parties_check check (rater_id <> rated_profile_id)
);

create unique index if not exists ratings_job_rater_key
  on public.ratings(job_application_id, rater_id)
  where job_application_id is not null;
create unique index if not exists ratings_order_rater_key
  on public.ratings(supplier_order_id, rater_id)
  where supplier_order_id is not null;

create table if not exists public.points_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null check (points <> 0),
  reason text not null check (char_length(reason) between 3 and 120),
  job_application_id uuid references public.job_applications(id) on delete set null,
  supplier_order_id uuid references public.supplier_orders(id) on delete set null,
  idempotency_key text not null unique check (char_length(idempotency_key) <= 200),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  jobs_enabled boolean not null default true,
  pools_enabled boolean not null default true,
  orders_enabled boolean not null default true,
  ratings_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null check (
    notification_type in ('jobs', 'pools', 'orders', 'ratings', 'system')
  ),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 500),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

insert into public.notification_preferences(user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create table if not exists public.contact_redirect_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'website')),
  created_at timestamptz not null default now()
);

create table if not exists public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null check (char_length(document_type) between 2 and 80),
  storage_path text not null check (char_length(storage_path) between 3 and 500),
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 8192
  ),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists kyc_submissions_one_pending_type_idx
  on public.kyc_submissions(user_id, document_type)
  where status = 'pending';

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid not null references public.profiles(id) on delete restrict,
  payee_id uuid not null references public.profiles(id) on delete restrict,
  supplier_order_id uuid references public.supplier_orders(id) on delete restrict,
  job_application_id uuid references public.job_applications(id) on delete restrict,
  amount numeric(16,2) not null check (amount > 0),
  currency text not null default 'IDR' check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'initialized' check (
    status in ('initialized', 'pending', 'authorized', 'settled', 'failed', 'cancelled', 'refunded')
  ),
  provider text,
  provider_reference text,
  failure_reason text,
  authorized_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_transactions_parties_check check (payer_id <> payee_id),
  constraint payment_transactions_reference_check check (
    (supplier_order_id is not null)::integer
      + (job_application_id is not null)::integer = 1
  )
);

create table if not exists public.worker_certificates (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid not null references public.job_applications(id) on delete cascade,
  certificate_name text not null check (char_length(certificate_name) between 2 and 120),
  issuer text not null check (char_length(issuer) between 2 and 120),
  issued_at date not null,
  credential_url text,
  created_at timestamptz not null default now(),
  unique (application_id, certificate_name)
);

create table if not exists public.worker_portfolio (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid not null references public.job_applications(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 1000),
  media_urls jsonb not null default '[]'::jsonb check (jsonb_typeof(media_urls) = 'array'),
  created_at timestamptz not null default now(),
  unique (application_id, title)
);

create index if not exists business_products_owner_active_idx
  on public.business_products(owner_id, is_active, created_at desc);
create index if not exists pools_status_deadline_idx
  on public.pools(status, deadline);
create index if not exists pools_owner_created_idx
  on public.pools(owner_id, created_at desc);
create index if not exists pools_supplier_status_idx
  on public.pools(supplier_id, status) where supplier_id is not null;
create index if not exists pool_members_member_created_idx
  on public.pool_members(member_id, created_at desc);
create index if not exists job_postings_category_district_idx
  on public.job_postings(category, district) where status = 'published';
create index if not exists job_applications_status_idx
  on public.job_applications(status, updated_at desc);
create index if not exists supplier_offers_category_active_idx
  on public.supplier_offers(category, status, created_at desc);
create index if not exists supplier_orders_buyer_created_idx
  on public.supplier_orders(buyer_id, created_at desc);
create index if not exists supplier_orders_supplier_created_idx
  on public.supplier_orders(supplier_id, created_at desc);
create index if not exists ratings_rated_created_idx
  on public.ratings(rated_profile_id, created_at desc);
create index if not exists points_ledger_profile_created_idx
  on public.points_ledger(profile_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, created_at desc) where read_at is null;
create index if not exists contact_redirect_logs_profile_created_idx
  on public.contact_redirect_logs(profile_id, created_at desc);
create index if not exists kyc_submissions_user_created_idx
  on public.kyc_submissions(user_id, created_at desc);
create index if not exists payment_transactions_party_created_idx
  on public.payment_transactions(payer_id, payee_id, created_at desc);
create index if not exists worker_certificates_worker_idx
  on public.worker_certificates(worker_id, issued_at desc);
create index if not exists worker_portfolio_worker_idx
  on public.worker_portfolio(worker_id, created_at desc);

create or replace function public.current_active_role()
returns public.app_role
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role public.app_role;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select profiles.role into actor_role
  from public.profiles as profiles
  where profiles.id = auth.uid()
    and profiles.account_status = 'active'::public.account_status;

  if actor_role is null then
    raise exception 'Active profile with a role is required';
  end if;

  return actor_role;
end;
$$;

create or replace function public.notification_is_enabled(
  target_user_id uuid,
  requested_type text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  enabled boolean;
begin
  select case requested_type
    when 'jobs' then preferences.jobs_enabled
    when 'pools' then preferences.pools_enabled
    when 'orders' then preferences.orders_enabled
    when 'ratings' then preferences.ratings_enabled
    else true
  end and preferences.in_app_enabled
  into enabled
  from public.notification_preferences as preferences
  where preferences.user_id = target_user_id;

  return coalesce(enabled, true);
end;
$$;

create or replace function public.can_manage_pool_members(target_pool_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.pools
    where id = target_pool_id
      and (owner_id = auth.uid() or supplier_id = auth.uid())
  );
$$;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.initialize_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notification_preferences(user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create or replace function public.validate_completed_application_record()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  application_worker_id uuid;
  application_status text;
begin
  select applications.worker_id, applications.status
    into application_worker_id, application_status
  from public.job_applications as applications
  where applications.id = new.application_id;

  if not found or application_status <> 'completed' or application_worker_id <> new.worker_id then
    raise exception 'A completed application belonging to the worker is required';
  end if;

  return new;
end;
$$;

create or replace function public.create_pool(
  pool_item_name text,
  pool_category text,
  pool_description text,
  pool_unit text,
  pool_target_quantity numeric,
  pool_min_threshold numeric,
  pool_deadline timestamptz,
  pool_district text,
  pool_tier1_price numeric default null,
  pool_tier2_price numeric default null,
  pool_market_price numeric default null,
  pool_latitude numeric default null,
  pool_longitude numeric default null,
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
  created_id uuid;
begin
  actor_role := public.current_active_role();
  if actor_role <> 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if char_length(trim(pool_item_name)) not between 2 and 120
    or char_length(trim(pool_category)) not between 2 and 80
    or char_length(trim(pool_description)) not between 5 and 1000
    or char_length(trim(pool_unit)) not between 1 and 30
    or char_length(trim(pool_district)) not between 2 and 120 then
    raise exception 'Pool details are invalid';
  end if;
  if pool_target_quantity is null or pool_target_quantity <= 0
    or pool_min_threshold is null or pool_min_threshold <= 0
    or pool_min_threshold > pool_target_quantity then
    raise exception 'Pool quantities are invalid';
  end if;
  if pool_deadline is null or pool_deadline <= now() then
    raise exception 'Pool deadline must be in the future';
  end if;
  if (pool_latitude is null) <> (pool_longitude is null)
    or pool_latitude is not null and (pool_latitude not between -90 and 90 or pool_longitude not between -180 and 180) then
    raise exception 'Pool coordinates are invalid';
  end if;
  if pool_tier1_price is not null and pool_tier1_price <= 0
    or pool_tier2_price is not null and pool_tier2_price <= 0
    or pool_market_price is not null and pool_market_price <= 0 then
    raise exception 'Pool prices are invalid';
  end if;

  insert into public.pools(
    owner_id, item_name, category, description, unit, target_quantity,
    min_threshold, tier1_price, tier2_price, market_price, district,
    latitude, longitude, deadline, hub
  ) values (
    actor_id, trim(pool_item_name), trim(pool_category), trim(pool_description),
    trim(pool_unit), pool_target_quantity, pool_min_threshold, pool_tier1_price,
    pool_tier2_price, pool_market_price, trim(pool_district), pool_latitude,
    pool_longitude, pool_deadline, nullif(left(trim(pool_hub), 200), '')
  ) returning id into created_id;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'pool.created', 'pool', 'pool', created_id::text,
    'Membuat pool ' || trim(pool_item_name), 'success',
    jsonb_build_object('pool_id', created_id, 'item_name', trim(pool_item_name))
  );

  return created_id;
end;
$$;

create or replace function public.join_pool(
  target_pool_id uuid,
  member_quantity numeric
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
  created_id uuid;
  next_quantity numeric;
begin
  actor_role := public.current_active_role();
  if actor_role <> 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if target_pool_id is null or member_quantity is null or member_quantity <= 0 then
    raise exception 'Pool and quantity are required';
  end if;

  select * into selected_pool
  from public.pools
  where id = target_pool_id
  for update;

  if not found or selected_pool.status not in ('open', 'threshold_met')
    or selected_pool.deadline <= now() then
    raise exception 'Pool is not open for members';
  end if;

  next_quantity := selected_pool.current_quantity + member_quantity;
  if next_quantity > selected_pool.target_quantity then
    raise exception 'Quantity exceeds the remaining pool target';
  end if;

  insert into public.pool_members(pool_id, member_id, quantity)
  values (target_pool_id, actor_id, member_quantity)
  returning id into created_id;

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
    actor_id, actor_role, 'pool.joined', 'pool', 'pool', target_pool_id::text,
    'Bergabung ke pool ' || selected_pool.item_name, 'success',
    jsonb_build_object('pool_id', target_pool_id, 'quantity', member_quantity)
  );

  if selected_pool.owner_id <> actor_id
    and public.notification_is_enabled(selected_pool.owner_id, 'pools') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      selected_pool.owner_id, 'pools', 'Anggota pool baru',
      'UMKM lain bergabung ke pool ' || selected_pool.item_name,
      jsonb_build_object('pool_id', target_pool_id)
    );
  end if;

  return created_id;
end;
$$;

create or replace function public.resolve_due_pools()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  changed_pool record;
  resolved_count integer := 0;
begin
  if actor_id is null then
    actor_role := 'admin'::public.app_role;
  else
    actor_role := public.current_active_role();
    if actor_role <> 'admin'::public.app_role then
      raise exception 'Administrator access required';
    end if;
  end if;

  for changed_pool in
    update public.pools
    set status = case when current_quantity >= min_threshold then 'ready' else 'expired' end
    where status in ('open', 'threshold_met') and deadline <= now()
    returning id, owner_id, item_name, status
  loop
    resolved_count := resolved_count + 1;
    insert into public.activity_logs(
      actor_id, actor_role, event_type, category, target_type, target_id,
      description, status, metadata
    ) values (
      actor_id, actor_role, 'pool.status_changed', 'pool', 'pool', changed_pool.id::text,
      'Status pool diperbarui menjadi ' || changed_pool.status, 'success',
      jsonb_build_object('pool_id', changed_pool.id, 'status', changed_pool.status)
    );
    if public.notification_is_enabled(changed_pool.owner_id, 'pools') then
      insert into public.notifications(user_id, notification_type, title, body, data)
      values (
        changed_pool.owner_id, 'pools', 'Batas waktu pool tercapai',
        changed_pool.item_name || ': ' || changed_pool.status,
        jsonb_build_object('pool_id', changed_pool.id, 'status', changed_pool.status)
      );
    end if;
  end loop;

  return resolved_count;
end;
$$;

create or replace function public.create_full_job_posting(
  job_title text,
  job_description text,
  job_category text,
  job_district text,
  job_wage numeric,
  job_wage_unit text,
  job_duration_days integer,
  job_start_date date,
  job_end_date date,
  job_quota integer,
  job_hours_per_day numeric,
  job_requirements text default null,
  job_status text default 'published'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  created_id uuid;
begin
  actor_role := public.current_active_role();
  if actor_role <> 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if char_length(trim(job_title)) not between 3 and 100
    or char_length(trim(job_description)) not between 10 and 500
    or char_length(trim(job_category)) not between 2 and 80
    or char_length(trim(job_district)) not between 2 and 120
    or char_length(trim(job_wage_unit)) not between 1 and 40 then
    raise exception 'Job details are invalid';
  end if;
  if job_wage is null or job_wage <= 0
    or job_duration_days is null or job_duration_days <= 0
    or job_quota is null or job_quota <= 0
    or job_hours_per_day is null or job_hours_per_day <= 0 or job_hours_per_day > 24 then
    raise exception 'Job numbers are invalid';
  end if;
  if job_start_date is null or job_end_date is null or job_end_date < job_start_date then
    raise exception 'Job dates are invalid';
  end if;
  if job_requirements is not null and char_length(trim(job_requirements)) > 1500 then
    raise exception 'Job requirements are too long';
  end if;
  if job_status not in ('draft', 'published') then
    raise exception 'Job status is invalid';
  end if;

  insert into public.job_postings(
    owner_id, title, description, status, category, district, wage_amount,
    wage_unit, duration_days, start_date, end_date, quota, hours_per_day,
    requirements
  ) values (
    actor_id, trim(job_title), trim(job_description), job_status,
    trim(job_category), trim(job_district), job_wage, trim(job_wage_unit),
    job_duration_days, job_start_date, job_end_date, job_quota,
    job_hours_per_day, nullif(trim(job_requirements), '')
  ) returning id into created_id;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role,
    case when job_status = 'published' then 'job.published' else 'job.created' end,
    'recruitment', 'job_posting', created_id::text,
    case when job_status = 'published' then 'Menerbitkan lowongan ' else 'Membuat draf lowongan ' end || trim(job_title),
    'success', jsonb_build_object('job_id', created_id)
  );

  return created_id;
end;
$$;

create or replace function public.set_application_status(
  target_application_id uuid,
  requested_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  application_worker_id uuid;
  application_status text;
  application_job_id uuid;
  job_owner_id uuid;
  job_title text;
  job_quota integer;
  placed_count integer;
begin
  actor_role := public.current_active_role();

  select applications.worker_id, applications.status, applications.job_id,
         jobs.owner_id, jobs.title, jobs.quota
    into application_worker_id, application_status, application_job_id,
         job_owner_id, job_title, job_quota
  from public.job_applications as applications
  join public.job_postings as jobs on jobs.id = applications.job_id
  where applications.id = target_application_id
  for update of applications, jobs;

  if not found then
    raise exception 'Application is not available';
  end if;
  if application_status <> 'submitted' then
    raise exception 'Only submitted applications can change status';
  end if;

  if actor_id = job_owner_id and actor_role = 'umkm'::public.app_role then
    if requested_status not in ('accepted', 'rejected') then
      raise exception 'Job owner may only accept or reject';
    end if;
    if requested_status = 'accepted' then
      select count(*) into placed_count
      from public.job_applications
      where job_id = application_job_id
        and status in ('accepted', 'completed')
        and id <> target_application_id;
      if placed_count >= job_quota then
        raise exception 'Job quota is full';
      end if;
    end if;
  elsif actor_id = application_worker_id and actor_role = 'pekerja'::public.app_role then
    if requested_status <> 'withdrawn' then
      raise exception 'Worker may only withdraw an application';
    end if;
  else
    raise exception 'Application ownership is required';
  end if;

  update public.job_applications
  set status = requested_status
  where id = target_application_id;

  if requested_status = 'accepted' and placed_count + 1 >= job_quota then
    update public.job_postings
    set status = 'closed'
    where id = application_job_id;
  end if;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role,
    case requested_status
      when 'accepted' then 'application.accepted'
      when 'rejected' then 'application.rejected'
      else 'application.withdrawn'
    end,
    'recruitment', 'job_application', target_application_id::text,
    'Status lamaran ' || job_title || ' menjadi ' || requested_status,
    'success', jsonb_build_object('job_id', application_job_id)
  );

  if actor_id = job_owner_id
    and public.notification_is_enabled(application_worker_id, 'jobs') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      application_worker_id, 'jobs', 'Status lamaran diperbarui',
      job_title || ': ' || requested_status,
      jsonb_build_object('application_id', target_application_id, 'status', requested_status)
    );
  elsif actor_id = application_worker_id
    and public.notification_is_enabled(job_owner_id, 'jobs') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      job_owner_id, 'jobs', 'Lamaran ditarik',
      'Pekerja menarik lamaran untuk ' || job_title,
      jsonb_build_object('application_id', target_application_id)
    );
  end if;

  return requested_status;
end;
$$;

create or replace function public.confirm_job_completion(
  target_application_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  application_worker_id uuid;
  job_owner_id uuid;
  job_title text;
  job_description text;
  job_owner_name text;
  application_status text;
  owner_confirmation timestamptz;
  worker_confirmation timestamptz;
  was_changed boolean := false;
  is_complete boolean := false;
begin
  actor_role := public.current_active_role();

  select applications.worker_id, jobs.owner_id, jobs.title, jobs.description,
         coalesce(nullif(profiles.business_name, ''), nullif(profiles.display_name, ''), 'UMKM Pull'),
         applications.status, applications.owner_confirmed_at, applications.worker_confirmed_at
    into application_worker_id, job_owner_id, job_title, job_description,
         job_owner_name, application_status, owner_confirmation, worker_confirmation
  from public.job_applications as applications
  join public.job_postings as jobs on jobs.id = applications.job_id
  join public.profiles as profiles on profiles.id = jobs.owner_id
  where applications.id = target_application_id
  for update of applications;

  if not found then
    raise exception 'Application is not available';
  end if;
  if application_status not in ('accepted', 'completed') then
    raise exception 'Accepted application is required';
  end if;

  if actor_id = job_owner_id and actor_role = 'umkm'::public.app_role then
    if owner_confirmation is null then
      owner_confirmation := now();
      was_changed := true;
    end if;
  elsif actor_id = application_worker_id and actor_role = 'pekerja'::public.app_role then
    if worker_confirmation is null then
      worker_confirmation := now();
      was_changed := true;
    end if;
  else
    raise exception 'Application party is required';
  end if;

  update public.job_applications
  set owner_confirmed_at = owner_confirmation,
      worker_confirmed_at = worker_confirmation
  where id = target_application_id;

  if was_changed then
    insert into public.activity_logs(
      actor_id, actor_role, event_type, category, target_type, target_id,
      description, status, metadata
    ) values (
      actor_id, actor_role, 'work.confirmed', 'recruitment',
      'job_application', target_application_id::text,
      'Mengonfirmasi penyelesaian pekerjaan ' || job_title, 'success',
      jsonb_build_object('application_id', target_application_id)
    );
  end if;

  if owner_confirmation is not null and worker_confirmation is not null then
    update public.job_applications
    set status = 'completed', completed_at = coalesce(completed_at, now())
    where id = target_application_id and status <> 'completed';

    if found then
      insert into public.points_ledger(
        profile_id, points, reason, job_application_id, idempotency_key
      ) values (
        application_worker_id, 10, 'Completed job', target_application_id,
        'job-completed:' || target_application_id::text || ':worker'
      ) on conflict (idempotency_key) do nothing;

      insert into public.worker_certificates(
        worker_id, application_id, certificate_name, issuer, issued_at
      ) values (
        application_worker_id, target_application_id, 'Sertifikat ' || job_title,
        left(job_owner_name, 120), current_date
      ) on conflict (application_id, certificate_name) do nothing;

      insert into public.worker_portfolio(
        worker_id, application_id, title, description
      ) values (
        application_worker_id, target_application_id, job_title, job_description
      ) on conflict (application_id, title) do nothing;

      insert into public.activity_logs(
        actor_id, actor_role, event_type, category, target_type, target_id,
        description, status, metadata
      ) values (
        actor_id, actor_role, 'assignment.completed', 'recruitment',
        'job_application', target_application_id::text,
        'Pekerjaan selesai: ' || job_title, 'success',
        jsonb_build_object('application_id', target_application_id)
      );
    end if;
    is_complete := true;
  end if;

  return is_complete;
end;
$$;

create or replace function public.submit_transaction_rating(
  transaction_type text,
  transaction_id uuid,
  rating_score integer,
  rating_review text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  first_party uuid;
  second_party uuid;
  rated_id uuid;
  created_id uuid;
  job_reference uuid;
  order_reference uuid;
begin
  actor_role := public.current_active_role();
  if rating_score is null or rating_score not between 1 and 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;
  if rating_review is not null and char_length(trim(rating_review)) not between 3 and 1000 then
    raise exception 'Review length is invalid';
  end if;

  if transaction_type = 'job_application' then
    select applications.worker_id, jobs.owner_id
      into first_party, second_party
    from public.job_applications as applications
    join public.job_postings as jobs on jobs.id = applications.job_id
    where applications.id = transaction_id
      and applications.status = 'completed'
      and applications.completed_at is not null;
    job_reference := transaction_id;
  elsif transaction_type = 'supplier_order' then
    select orders.buyer_id, orders.supplier_id
      into first_party, second_party
    from public.supplier_orders as orders
    where orders.id = transaction_id
      and orders.status = 'completed'
      and orders.completed_at is not null;
    order_reference := transaction_id;
  else
    raise exception 'Transaction type is invalid';
  end if;

  if first_party is null or actor_id not in (first_party, second_party) then
    raise exception 'Completed transaction party is required';
  end if;
  rated_id := case when actor_id = first_party then second_party else first_party end;

  insert into public.ratings(
    rater_id, rated_profile_id, job_application_id, supplier_order_id,
    score, review
  ) values (
    actor_id, rated_id, job_reference, order_reference, rating_score,
    nullif(trim(rating_review), '')
  ) returning id into created_id;

  update public.profiles
  set rating_count = aggregate.rating_count,
      trust_score = aggregate.trust_score
  from (
    select count(*)::integer as rating_count,
           round(avg(score)::numeric * 20, 2) as trust_score
    from public.ratings
    where rated_profile_id = rated_id
  ) as aggregate
  where id = rated_id;

  insert into public.points_ledger(
    profile_id, points, reason, job_application_id, supplier_order_id,
    idempotency_key
  ) values (
    actor_id, 1, 'Submitted transaction rating', job_reference,
    order_reference, 'rating-submitted:' || created_id::text
  );

  if public.notification_is_enabled(rated_id, 'ratings') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      rated_id, 'ratings', 'Ulasan transaksi baru',
      'Anda menerima rating ' || rating_score::text || ' dari transaksi selesai',
      jsonb_build_object('rating_id', created_id, 'transaction_type', transaction_type)
    );
  end if;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'rating.submitted',
    case
      when transaction_type = 'job_application' then 'recruitment'::public.activity_category
      else 'supplier'::public.activity_category
    end,
    transaction_type, transaction_id::text,
    'Memberikan rating transaksi', 'success',
    jsonb_build_object('rating_id', created_id, 'score', rating_score)
  );

  return created_id;
end;
$$;

create or replace function public.upsert_business_profile(
  profile_slug text,
  profile_business_name text,
  profile_description text default null,
  profile_category text default null,
  profile_address text default null,
  profile_district text default null,
  profile_latitude numeric default null,
  profile_longitude numeric default null,
  profile_whatsapp text default null,
  profile_logo_url text default null,
  profile_cover_url text default null,
  profile_website_url text default null,
  profile_storefront_enabled boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  normalized_slug text := lower(trim(profile_slug));
  normalized_phone text := nullif(trim(profile_whatsapp), '');
  result jsonb;
begin
  actor_role := public.current_active_role();
  if actor_role <> 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if char_length(normalized_slug) not between 3 and 80
    or normalized_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Public slug is invalid';
  end if;
  if char_length(trim(profile_business_name)) not between 2 and 120 then
    raise exception 'Business name is invalid';
  end if;
  if profile_description is not null and char_length(trim(profile_description)) > 1500
    or profile_category is not null and char_length(trim(profile_category)) > 80
    or profile_address is not null and char_length(trim(profile_address)) > 300
    or profile_district is not null and char_length(trim(profile_district)) > 120 then
    raise exception 'Business profile is too long';
  end if;
  if (profile_latitude is null) <> (profile_longitude is null)
    or profile_latitude is not null and (profile_latitude not between -90 and 90 or profile_longitude not between -180 and 180) then
    raise exception 'Business coordinates are invalid';
  end if;
  if normalized_phone is not null
    and char_length(regexp_replace(normalized_phone, '[^0-9]', '', 'g')) not between 8 and 15 then
    raise exception 'WhatsApp number is invalid';
  end if;
  if profile_logo_url is not null and trim(profile_logo_url) !~ '^https?://'
    or profile_cover_url is not null and trim(profile_cover_url) !~ '^https?://'
    or profile_website_url is not null and trim(profile_website_url) !~ '^https://'
    then raise exception 'Public URL is invalid';
  end if;

  update public.profiles
  set public_slug = normalized_slug,
      business_name = trim(profile_business_name),
      business_description = nullif(trim(profile_description), ''),
      business_category = nullif(trim(profile_category), ''),
      business_address = nullif(trim(profile_address), ''),
      district = nullif(trim(profile_district), ''),
      latitude = profile_latitude,
      longitude = profile_longitude,
      phone = normalized_phone,
      whatsapp_verified_at = case
        when phone is distinct from normalized_phone then null
        else whatsapp_verified_at
      end,
      logo_url = nullif(trim(profile_logo_url), ''),
      cover_url = nullif(trim(profile_cover_url), ''),
      website_url = nullif(trim(profile_website_url), ''),
      storefront_enabled = coalesce(profile_storefront_enabled, false)
  where id = actor_id;

  select jsonb_build_object(
    'slug', public_slug,
    'business_name', business_name,
    'storefront_enabled', storefront_enabled,
    'whatsapp_verified', whatsapp_verified_at is not null,
    'updated_at', updated_at
  ) into result
  from public.profiles
  where id = actor_id;

  return result;
end;
$$;

create or replace function public.upsert_business_product(
  product_name text,
  product_category text,
  product_unit text,
  product_price numeric,
  product_description text default null,
  product_image_url text default null,
  product_is_active boolean default true,
  target_product_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  product_id uuid;
begin
  actor_role := public.current_active_role();
  if actor_role <> 'umkm'::public.app_role then
    raise exception 'Active UMKM account required';
  end if;
  if char_length(trim(product_name)) not between 2 and 120
    or char_length(trim(product_category)) not between 2 and 80
    or char_length(trim(product_unit)) not between 1 and 30
    or product_price is null or product_price < 0 then
    raise exception 'Product details are invalid';
  end if;
  if product_description is not null and char_length(trim(product_description)) > 1000 then
    raise exception 'Product description is too long';
  end if;
  if product_image_url is not null and trim(product_image_url) !~ '^https?://' then
    raise exception 'Product image URL is invalid';
  end if;

  if target_product_id is null then
    insert into public.business_products(
      owner_id, name, category, description, unit, price, image_url, is_active
    ) values (
      actor_id, trim(product_name), trim(product_category),
      nullif(trim(product_description), ''), trim(product_unit), product_price,
      nullif(trim(product_image_url), ''), coalesce(product_is_active, true)
    ) returning id into product_id;
  else
    update public.business_products
    set name = trim(product_name),
        category = trim(product_category),
        description = nullif(trim(product_description), ''),
        unit = trim(product_unit),
        price = product_price,
        image_url = nullif(trim(product_image_url), ''),
        is_active = coalesce(product_is_active, true)
    where id = target_product_id and owner_id = actor_id
    returning id into product_id;
    if product_id is null then
      raise exception 'Owned product is not available';
    end if;
  end if;

  return product_id;
end;
$$;

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
  if actor_role <> 'supplier'::public.app_role
    or not exists (
      select 1 from public.profiles
      where id = actor_id
        and verification_level >= 2
        and kyc_status = 'verified'
    ) then
    raise exception 'Verified supplier account required';
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

create or replace function public.submit_supplier_offer_against_pool(
  target_pool_id uuid,
  offer_unit_price numeric,
  offer_stock_quantity numeric,
  offer_min_order_quantity numeric default 1,
  offer_description text default null
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
  created_id uuid;
begin
  actor_role := public.current_active_role();
  if actor_role <> 'supplier'::public.app_role
    or not exists (
      select 1 from public.profiles
      where id = actor_id
        and verification_level >= 2
        and kyc_status = 'verified'
    ) then
    raise exception 'Verified supplier account required';
  end if;
  if offer_unit_price is null or offer_unit_price <= 0
    or offer_stock_quantity is null or offer_stock_quantity <= 0
    or offer_min_order_quantity is null or offer_min_order_quantity <= 0
    or offer_min_order_quantity > offer_stock_quantity then
    raise exception 'Offer values are invalid';
  end if;
  if offer_description is not null and char_length(trim(offer_description)) > 1000 then
    raise exception 'Offer description is too long';
  end if;

  select * into selected_pool
  from public.pools
  where id = target_pool_id;

  if not found or selected_pool.status not in ('open', 'threshold_met', 'ready')
    or selected_pool.deadline <= now() and selected_pool.status <> 'ready' then
    raise exception 'Supplier demand is not available';
  end if;

  insert into public.supplier_offers(
    supplier_id, pool_id, item_name, unit, unit_price, stock_quantity,
    min_order_quantity, category, description, status
  ) values (
    actor_id, target_pool_id, selected_pool.item_name, selected_pool.unit,
    offer_unit_price, offer_stock_quantity, offer_min_order_quantity,
    selected_pool.category, nullif(trim(offer_description), ''), 'active'
  ) returning id into created_id;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'supplier.offer_created', 'supplier',
    'supplier_offer', created_id::text,
    'Mengirim penawaran untuk pool ' || selected_pool.item_name, 'success',
    jsonb_build_object('pool_id', target_pool_id, 'offer_id', created_id)
  );

  if public.notification_is_enabled(selected_pool.owner_id, 'orders') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      selected_pool.owner_id, 'orders', 'Penawaran supplier baru',
      'Supplier mengirim penawaran untuk ' || selected_pool.item_name,
      jsonb_build_object('pool_id', target_pool_id, 'offer_id', created_id)
    );
  end if;

  return created_id;
end;
$$;

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
  calculated_subtotal numeric(16,2);
begin
  actor_role := public.current_active_role();
  if actor_role <> 'umkm'::public.app_role then
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
    or order_quantity > selected_pool.current_quantity
    or not exists (
      select 1 from public.profiles
      where id = selected_offer.supplier_id
        and role = 'supplier'::public.app_role
        and account_status = 'active'::public.account_status
    ) then
    raise exception 'Supplier offer cannot fulfill this order';
  end if;

  calculated_subtotal := round(order_quantity * selected_offer.unit_price, 2);
  insert into public.supplier_orders(
    pool_id, offer_id, buyer_id, supplier_id, quantity, unit,
    unit_price, subtotal, total
  ) values (
    target_pool_id, target_offer_id, actor_id, selected_offer.supplier_id,
    order_quantity, selected_offer.unit, selected_offer.unit_price,
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

create or replace function public.set_supplier_order_status(
  target_order_id uuid,
  requested_status text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  actor_role public.app_role;
  selected_order public.supplier_orders%rowtype;
  selected_offer public.supplier_offers%rowtype;
  target_user_id uuid;
begin
  actor_role := public.current_active_role();
  if actor_role = 'supplier'::public.app_role
    and not exists (
      select 1 from public.profiles
      where id = actor_id
        and verification_level >= 2
        and kyc_status = 'verified'
    ) then
    raise exception 'Verified supplier account required';
  end if;

  select * into selected_order
  from public.supplier_orders
  where id = target_order_id
  for update;

  if not found then
    raise exception 'Supplier order is not available';
  end if;

  if not (
    selected_order.status = 'pending' and requested_status in ('accepted', 'rejected', 'cancelled')
    or selected_order.status = 'accepted' and requested_status = 'processing'
    or selected_order.status = 'processing' and requested_status = 'shipped'
    or selected_order.status = 'shipped' and requested_status = 'completed'
  ) then
    raise exception 'Supplier order transition is invalid';
  end if;

  if actor_role = 'admin'::public.app_role then
    null;
  elsif requested_status in ('accepted', 'rejected', 'processing', 'shipped') then
    if actor_role <> 'supplier'::public.app_role or actor_id <> selected_order.supplier_id then
      raise exception 'Order supplier access required';
    end if;
  elsif requested_status in ('cancelled', 'completed') then
    if actor_role <> 'umkm'::public.app_role or actor_id <> selected_order.buyer_id then
      raise exception 'Order buyer access required';
    end if;
  end if;

  if requested_status = 'accepted' then
    select * into selected_offer
    from public.supplier_offers
    where id = selected_order.offer_id
    for update;
    if selected_offer.status <> 'active'
      or selected_offer.stock_quantity < selected_order.quantity then
      raise exception 'Supplier stock is insufficient';
    end if;
    update public.supplier_offers
    set stock_quantity = stock_quantity - selected_order.quantity,
        status = case
          when stock_quantity - selected_order.quantity <= 0 then 'inactive'
          else status
        end
    where id = selected_order.offer_id;
    update public.pools
    set status = 'ordered', supplier_id = selected_order.supplier_id
    where id = selected_order.pool_id
      and status in ('threshold_met', 'ready');
    if not found then
      raise exception 'Pool is no longer ready to order';
    end if;
  elsif requested_status = 'completed' then
    update public.pools
    set status = 'fulfilled'
    where id = selected_order.pool_id and status = 'ordered';

    insert into public.points_ledger(
      profile_id, points, reason, supplier_order_id, idempotency_key
    ) values
      (
        selected_order.supplier_id, 10, 'Completed supplier order', target_order_id,
        'supplier-order-completed:' || target_order_id::text || ':supplier'
      ),
      (
        selected_order.buyer_id, 5, 'Completed supplier order', target_order_id,
        'supplier-order-completed:' || target_order_id::text || ':buyer'
      )
    on conflict (idempotency_key) do nothing;
  end if;

  update public.supplier_orders
  set status = requested_status,
      accepted_at = case when requested_status = 'accepted' then now() else accepted_at end,
      shipped_at = case when requested_status = 'shipped' then now() else shipped_at end,
      completed_at = case when requested_status = 'completed' then now() else completed_at end
  where id = target_order_id;

  target_user_id := case
    when actor_id = selected_order.buyer_id then selected_order.supplier_id
    else selected_order.buyer_id
  end;
  if public.notification_is_enabled(target_user_id, 'orders') then
    insert into public.notifications(user_id, notification_type, title, body, data)
    values (
      target_user_id, 'orders', 'Status pesanan diperbarui',
      'Pesanan kini berstatus ' || requested_status,
      jsonb_build_object('order_id', target_order_id, 'status', requested_status)
    );
  end if;

  insert into public.activity_logs(
    actor_id, actor_role, event_type, category, target_type, target_id,
    description, status, metadata
  ) values (
    actor_id, actor_role, 'supplier.order_status_changed', 'supplier',
    'supplier_order', target_order_id::text,
    'Status pesanan supplier menjadi ' || requested_status, 'success',
    jsonb_build_object('order_id', target_order_id, 'status', requested_status)
  );

  return requested_status;
end;
$$;

create or replace function public.get_supplier_demands()
returns table (
  id uuid,
  requester_key text,
  metadata jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public.current_active_role() <> 'supplier'::public.app_role then
    raise exception 'Active supplier account required';
  end if;

  return query
  select
    pools.id,
    md5(pools.owner_id::text) as requester_key,
    jsonb_strip_nulls(jsonb_build_object(
      'pool_id', pools.id,
      'product_name', pools.item_name,
      'item_name', pools.item_name,
      'commodity', pools.item_name,
      'name', pools.item_name,
      'category', pools.category,
      'target_quantity', pools.target_quantity,
      'quantity', pools.target_quantity,
      'volume', pools.target_quantity,
      'current_quantity', pools.current_quantity,
      'unit', pools.unit,
      'district', pools.district,
      'location', pools.district,
      'status', case when pools.status = 'open' then 'open' else 'waiting' end,
      'deadline_at', pools.deadline,
      'deadline', pools.deadline,
      'pool_leader', coalesce(nullif(profiles.business_name, ''), 'Data terlindungi'),
      'whatsapp_masked', 'Nomor disembunyikan',
      'min_threshold', pools.min_threshold,
      'tier1_price', pools.tier1_price,
      'tier2_price', pools.tier2_price,
      'market_price', pools.market_price,
      'hub', pools.hub
    )) as metadata,
    pools.created_at
  from public.pools as pools
  join public.profiles as profiles on profiles.id = pools.owner_id
  where pools.status in ('open', 'threshold_met', 'ready')
  order by pools.created_at desc
  limit 100;
end;
$$;

create or replace function public.get_supplier_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  result jsonb;
begin
  if public.current_active_role() <> 'supplier'::public.app_role then
    raise exception 'Active supplier account required';
  end if;

  select jsonb_build_object(
    'profile', (
      select jsonb_build_object(
        'id', profiles.id,
        'business_name', profiles.business_name,
        'verification_level', profiles.verification_level,
        'kyc_status', profiles.kyc_status,
        'trust_score', profiles.trust_score,
        'rating_count', profiles.rating_count
      )
      from public.profiles as profiles
      where profiles.id = actor_id
    ),
    'products', coalesce((
      select jsonb_agg(to_jsonb(offers) order by offers.created_at desc)
      from public.supplier_offers as offers
      where offers.supplier_id = actor_id and offers.pool_id is null
    ), '[]'::jsonb),
    'pool_offers', coalesce((
      select jsonb_agg(to_jsonb(offers) order by offers.created_at desc)
      from public.supplier_offers as offers
      where offers.supplier_id = actor_id and offers.pool_id is not null
    ), '[]'::jsonb),
    'orders', coalesce((
      select jsonb_agg(to_jsonb(orders) order by orders.created_at desc)
      from public.supplier_orders as orders
      where orders.supplier_id = actor_id
    ), '[]'::jsonb),
    'demands', coalesce((
      select jsonb_agg(to_jsonb(demands) order by demands.created_at desc)
      from public.get_supplier_demands() as demands
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

create or replace function public.get_public_umkm_profile(profile_slug text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'slug', profiles.public_slug,
    'business_name', profiles.business_name,
    'headline', profiles.headline,
    'description', profiles.business_description,
    'category', profiles.business_category,
    'address', profiles.business_address,
    'district', profiles.district,
    'latitude', profiles.latitude,
    'longitude', profiles.longitude,
    'logo_url', profiles.logo_url,
    'cover_url', profiles.cover_url,
    'verification_level', profiles.verification_level,
    'trust_score', profiles.trust_score,
    'rating_count', profiles.rating_count,
    'profile_views', profiles.profile_views,
    'whatsapp_available', profiles.whatsapp_verified_at is not null and profiles.phone is not null,
    'website_available', profiles.website_url is not null,
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', products.id,
        'name', products.name,
        'category', products.category,
        'description', products.description,
        'unit', products.unit,
        'price', products.price,
        'image_url', products.image_url
      ) order by products.created_at desc)
      from public.business_products as products
      where products.owner_id = profiles.id and products.is_active
    ), '[]'::jsonb),
    'reviews', coalesce((
      select jsonb_agg(jsonb_build_object(
        'score', ratings.score,
        'review', ratings.review,
        'created_at', ratings.created_at
      ) order by ratings.created_at desc)
      from (
        select score, review, created_at
        from public.ratings
        where rated_profile_id = profiles.id and review is not null
        order by created_at desc
        limit 20
      ) as ratings
    ), '[]'::jsonb)
  ) into result
  from public.profiles as profiles
  where profiles.public_slug = lower(trim(profile_slug))
    and profiles.role = 'umkm'::public.app_role
    and profiles.account_status = 'active'::public.account_status
    and profiles.storefront_enabled;

  if result is null then
    raise exception 'Public profile is not available';
  end if;

  return result;
end;
$$;

create or replace function public.record_public_profile_view(profile_slug text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set profile_views = profile_views + 1
  where public_slug = lower(trim(profile_slug))
    and role = 'umkm'::public.app_role
    and account_status = 'active'::public.account_status
    and storefront_enabled;

  return found;
end;
$$;

create or replace function public.record_contact_redirect(
  profile_slug text,
  contact_channel text default 'whatsapp'
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_profile_id uuid;
  raw_target text;
  digits text;
  redirect_target text;
begin
  if contact_channel not in ('whatsapp', 'website') then
    raise exception 'Contact channel is invalid';
  end if;

  select profiles.id,
         case contact_channel
           when 'whatsapp' then case
             when profiles.whatsapp_verified_at is not null then profiles.phone
             else null
           end
           else profiles.website_url
         end
    into target_profile_id, raw_target
  from public.profiles as profiles
  where profiles.public_slug = lower(trim(profile_slug))
    and profiles.role = 'umkm'::public.app_role
    and profiles.account_status = 'active'::public.account_status
    and profiles.storefront_enabled;

  if target_profile_id is null or raw_target is null then
    raise exception 'Contact target is not available';
  end if;

  if contact_channel = 'whatsapp' then
    digits := regexp_replace(raw_target, '[^0-9]', '', 'g');
    if left(digits, 1) = '0' then
      digits := '62' || substr(digits, 2);
    end if;
    if char_length(digits) not between 8 and 15 then
      raise exception 'Contact target is not available';
    end if;
    redirect_target := 'https://wa.me/' || digits;
  else
    if raw_target !~ '^https://' then
      raise exception 'Contact target is not available';
    end if;
    redirect_target := raw_target;
  end if;

  insert into public.contact_redirect_logs(profile_id, viewer_id, channel)
  values (target_profile_id, auth.uid(), contact_channel);
  update public.profiles
  set contact_count = contact_count + 1
  where id = target_profile_id;

  -- The redirect route receives only the validated destination, never profile metadata.
  return redirect_target;
end;
$$;

create or replace function public.get_my_notifications(
  notification_limit integer default 50,
  before_created_at timestamptz default null
)
returns table (
  id uuid,
  notification_type text,
  title text,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.current_active_role();

  return query
  select notifications.id, notifications.notification_type, notifications.title,
         notifications.body, notifications.data, notifications.read_at,
         notifications.created_at
  from public.notifications as notifications
  where notifications.user_id = auth.uid()
    and (before_created_at is null or notifications.created_at < before_created_at)
  order by notifications.created_at desc
  limit least(greatest(coalesce(notification_limit, 50), 1), 100);
end;
$$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.current_active_role();

  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = target_notification_id and user_id = auth.uid();

  return found;
end;
$$;

create or replace function public.set_notification_preferences(
  enable_in_app boolean,
  enable_jobs boolean,
  enable_pools boolean,
  enable_orders boolean,
  enable_ratings boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  result jsonb;
begin
  perform public.current_active_role();
  if enable_in_app is null or enable_jobs is null or enable_pools is null
    or enable_orders is null or enable_ratings is null then
    raise exception 'Notification preferences are required';
  end if;

  insert into public.notification_preferences(
    user_id, in_app_enabled, jobs_enabled, pools_enabled, orders_enabled,
    ratings_enabled
  ) values (
    actor_id, enable_in_app, enable_jobs, enable_pools, enable_orders,
    enable_ratings
  )
  on conflict (user_id) do update set
    in_app_enabled = excluded.in_app_enabled,
    jobs_enabled = excluded.jobs_enabled,
    pools_enabled = excluded.pools_enabled,
    orders_enabled = excluded.orders_enabled,
    ratings_enabled = excluded.ratings_enabled;

  select to_jsonb(preferences) into result
  from public.notification_preferences as preferences
  where preferences.user_id = actor_id;

  return result;
end;
$$;

create or replace function public.submit_kyc_record(
  kyc_document_type text,
  kyc_storage_path text,
  kyc_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := auth.uid();
  normalized_path text := trim(kyc_storage_path);
  created_id uuid;
begin
  perform public.current_active_role();
  if char_length(trim(kyc_document_type)) not between 2 and 80 then
    raise exception 'KYC document type is invalid';
  end if;
  if char_length(normalized_path) not between 3 and 500
    or position(actor_id::text || '/' in normalized_path) <> 1
    or normalized_path like '%..%'
    or not exists (
      select 1
      from storage.objects as objects
      where objects.bucket_id = 'kyc-documents'
        and objects.name = normalized_path
    ) then
    raise exception 'KYC document must be uploaded by the current user';
  end if;
  if kyc_metadata is null or jsonb_typeof(kyc_metadata) <> 'object'
    or octet_length(kyc_metadata::text) > 8192 then
    raise exception 'KYC metadata is invalid';
  end if;

  insert into public.kyc_submissions(
    user_id, document_type, storage_path, metadata
  ) values (
    actor_id, trim(kyc_document_type), normalized_path, kyc_metadata
  ) returning id into created_id;

  update public.profiles
  set kyc_status = 'pending'
  where id = actor_id;

  return created_id;
end;
$$;

alter table public.business_products enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.supplier_orders enable row level security;
alter table public.ratings enable row level security;
alter table public.points_ledger enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notifications enable row level security;
alter table public.contact_redirect_logs enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.worker_certificates enable row level security;
alter table public.worker_portfolio enable row level security;

create policy "business_products_read_relevant" on public.business_products
  for select to authenticated
  using (is_active or owner_id = auth.uid() or public.is_active_admin());
create policy "pools_read_relevant" on public.pools
  for select to authenticated
  using (
    status in ('open', 'threshold_met', 'ready')
    or owner_id = auth.uid()
    or supplier_id = auth.uid()
    or public.is_active_admin()
    or exists (
      select 1 from public.pool_members
      where pool_members.pool_id = pools.id and pool_members.member_id = auth.uid()
    )
  );
create policy "pool_members_read_relevant" on public.pool_members
  for select to authenticated
  using (
    member_id = auth.uid()
    or public.is_active_admin()
    or public.can_manage_pool_members(pool_id)
  );
create policy "supplier_orders_read_parties" on public.supplier_orders
  for select to authenticated
  using (buyer_id = auth.uid() or supplier_id = auth.uid() or public.is_active_admin());
create policy "ratings_read_relevant" on public.ratings
  for select to authenticated
  using (rater_id = auth.uid() or rated_profile_id = auth.uid() or public.is_active_admin());
create policy "points_ledger_read_own" on public.points_ledger
  for select to authenticated
  using (profile_id = auth.uid() or public.is_active_admin());
create policy "notification_preferences_read_own" on public.notification_preferences
  for select to authenticated
  using (user_id = auth.uid() or public.is_active_admin());
create policy "notifications_read_own" on public.notifications
  for select to authenticated
  using (user_id = auth.uid() or public.is_active_admin());
create policy "contact_redirect_logs_read_owner" on public.contact_redirect_logs
  for select to authenticated
  using (profile_id = auth.uid() or public.is_active_admin());
create policy "kyc_submissions_read_self_or_admin" on public.kyc_submissions
  for select to authenticated
  using (user_id = auth.uid() or public.is_active_admin());
create policy "payment_transactions_read_parties" on public.payment_transactions
  for select to authenticated
  using (payer_id = auth.uid() or payee_id = auth.uid() or public.is_active_admin());
create policy "worker_certificates_read_relevant" on public.worker_certificates
  for select to authenticated
  using (
    worker_id = auth.uid()
    or public.is_active_admin()
    or exists (
      select 1
      from public.job_applications
      join public.job_postings on job_postings.id = job_applications.job_id
      where job_applications.id = worker_certificates.application_id
        and job_postings.owner_id = auth.uid()
    )
  );
create policy "worker_portfolio_read_relevant" on public.worker_portfolio
  for select to authenticated
  using (
    worker_id = auth.uid()
    or public.is_active_admin()
    or exists (
      select 1
      from public.job_applications
      join public.job_postings on job_postings.id = job_applications.job_id
      where job_applications.id = worker_portfolio.application_id
        and job_postings.owner_id = auth.uid()
    )
  );

-- KYC rows expose storage metadata only to the submitting user or an active admin;
-- no storage-object policy or anonymous document access is created here.
revoke all on table
  public.business_products,
  public.pools,
  public.pool_members,
  public.supplier_orders,
  public.ratings,
  public.points_ledger,
  public.notification_preferences,
  public.notifications,
  public.contact_redirect_logs,
  public.kyc_submissions,
  public.payment_transactions,
  public.worker_certificates,
  public.worker_portfolio
from anon, authenticated;

grant select on table
  public.business_products,
  public.pools,
  public.pool_members,
  public.supplier_orders,
  public.ratings,
  public.points_ledger,
  public.notification_preferences,
  public.notifications,
  public.contact_redirect_logs,
  public.kyc_submissions,
  public.payment_transactions,
  public.worker_certificates,
  public.worker_portfolio
 to authenticated;

grant all on table
  public.business_products,
  public.pools,
  public.pool_members,
  public.supplier_orders,
  public.ratings,
  public.points_ledger,
  public.notification_preferences,
  public.notifications,
  public.contact_redirect_logs,
  public.kyc_submissions,
  public.payment_transactions,
  public.worker_certificates,
  public.worker_portfolio
 to service_role;

revoke update (
  display_name, business_name, headline, delivery_area, phone,
  last_active_at, updated_at
) on public.profiles from authenticated;
drop policy if exists "profiles_update_own_safe_fields" on public.profiles;

revoke all on function public.role_from_auth_metadata(jsonb, jsonb) from public, anon;
revoke all on function public.sync_auth_user_profile() from public, anon;
revoke all on function public.is_active_admin() from public, anon;
revoke all on function public.current_active_role() from public, anon, authenticated, service_role;
revoke all on function public.notification_is_enabled(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.can_manage_pool_members(uuid) from public, anon, authenticated, service_role;
revoke all on function public.set_row_updated_at() from public, anon, authenticated, service_role;
revoke all on function public.initialize_notification_preferences() from public, anon, authenticated, service_role;
revoke all on function public.validate_completed_application_record() from public, anon, authenticated, service_role;
revoke all on function public.create_pool(text, text, text, text, numeric, numeric, timestamptz, text, numeric, numeric, numeric, numeric, numeric, text) from public, anon, authenticated, service_role;
revoke all on function public.join_pool(uuid, numeric) from public, anon, authenticated, service_role;
revoke all on function public.resolve_due_pools() from public, anon, authenticated, service_role;
revoke all on function public.create_full_job_posting(text, text, text, text, numeric, text, integer, date, date, integer, numeric, text, text) from public, anon, authenticated, service_role;
revoke all on function public.set_application_status(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.confirm_job_completion(uuid) from public, anon, authenticated, service_role;
revoke all on function public.submit_transaction_rating(text, uuid, integer, text) from public, anon, authenticated, service_role;
revoke all on function public.upsert_business_profile(text, text, text, text, text, text, numeric, numeric, text, text, text, text, boolean) from public, anon, authenticated, service_role;
revoke all on function public.upsert_business_product(text, text, text, numeric, text, text, boolean, uuid) from public, anon, authenticated, service_role;
revoke all on function public.create_supplier_offer(text, text, numeric) from public, anon, authenticated, service_role;
revoke all on function public.upsert_supplier_product(text, text, numeric, numeric, numeric, text, text, text, uuid) from public, anon, authenticated, service_role;
revoke all on function public.submit_supplier_offer_against_pool(uuid, numeric, numeric, numeric, text) from public, anon, authenticated, service_role;
revoke all on function public.create_supplier_order(uuid, uuid, numeric) from public, anon, authenticated, service_role;
revoke all on function public.set_supplier_order_status(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.get_supplier_demands() from public, anon, authenticated, service_role;
revoke all on function public.get_supplier_workspace() from public, anon, authenticated, service_role;
revoke all on function public.get_public_umkm_profile(text) from public, anon, authenticated, service_role;
revoke all on function public.record_public_profile_view(text) from public, anon, authenticated, service_role;
revoke all on function public.record_contact_redirect(text, text) from public, anon, authenticated, service_role;
revoke all on function public.get_my_notifications(integer, timestamptz) from public, anon, authenticated, service_role;
revoke all on function public.mark_notification_read(uuid) from public, anon, authenticated, service_role;
revoke all on function public.set_notification_preferences(boolean, boolean, boolean, boolean, boolean) from public, anon, authenticated, service_role;
revoke all on function public.submit_kyc_record(text, text, jsonb) from public, anon, authenticated, service_role;

grant execute on function public.can_manage_pool_members(uuid) to authenticated;
grant execute on function public.create_pool(text, text, text, text, numeric, numeric, timestamptz, text, numeric, numeric, numeric, numeric, numeric, text) to authenticated;
grant execute on function public.join_pool(uuid, numeric) to authenticated;
grant execute on function public.resolve_due_pools() to authenticated;
grant execute on function public.create_full_job_posting(text, text, text, text, numeric, text, integer, date, date, integer, numeric, text, text) to authenticated;
grant execute on function public.set_application_status(uuid, text) to authenticated;
grant execute on function public.confirm_job_completion(uuid) to authenticated;
grant execute on function public.submit_transaction_rating(text, uuid, integer, text) to authenticated;
grant execute on function public.upsert_business_profile(text, text, text, text, text, text, numeric, numeric, text, text, text, text, boolean) to authenticated;
grant execute on function public.upsert_business_product(text, text, text, numeric, text, text, boolean, uuid) to authenticated;
grant execute on function public.upsert_supplier_product(text, text, numeric, numeric, numeric, text, text, text, uuid) to authenticated;
grant execute on function public.submit_supplier_offer_against_pool(uuid, numeric, numeric, numeric, text) to authenticated;
grant execute on function public.create_supplier_order(uuid, uuid, numeric) to authenticated;
grant execute on function public.set_supplier_order_status(uuid, text) to authenticated;
grant execute on function public.get_supplier_demands() to authenticated;
grant execute on function public.get_supplier_workspace() to authenticated;
grant execute on function public.get_my_notifications(integer, timestamptz) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.set_notification_preferences(boolean, boolean, boolean, boolean, boolean) to authenticated;
grant execute on function public.submit_kyc_record(text, text, jsonb) to authenticated;
grant execute on function public.get_public_umkm_profile(text) to anon, authenticated;
grant execute on function public.record_public_profile_view(text) to anon, authenticated;
grant execute on function public.record_contact_redirect(text, text) to anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists business_products_set_updated_at on public.business_products;
create trigger business_products_set_updated_at before update on public.business_products
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists pools_set_updated_at on public.pools;
create trigger pools_set_updated_at before update on public.pools
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists pool_members_set_updated_at on public.pool_members;
create trigger pool_members_set_updated_at before update on public.pool_members
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists job_postings_set_updated_at on public.job_postings;
create trigger job_postings_set_updated_at before update on public.job_postings
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists job_applications_set_updated_at on public.job_applications;
create trigger job_applications_set_updated_at before update on public.job_applications
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists supplier_offers_set_updated_at on public.supplier_offers;
create trigger supplier_offers_set_updated_at before update on public.supplier_offers
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists supplier_orders_set_updated_at on public.supplier_orders;
create trigger supplier_orders_set_updated_at before update on public.supplier_orders
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at before update on public.notification_preferences
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists kyc_submissions_set_updated_at on public.kyc_submissions;
create trigger kyc_submissions_set_updated_at before update on public.kyc_submissions
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists payment_transactions_set_updated_at on public.payment_transactions;
create trigger payment_transactions_set_updated_at before update on public.payment_transactions
  for each row execute procedure public.set_row_updated_at();
drop trigger if exists profiles_initialize_notification_preferences on public.profiles;
create trigger profiles_initialize_notification_preferences
  after insert on public.profiles
  for each row execute procedure public.initialize_notification_preferences();
drop trigger if exists worker_certificates_validate_application on public.worker_certificates;
create trigger worker_certificates_validate_application
  before insert or update on public.worker_certificates
  for each row execute procedure public.validate_completed_application_record();
drop trigger if exists worker_portfolio_validate_application on public.worker_portfolio;
create trigger worker_portfolio_validate_application
  before insert or update on public.worker_portfolio
  for each row execute procedure public.validate_completed_application_record();

do $$
begin
  if exists (
    select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime'
  ) then
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pools'
    ) then
      execute 'alter publication supabase_realtime add table public.pools';
    end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'pool_members'
    ) then
      execute 'alter publication supabase_realtime add table public.pool_members';
    end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'supplier_orders'
    ) then
      execute 'alter publication supabase_realtime add table public.supplier_orders';
    end if;
    if not exists (
      select 1 from pg_catalog.pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
    ) then
      execute 'alter publication supabase_realtime add table public.notifications';
    end if;
  end if;
end
$$;

commit;
