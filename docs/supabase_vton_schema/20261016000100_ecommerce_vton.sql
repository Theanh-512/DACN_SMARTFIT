-- Supabase PostgreSQL schema: Fashion e-commerce + AI Virtual Try-On
-- Run once in a fresh Supabase project using the SQL Editor or `supabase db push`.
-- Assumptions: Supabase Auth/Storage are enabled; clients use publishable/anon key + user JWT.
-- Never put Supabase secret/service_role keys in frontend code.

begin;

-- Supabase PostgreSQL provides pg_catalog.gen_random_uuid() on supported versions.

-- -----------------------------------------------------------------------------
-- 1. Helper functions and profiles linked to Supabase Auth
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 160),
  phone text check (phone is null or char_length(phone) <= 32),
  avatar_path text,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'full_name'), ''),
             nullif(pg_catalog.split_part(coalesce(new.email, ''), '@', 1), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'staff')),
  created_at timestamptz not null default pg_catalog.now(),
  primary key (user_id, role)
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = (select auth.uid()) and ur.role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Catalogue
-- -----------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(pg_catalog.btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);

create table public.products (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  category_id uuid references public.categories(id) on delete restrict,
  name text not null check (char_length(pg_catalog.btrim(name)) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  brand text check (brand is null or char_length(brand) <= 120),
  description text,
  base_price numeric(12,2) not null check (base_price >= 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create table public.product_variants (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  sku text not null check (char_length(pg_catalog.btrim(sku)) between 1 and 80),
  size text not null check (char_length(pg_catalog.btrim(size)) between 1 and 24),
  color text not null check (char_length(pg_catalog.btrim(color)) between 1 and 60),
  price_override numeric(12,2) check (price_override is null or price_override >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= stock_quantity),
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint product_variant_id_product_unique unique (id, product_id)
);

create unique index product_variants_sku_ci_unique
  on public.product_variants (pg_catalog.upper(pg_catalog.btrim(sku)));
create unique index product_variants_size_color_ci_unique
  on public.product_variants (product_id, pg_catalog.lower(pg_catalog.btrim(size)), pg_catalog.lower(pg_catalog.btrim(color)));

create table public.product_images (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid,
  storage_path text not null unique,
  image_type text not null check (image_type in ('main', 'gallery', 'variant', 'tryon_garment')),
  alt_text text check (alt_text is null or char_length(alt_text) <= 300),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default pg_catalog.now(),
  constraint product_image_variant_belongs_to_product
    foreign key (variant_id, product_id)
    references public.product_variants(id, product_id) on delete cascade
);

create unique index product_images_one_main_per_product
  on public.product_images(product_id)
  where image_type = 'main' and variant_id is null;
create index product_images_product_sort_idx on public.product_images(product_id, sort_order);
create index product_images_variant_idx on public.product_images(variant_id) where variant_id is not null;

-- Server-controlled shipping configuration. Seeded default is an example for a student project.
create table public.store_settings (
  id smallint primary key default 1 check (id = 1),
  default_shipping_fee numeric(12,2) not null default 30000 check (default_shipping_fee >= 0),
  updated_at timestamptz not null default pg_catalog.now()
);
insert into public.store_settings (id, default_shipping_fee)
values (1, 30000)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 3. Addresses, cart and wishlist
-- -----------------------------------------------------------------------------
create table public.user_addresses (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null check (char_length(pg_catalog.btrim(recipient_name)) between 1 and 160),
  phone text not null check (char_length(pg_catalog.btrim(phone)) between 5 and 32),
  address_line text not null check (char_length(pg_catalog.btrim(address_line)) between 1 and 300),
  ward text check (ward is null or char_length(ward) <= 120),
  district text check (district is null or char_length(district) <= 120),
  province text not null check (char_length(pg_catalog.btrim(province)) between 1 and 120),
  postal_code text check (postal_code is null or char_length(postal_code) <= 24),
  country_code char(2) not null default 'VN' check (country_code = 'VN'),
  is_default boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);
create index user_addresses_user_idx on public.user_addresses(user_id);
create unique index user_addresses_one_default_per_user
  on public.user_addresses(user_id) where is_default;

create table public.cart_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity between 1 and 50),
  added_at timestamptz not null default pg_catalog.now(),
  unique (user_id, product_variant_id)
);
create index cart_items_user_idx on public.cart_items(user_id);

create table public.wishlists (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  added_at timestamptz not null default pg_catalog.now(),
  unique (user_id, product_id)
);
create index wishlists_user_idx on public.wishlists(user_id);

-- -----------------------------------------------------------------------------
-- 4. Orders, order lines, payments and payment webhook idempotency
-- -----------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  order_number bigint generated always as identity unique,
  user_id uuid not null references auth.users(id) on delete restrict,
  shipping_address_id uuid references public.user_addresses(id) on delete set null,
  recipient_name text not null,
  shipping_phone text not null,
  shipping_address_line text not null,
  shipping_ward text,
  shipping_district text,
  shipping_province text not null,
  shipping_postal_code text,
  shipping_country_code char(2) not null default 'VN' check (shipping_country_code = 'VN'),
  subtotal_amount numeric(12,2) not null default 0 check (subtotal_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0 and discount_amount <= subtotal_amount),
  shipping_fee numeric(12,2) not null default 0 check (shipping_fee >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  status text not null check (status in (
    'pending_payment', 'confirmed', 'processing', 'shipped', 'delivered',
    'cancelled', 'expired', 'return_requested', 'returned'
  )),
  reservation_expires_at timestamptz,
  idempotency_key uuid not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint orders_user_idempotency_unique unique (user_id, idempotency_key),
  constraint orders_total_consistency check (total_amount = subtotal_amount - discount_amount + shipping_fee)
);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_status_reservation_idx on public.orders(status, reservation_expires_at)
  where status = 'pending_payment';

create table public.order_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  size_snapshot text not null,
  color_snapshot text not null,
  quantity integer not null check (quantity between 1 and 100),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total = unit_price * quantity),
  created_at timestamptz not null default pg_catalog.now(),
  unique (order_id, product_variant_id)
);
create index order_items_order_idx on public.order_items(order_id);
create index order_items_variant_idx on public.order_items(product_variant_id);

create table public.payments (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null check (provider in ('cod', 'vnpay', 'momo')),
  status text not null default 'pending' check (status in (
    'pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'partially_refunded'
  )),
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'VND' check (currency = 'VND'),
  provider_order_ref text,
  provider_transaction_id text,
  idempotency_key uuid not null default pg_catalog.gen_random_uuid() unique,
  paid_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint payments_cod_no_gateway_transaction check (provider <> 'cod' or provider_transaction_id is null)
);
create index payments_order_idx on public.payments(order_id, created_at desc);
create unique index payments_provider_order_ref_unique
  on public.payments(provider, provider_order_ref) where provider_order_ref is not null;
create unique index payments_provider_transaction_unique
  on public.payments(provider, provider_transaction_id) where provider_transaction_id is not null;

create table public.payment_events (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  payment_id uuid references public.payments(id) on delete set null,
  provider text not null check (provider in ('vnpay', 'momo')),
  provider_event_id text not null check (char_length(provider_event_id) between 1 and 240),
  event_type text not null check (event_type in ('payment_succeeded', 'payment_failed')),
  payload_sha256 text check (payload_sha256 is null or payload_sha256 ~ '^[0-9a-fA-F]{64}$'),
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'manual_review')),
  received_at timestamptz not null default pg_catalog.now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);
create index payment_events_order_idx on public.payment_events(order_id, received_at desc);

-- Audit trail: stock_delta affects physical stock; reserved_delta affects held units.
create table public.inventory_movements (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  order_id uuid references public.orders(id) on delete restrict,
  movement_type text not null check (movement_type in ('reserve', 'release', 'sale', 'restock', 'adjustment')),
  stock_delta integer not null default 0,
  reserved_delta integer not null default 0,
  reason text not null check (char_length(pg_catalog.btrim(reason)) between 1 and 300),
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  check (stock_delta <> 0 or reserved_delta <> 0)
);
create index inventory_movements_variant_created_idx
  on public.inventory_movements(product_variant_id, created_at desc);
create index inventory_movements_order_idx on public.inventory_movements(order_id) where order_id is not null;

-- -----------------------------------------------------------------------------
-- 5. Verified reviews and AI try-on jobs
-- -----------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_item_id uuid not null unique references public.order_items(id) on delete restrict,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 3000),
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);
create index reviews_product_created_idx on public.reviews(product_id, created_at desc);
create index reviews_user_idx on public.reviews(user_id);

create table public.try_on_jobs (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id) on delete restrict,
  input_image_path text not null,
  garment_image_path text not null,
  output_image_path text,
  status text not null default 'queued' check (status in ('queued', 'processing', 'succeeded', 'failed', 'cancelled')),
  model_name text not null default 'IDM-VTON' check (char_length(model_name) <= 120),
  model_version text check (model_version is null or char_length(model_version) <= 120),
  error_code text check (error_code is null or char_length(error_code) <= 120),
  created_at timestamptz not null default pg_catalog.now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default pg_catalog.now(),
  check ((status <> 'succeeded') or output_image_path is not null),
  check ((status not in ('queued', 'processing')) or completed_at is null),
  constraint try_on_input_path_owner check (pg_catalog.split_part(input_image_path, '/', 1) = user_id::text),
  constraint try_on_output_path_owner check (output_image_path is null or pg_catalog.split_part(output_image_path, '/', 1) = user_id::text)
);
create index try_on_jobs_user_created_idx on public.try_on_jobs(user_id, created_at desc);
create index try_on_jobs_queue_idx on public.try_on_jobs(created_at) where status = 'queued';

-- -----------------------------------------------------------------------------
-- 6. Updated-at triggers
-- -----------------------------------------------------------------------------
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();
create trigger user_addresses_set_updated_at before update on public.user_addresses
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function public.set_updated_at();
create trigger reviews_set_updated_at before update on public.reviews
for each row execute function public.set_updated_at();
create trigger try_on_jobs_set_updated_at before update on public.try_on_jobs
for each row execute function public.set_updated_at();
create trigger store_settings_set_updated_at before update on public.store_settings
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. Internal reservation helper; called only inside trusted SECURITY DEFINER RPCs
-- -----------------------------------------------------------------------------
create or replace function public._release_order_reservations(
  p_order_id uuid,
  p_reason text,
  p_actor_user_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item record;
begin
  for v_item in
    select oi.product_variant_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
    order by oi.product_variant_id
  loop
    update public.product_variants pv
    set reserved_quantity = pv.reserved_quantity - v_item.quantity
    where pv.id = v_item.product_variant_id
      and pv.reserved_quantity >= v_item.quantity;

    if not found then
      raise exception 'Reservation ledger mismatch for variant %', v_item.product_variant_id;
    end if;

    insert into public.inventory_movements (
      product_variant_id, order_id, movement_type, stock_delta, reserved_delta, reason, actor_user_id
    ) values (
      v_item.product_variant_id, p_order_id, 'release', 0, -v_item.quantity, p_reason, p_actor_user_id
    );
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- 8. RPC: atomically create order + reserve stock + snapshot price/address
-- -----------------------------------------------------------------------------
create or replace function public.create_order(
  p_items jsonb,
  p_address_id uuid,
  p_provider text,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_existing public.orders%rowtype;
  v_address public.user_addresses%rowtype;
  v_order_id uuid := pg_catalog.gen_random_uuid();
  v_payment_id uuid := pg_catalog.gen_random_uuid();
  v_item record;
  v_variant record;
  v_qty integer;
  v_unit_price numeric(12,2);
  v_subtotal numeric(12,2) := 0;
  v_shipping_fee numeric(12,2);
  v_total numeric(12,2);
  v_expiry timestamptz;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_idempotency_key is null then raise exception 'Idempotency key is required'; end if;
  if p_provider not in ('cod', 'vnpay', 'momo') then raise exception 'Unsupported payment provider'; end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be a JSON array';
  end if;
  if pg_catalog.jsonb_array_length(p_items) < 1 or pg_catalog.jsonb_array_length(p_items) > 50 then
    raise exception 'Order must contain between 1 and 50 line items';
  end if;
  if exists (
    select 1 from pg_catalog.jsonb_array_elements(p_items) e(value)
    where pg_catalog.jsonb_typeof(e.value) <> 'object'
       or coalesce(e.value ->> 'variant_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
       or coalesce(e.value ->> 'quantity', '') !~ '^[1-9][0-9]{0,2}$'
  ) then
    raise exception 'Each item needs a valid variant_id UUID and integer quantity';
  end if;
  if exists (
    select 1 from pg_catalog.jsonb_array_elements(p_items) e(value)
    where (e.value ->> 'quantity')::integer not between 1 and 50
  ) then
    raise exception 'Each item quantity must be between 1 and 50';
  end if;

  -- Serializes concurrent retries with the same user's idempotency key.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_uid::text || ':' || p_idempotency_key::text, 0)
  );
  select * into v_existing from public.orders
    where user_id = v_uid and idempotency_key = p_idempotency_key;
  if found then
    return pg_catalog.jsonb_build_object(
      'order_id', v_existing.id, 'order_number', v_existing.order_number,
      'payment_id', (select p.id from public.payments p where p.order_id = v_existing.id order by p.created_at desc limit 1),
      'provider_order_ref', (select p.provider_order_ref from public.payments p where p.order_id = v_existing.id order by p.created_at desc limit 1),
      'reservation_expires_at', v_existing.reservation_expires_at,
      'status', v_existing.status, 'total_amount', v_existing.total_amount,
      'currency', v_existing.currency, 'idempotent_replay', true
    );
  end if;

  select * into v_address from public.user_addresses
   where id = p_address_id and user_id = v_uid;
  if not found then raise exception 'Shipping address not found for current user'; end if;

  select default_shipping_fee into v_shipping_fee from public.store_settings where id = 1;
  if not found then raise exception 'Shipping fee configuration is missing'; end if;
  v_expiry := case when p_provider = 'cod' then null else pg_catalog.now() + interval '15 minutes' end;

  insert into public.orders (
    id, user_id, shipping_address_id, recipient_name, shipping_phone,
    shipping_address_line, shipping_ward, shipping_district, shipping_province,
    shipping_postal_code, shipping_country_code, subtotal_amount, discount_amount,
    shipping_fee, total_amount, currency, status, reservation_expires_at, idempotency_key
  ) values (
    v_order_id, v_uid, v_address.id, v_address.recipient_name, v_address.phone,
    v_address.address_line, v_address.ward, v_address.district, v_address.province,
    v_address.postal_code, v_address.country_code, 0, 0,
    v_shipping_fee, v_shipping_fee, 'VND',
    case when p_provider = 'cod' then 'confirmed' else 'pending_payment' end,
    v_expiry, p_idempotency_key
  );

  -- Process variants in deterministic order to reduce deadlock risk; each row is locked.
  for v_item in
    select (e.value ->> 'variant_id')::uuid as variant_id,
           sum((e.value ->> 'quantity')::integer)::integer as quantity
    from pg_catalog.jsonb_array_elements(p_items) e(value)
    group by (e.value ->> 'variant_id')::uuid
    order by (e.value ->> 'variant_id')::uuid
  loop
    if v_item.quantity > 100 then raise exception 'Combined quantity for a variant exceeds 100'; end if;

    select pv.id, pv.product_id, pv.sku, pv.size, pv.color, pv.price_override,
           pv.stock_quantity, pv.reserved_quantity, pv.is_active,
           p.name as product_name, p.base_price, p.status as product_status
      into v_variant
      from public.product_variants pv
      join public.products p on p.id = pv.product_id
     where pv.id = v_item.variant_id
     for update of pv, p;
    if not found then raise exception 'Product variant % not found', v_item.variant_id; end if;
    if not v_variant.is_active or v_variant.product_status <> 'active' then
      raise exception 'Product variant % is not available', v_item.variant_id;
    end if;
    if v_variant.stock_quantity - v_variant.reserved_quantity < v_item.quantity then
      raise exception 'Insufficient available stock for variant %', v_item.variant_id;
    end if;

    v_unit_price := coalesce(v_variant.price_override, v_variant.base_price);
    update public.product_variants
       set reserved_quantity = reserved_quantity + v_item.quantity
     where id = v_item.variant_id;

    insert into public.order_items (
      order_id, product_variant_id, product_name_snapshot, sku_snapshot,
      size_snapshot, color_snapshot, quantity, unit_price, line_total
    ) values (
      v_order_id, v_variant.id, v_variant.product_name, v_variant.sku,
      v_variant.size, v_variant.color, v_item.quantity, v_unit_price,
      v_unit_price * v_item.quantity
    );

    insert into public.inventory_movements (
      product_variant_id, order_id, movement_type, stock_delta, reserved_delta, reason, actor_user_id
    ) values (
      v_variant.id, v_order_id, 'reserve', 0, v_item.quantity, 'Order stock reservation', v_uid
    );
    v_subtotal := v_subtotal + (v_unit_price * v_item.quantity);
  end loop;

  v_total := v_subtotal + v_shipping_fee;
  update public.orders
     set subtotal_amount = v_subtotal, total_amount = v_total
   where id = v_order_id;

  insert into public.payments (
    id, order_id, provider, status, amount, currency, provider_order_ref
  ) values (
    v_payment_id, v_order_id, p_provider, 'pending', v_total, 'VND',
    case when p_provider = 'cod' then null else v_payment_id::text end
  );

  return pg_catalog.jsonb_build_object(
    'order_id', v_order_id, 'order_number', (select o.order_number from public.orders o where o.id = v_order_id),
    'payment_id', v_payment_id, 'provider_order_ref', case when p_provider = 'cod' then null else v_payment_id::text end,
    'status', case when p_provider = 'cod' then 'confirmed' else 'pending_payment' end,
    'total_amount', v_total, 'currency', 'VND',
    'reservation_expires_at', v_expiry, 'idempotent_replay', false
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 9. RPC: customer cancellation; releases reserved stock exactly once
-- -----------------------------------------------------------------------------
create or replace function public.cancel_order(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_order public.orders%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select * into v_order from public.orders
   where id = p_order_id and user_id = v_uid for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status not in ('pending_payment', 'confirmed') then
    raise exception 'This order can no longer be cancelled by the customer';
  end if;

  update public.orders set status = 'cancelled', reservation_expires_at = null
   where id = p_order_id;
  perform public._release_order_reservations(p_order_id, 'Customer cancelled order', v_uid);
  update public.payments set status = 'cancelled'
   where order_id = p_order_id and status in ('pending', 'processing');
  return 'cancelled';
end;
$$;

-- -----------------------------------------------------------------------------
-- 10. Trusted server RPC: expire pending online orders and release held stock
-- Call from a scheduler (Supabase Cron/pg_cron if enabled) or trusted backend.
-- -----------------------------------------------------------------------------
create or replace function public.expire_order_reservations(p_batch_size integer default 200)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order record;
  v_count integer := 0;
begin
  if p_batch_size < 1 or p_batch_size > 2000 then raise exception 'Invalid batch size'; end if;
  for v_order in
    select o.id
      from public.orders o
     where o.status = 'pending_payment'
       and o.reservation_expires_at is not null
       and o.reservation_expires_at <= pg_catalog.now()
     order by o.reservation_expires_at
     for update skip locked
     limit p_batch_size
  loop
    update public.orders set status = 'expired', reservation_expires_at = null
     where id = v_order.id and status = 'pending_payment';
    if found then
      perform public._release_order_reservations(v_order.id, 'Payment reservation expired', null);
      update public.payments set status = 'cancelled'
       where order_id = v_order.id and status in ('pending', 'processing');
      v_count := v_count + 1;
    end if;
  end loop;
  return v_count;
end;
$$;

-- -----------------------------------------------------------------------------
-- 11. Trusted server RPC: create/retry an online payment attempt
-- The backend should send the returned provider_order_ref to VNPay/MoMo.
-- -----------------------------------------------------------------------------
create or replace function public.create_payment_attempt(
  p_order_id uuid,
  p_provider text,
  p_idempotency_key uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_existing public.payments%rowtype;
  v_payment_id uuid := pg_catalog.gen_random_uuid();
begin
  if p_provider not in ('vnpay', 'momo') then raise exception 'Online provider must be vnpay or momo'; end if;
  if p_idempotency_key is null then raise exception 'Idempotency key is required'; end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_order_id::text || ':' || p_idempotency_key::text, 0)
  );
  select * into v_existing from public.payments where idempotency_key = p_idempotency_key;
  if found then
    if v_existing.order_id <> p_order_id or v_existing.provider <> p_provider then
      raise exception 'Idempotency key was already used for a different payment attempt';
    end if;
    return pg_catalog.jsonb_build_object(
      'payment_id', v_existing.id, 'provider_order_ref', v_existing.provider_order_ref,
      'status', v_existing.status, 'amount', v_existing.amount,
      'currency', v_existing.currency, 'idempotent_replay', true
    );
  end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status <> 'pending_payment'
     or v_order.reservation_expires_at is null
     or v_order.reservation_expires_at <= pg_catalog.now() then
    raise exception 'Order is not eligible for a new payment attempt';
  end if;

  -- Any older attempt is closed. A late success from it is recorded as manual review by the webhook RPC.
  update public.payments set status = 'cancelled'
   where order_id = p_order_id and provider in ('vnpay', 'momo')
     and status in ('pending', 'processing');

  insert into public.payments (
    id, order_id, provider, status, amount, currency, provider_order_ref, idempotency_key
  ) values (
    v_payment_id, p_order_id, p_provider, 'pending', v_order.total_amount, v_order.currency,
    v_payment_id::text, p_idempotency_key
  );
  return pg_catalog.jsonb_build_object(
    'payment_id', v_payment_id, 'provider_order_ref', v_payment_id::text,
    'status', 'pending', 'amount', v_order.total_amount,
    'currency', v_order.currency, 'idempotent_replay', false
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 12. Trusted server RPC: verify a payment event after provider signature checks
-- IMPORTANT: call only after FastAPI verifies VNPay/MoMo signature and merchant/order.
-- This SQL function does not verify cryptographic provider signatures itself.
-- -----------------------------------------------------------------------------
create or replace function public.process_payment_webhook(
  p_order_id uuid,
  p_provider text,
  p_provider_order_ref text,
  p_provider_event_id text,
  p_provider_transaction_id text,
  p_amount numeric,
  p_currency text,
  p_success boolean,
  p_payload_sha256 text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id uuid;
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
begin
  if p_provider not in ('vnpay', 'momo') then raise exception 'Unsupported online provider'; end if;
  if p_provider_order_ref is null or pg_catalog.length(p_provider_order_ref) = 0 then
    raise exception 'Provider order reference is required';
  end if;
  if p_provider_event_id is null or pg_catalog.length(p_provider_event_id) = 0 then
    raise exception 'Provider event ID is required';
  end if;
  if p_success and (p_provider_transaction_id is null or pg_catalog.length(p_provider_transaction_id) = 0) then
    raise exception 'Successful payment requires a transaction ID';
  end if;
  if p_amount is null or p_amount < 0 or p_currency <> 'VND' then
    raise exception 'Invalid payment amount/currency';
  end if;

  insert into public.payment_events (
    order_id, provider, provider_event_id, event_type, payload_sha256, processing_status
  ) values (
    p_order_id, p_provider, p_provider_event_id,
    case when p_success then 'payment_succeeded' else 'payment_failed' end,
    p_payload_sha256, 'received'
  )
  on conflict (provider, provider_event_id) do nothing
  returning id into v_event_id;
  if v_event_id is null then return 'duplicate_event'; end if;

  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'manual_review_order_not_found';
  end if;

  select * into v_payment from public.payments
   where order_id = p_order_id and provider = p_provider
     and provider_order_ref = p_provider_order_ref
   limit 1 for update;
  if not found then
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'manual_review_payment_not_found';
  end if;
  update public.payment_events set payment_id = v_payment.id where id = v_event_id;

  if p_amount <> v_order.total_amount or p_amount <> v_payment.amount or p_currency <> v_order.currency then
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'manual_review_amount_mismatch';
  end if;

  if not p_success then
    if v_payment.status in ('pending', 'processing') then
      update public.payments set status = 'failed' where id = v_payment.id;
    end if;
    update public.payment_events set processing_status = 'processed', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'payment_failed';
  end if;

  if v_payment.status = 'succeeded' then
    if v_payment.provider_transaction_id = p_provider_transaction_id then
      update public.payment_events set processing_status = 'processed', processed_at = pg_catalog.now()
       where id = v_event_id;
      return 'already_succeeded';
    else
      update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
       where id = v_event_id;
      return 'manual_review_conflicting_transaction';
    end if;
  end if;

  if v_payment.status not in ('pending', 'processing') then
    if exists (
      select 1 from public.payments p
       where p.provider = p_provider
         and p.provider_transaction_id = p_provider_transaction_id
         and p.id <> v_payment.id
    ) then
      update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
       where id = v_event_id;
      return 'manual_review_transaction_reused';
    end if;
    update public.payments set status = 'succeeded', provider_transaction_id = p_provider_transaction_id,
      paid_at = pg_catalog.now() where id = v_payment.id;
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'payment_received_for_inactive_attempt_manual_review';
  end if;

  if exists (
    select 1 from public.payments p
     where p.provider = p_provider
       and p.provider_transaction_id = p_provider_transaction_id
       and p.id <> v_payment.id
  ) then
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'manual_review_transaction_reused';
  end if;

  update public.payments
     set status = 'succeeded', provider_transaction_id = p_provider_transaction_id,
         paid_at = pg_catalog.now()
   where id = v_payment.id;

  if v_order.status = 'pending_payment'
     and v_order.reservation_expires_at is not null
     and v_order.reservation_expires_at > pg_catalog.now() then
    update public.orders set status = 'confirmed', reservation_expires_at = null
     where id = p_order_id;
    update public.payment_events set processing_status = 'processed', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'payment_confirmed';
  elsif v_order.status = 'pending_payment' then
    update public.orders set status = 'expired', reservation_expires_at = null
     where id = p_order_id;
    perform public._release_order_reservations(p_order_id, 'Late payment after reservation expiry', null);
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'late_payment_manual_refund_review';
  elsif v_order.status in ('expired', 'cancelled') then
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'paid_after_order_closed_manual_review';
  else
    update public.payment_events set processing_status = 'manual_review', processed_at = pg_catalog.now()
     where id = v_event_id;
    return 'manual_review_unexpected_order_state';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- 13. Trusted server RPC: consume reserved stock exactly once on fulfillment
-- -----------------------------------------------------------------------------
create or replace function public.fulfill_order(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status <> 'confirmed' then raise exception 'Only confirmed orders can be fulfilled'; end if;

  update public.orders set status = 'processing' where id = p_order_id;
  for v_item in
    select oi.product_variant_id, oi.quantity
      from public.order_items oi where oi.order_id = p_order_id
     order by oi.product_variant_id
  loop
    update public.product_variants
       set stock_quantity = stock_quantity - v_item.quantity,
           reserved_quantity = reserved_quantity - v_item.quantity
     where id = v_item.product_variant_id
       and stock_quantity >= v_item.quantity
       and reserved_quantity >= v_item.quantity;
    if not found then raise exception 'Stock reservation mismatch for order %', p_order_id; end if;
    insert into public.inventory_movements (
      product_variant_id, order_id, movement_type, stock_delta, reserved_delta, reason, actor_user_id
    ) values (
      v_item.product_variant_id, p_order_id, 'sale', -v_item.quantity, -v_item.quantity,
      'Order fulfillment', null
    );
  end loop;
  return 'processing';
end;
$$;

-- -----------------------------------------------------------------------------
-- 14. Trusted server RPC: adjust physical inventory with an audit record
-- Clients/admin browser sessions cannot write stock_quantity or reserved_quantity directly.
-- -----------------------------------------------------------------------------
create or replace function public.adjust_inventory(
  p_product_variant_id uuid,
  p_stock_delta integer,
  p_reason text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_variant public.product_variants%rowtype;
begin
  if p_stock_delta is null or p_stock_delta = 0 or p_stock_delta < -10000 or p_stock_delta > 10000 then
    raise exception 'Stock adjustment must be between -10000 and 10000 and not zero';
  end if;
  if p_reason is null or pg_catalog.length(pg_catalog.btrim(p_reason)) < 3 or pg_catalog.length(p_reason) > 300 then
    raise exception 'A reason between 3 and 300 characters is required';
  end if;

  select * into v_variant from public.product_variants
   where id = p_product_variant_id for update;
  if not found then raise exception 'Product variant not found'; end if;
  if v_variant.stock_quantity + p_stock_delta < v_variant.reserved_quantity then
    raise exception 'Adjustment cannot reduce stock below the currently reserved quantity';
  end if;

  update public.product_variants
     set stock_quantity = stock_quantity + p_stock_delta
   where id = p_product_variant_id;
  insert into public.inventory_movements (
    product_variant_id, movement_type, stock_delta, reserved_delta, reason, actor_user_id
  ) values (
    p_product_variant_id,
    case when p_stock_delta > 0 then 'restock' else 'adjustment' end,
    p_stock_delta, 0, p_reason, null
  );
  return v_variant.stock_quantity + p_stock_delta;
end;
$$;

-- -----------------------------------------------------------------------------
-- 15. Trusted server RPC: record COD cash collection after delivery
-- -----------------------------------------------------------------------------
create or replace function public.record_cod_collection(p_order_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_payment public.payments%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status <> 'delivered' then raise exception 'COD can be collected only after delivery'; end if;
  select * into v_payment from public.payments
   where order_id = p_order_id and provider = 'cod'
   order by created_at desc limit 1 for update;
  if not found then raise exception 'COD payment record not found'; end if;
  if v_payment.status = 'succeeded' then return 'already_collected'; end if;
  if v_payment.status <> 'pending' then raise exception 'COD payment is not collectible'; end if;
  update public.payments set status = 'succeeded', paid_at = pg_catalog.now()
   where id = v_payment.id;
  return 'collected';
end;
$$;

-- -----------------------------------------------------------------------------
-- 16. RPC: create private AI try-on job from a user's uploaded input image
-- User uploads first to try-on-inputs/{auth.uid()}/{random-file}.jpg.
-- Backend worker updates status/output using server-only credentials.
-- -----------------------------------------------------------------------------
create or replace function public.create_try_on_job(
  p_product_variant_id uuid,
  p_input_image_path text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_garment_path text;
  v_job_id uuid := pg_catalog.gen_random_uuid();
begin
  if v_uid is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_input_image_path is null or pg_catalog.split_part(p_input_image_path, '/', 1) <> v_uid::text then
    raise exception 'Input image path must belong to current user';
  end if;
  if not exists (
    select 1 from storage.objects so
     where so.bucket_id = 'try-on-inputs' and so.name = p_input_image_path
  ) then
    raise exception 'Input image was not found in private Storage';
  end if;

  select pi.storage_path into v_garment_path
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    join public.product_images pi on pi.product_id = p.id
      and (pi.variant_id = pv.id or pi.variant_id is null)
   where pv.id = p_product_variant_id
     and pv.is_active = true and p.status = 'active'
     and pi.image_type in ('tryon_garment', 'variant', 'main')
   order by case when pi.variant_id = pv.id then 0 else 1 end,
            case pi.image_type when 'tryon_garment' then 0 when 'variant' then 1 else 2 end,
            pi.sort_order
   limit 1;
  if v_garment_path is null then raise exception 'No garment image is configured for this variant'; end if;

  insert into public.try_on_jobs (
    id, user_id, product_variant_id, input_image_path, garment_image_path, status
  ) values (
    v_job_id, v_uid, p_product_variant_id, p_input_image_path, v_garment_path, 'queued'
  );
  return v_job_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 17. RLS: enable on every public table
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.store_settings enable row level security;
alter table public.user_addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.reviews enable row level security;
alter table public.try_on_jobs enable row level security;

-- Drop named policies first to make this policy section re-runnable.
drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_select_self_or_admin on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and (avatar_path is null or pg_catalog.split_part(avatar_path, '/', 1) = id::text));
-- user_roles and store_settings deliberately have no client-facing policies.

create policy categories_public_read on public.categories
  for select to anon, authenticated using (is_active or (select public.is_admin()));
create policy categories_admin_write on public.categories
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy products_public_read on public.products
  for select to anon, authenticated using (status = 'active' or (select public.is_admin()));
create policy products_admin_write on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy variants_public_read on public.product_variants
  for select to anon, authenticated using (
    (is_active and exists (select 1 from public.products p where p.id = product_id and p.status = 'active'))
    or (select public.is_admin())
  );
create policy variants_admin_write on public.product_variants
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy product_images_public_read on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'active')
    or (select public.is_admin())
  );
create policy product_images_admin_write on public.product_images
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

create policy addresses_select_own on public.user_addresses
  for select to authenticated using (user_id = (select auth.uid()));
create policy addresses_insert_own on public.user_addresses
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy addresses_update_own on public.user_addresses
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy addresses_delete_own on public.user_addresses
  for delete to authenticated using (user_id = (select auth.uid()));

create policy cart_select_own on public.cart_items
  for select to authenticated using (user_id = (select auth.uid()));
create policy cart_insert_own on public.cart_items
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy cart_update_own on public.cart_items
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cart_delete_own on public.cart_items
  for delete to authenticated using (user_id = (select auth.uid()));

create policy wishlist_select_own on public.wishlists
  for select to authenticated using (user_id = (select auth.uid()));
create policy wishlist_insert_own on public.wishlists
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy wishlist_delete_own on public.wishlists
  for delete to authenticated using (user_id = (select auth.uid()));

create policy orders_select_own on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy order_items_select_own on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
    or (select public.is_admin())
  );
create policy payments_select_own on public.payments
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
    or (select public.is_admin())
  );
create policy inventory_movements_admin_read on public.inventory_movements
  for select to authenticated using ((select public.is_admin()));

create policy reviews_public_read on public.reviews
  for select to anon, authenticated using (true);
create policy reviews_insert_verified_purchase on public.reviews
  for insert to authenticated with check (
    reviews.user_id = (select auth.uid()) and exists (
      select 1
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        join public.product_variants pv on pv.id = oi.product_variant_id
       where oi.id = reviews.order_item_id
         and pv.product_id = reviews.product_id
         and o.user_id = (select auth.uid())
         and o.status = 'delivered'
    )
  );
create policy reviews_update_own_verified_purchase on public.reviews
  for update to authenticated using (user_id = (select auth.uid())) with check (
    reviews.user_id = (select auth.uid()) and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      join public.product_variants pv on pv.id = oi.product_variant_id
      where oi.id = reviews.order_item_id and pv.product_id = reviews.product_id
        and o.user_id = (select auth.uid()) and o.status = 'delivered'
    )
  );
create policy reviews_delete_own on public.reviews
  for delete to authenticated using (user_id = (select auth.uid()));

create policy try_on_jobs_select_own on public.try_on_jobs
  for select to authenticated using (user_id = (select auth.uid()));
create policy try_on_jobs_delete_terminal_own on public.try_on_jobs
  for delete to authenticated using (
    user_id = (select auth.uid()) and status in ('succeeded', 'failed', 'cancelled')
  );

-- -----------------------------------------------------------------------------
-- 18. Least-privilege grants. RLS policies alone do not grant SQL privileges.
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.categories, public.products, public.product_variants, public.product_images to anon, authenticated;
-- Catalogue writes are admin-only under RLS. Inventory quantities are intentionally not client-writable.
grant insert, update, delete on public.categories, public.products, public.product_images to authenticated;
grant insert (product_id, sku, size, color, price_override, is_active) on public.product_variants to authenticated;
grant update (sku, size, color, price_override, is_active) on public.product_variants to authenticated;
grant delete on public.product_variants to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone, avatar_path) on public.profiles to authenticated;
grant select, insert, update, delete on public.user_addresses to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, delete on public.wishlists to authenticated;
grant select on public.orders, public.order_items, public.payments to authenticated;
grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select, delete on public.try_on_jobs to authenticated;
grant select on public.inventory_movements to authenticated;
-- Explicitly ensure client roles cannot directly alter payment, order, stock, role or AI result tables.
revoke all on public.user_roles, public.store_settings, public.payment_events from anon, authenticated;
revoke insert, update, delete on public.orders, public.order_items, public.payments,
  public.inventory_movements, public.try_on_jobs from anon, authenticated;
grant delete on public.try_on_jobs to authenticated;

-- Function access: revoke default PUBLIC execution, then grant the minimum needed.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public._release_order_reservations(uuid, text, uuid) from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

revoke all on function public.create_order(jsonb, uuid, text, uuid) from public, anon;
grant execute on function public.create_order(jsonb, uuid, text, uuid) to authenticated;
revoke all on function public.cancel_order(uuid) from public, anon;
grant execute on function public.cancel_order(uuid) to authenticated;

revoke all on function public.expire_order_reservations(integer) from public, anon, authenticated;
grant execute on function public.expire_order_reservations(integer) to service_role;
revoke all on function public.create_payment_attempt(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.create_payment_attempt(uuid, text, uuid) to service_role;
revoke all on function public.process_payment_webhook(uuid, text, text, text, text, numeric, text, boolean, text) from public, anon, authenticated;
grant execute on function public.process_payment_webhook(uuid, text, text, text, text, numeric, text, boolean, text) to service_role;
revoke all on function public.fulfill_order(uuid) from public, anon, authenticated;
grant execute on function public.fulfill_order(uuid) to service_role;
revoke all on function public.adjust_inventory(uuid, integer, text) from public, anon, authenticated;
grant execute on function public.adjust_inventory(uuid, integer, text) to service_role;
revoke all on function public.record_cod_collection(uuid) from public, anon, authenticated;
grant execute on function public.record_cod_collection(uuid) to service_role;
revoke all on function public.create_try_on_job(uuid, text) from public, anon;
grant execute on function public.create_try_on_job(uuid, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 19. Storage buckets and object policies
-- Product images are public catalogue assets. User and generated VTON images are private.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif']),
  ('try-on-inputs', 'try-on-inputs', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('try-on-results', 'try-on-results', false, 15728640, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read for product catalogue assets. Never put private user images in this bucket.
drop policy if exists product_images_bucket_public_read on storage.objects;
create policy product_images_bucket_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
drop policy if exists product_images_bucket_admin_write on storage.objects;
create policy product_images_bucket_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));

-- User may upload/read/delete only own input files at try-on-inputs/{auth.uid()}/{random-file}.
drop policy if exists try_on_inputs_read_own on storage.objects;
create policy try_on_inputs_read_own on storage.objects
  for select to authenticated
  using (bucket_id = 'try-on-inputs' and (select auth.uid())::text = pg_catalog.split_part(name, '/', 1));
drop policy if exists try_on_inputs_insert_own on storage.objects;
create policy try_on_inputs_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'try-on-inputs'
    and (select auth.uid())::text = pg_catalog.split_part(name, '/', 1)
    and pg_catalog.strpos(name, '/') > 0
  );
drop policy if exists try_on_inputs_delete_own on storage.objects;
create policy try_on_inputs_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'try-on-inputs' and (select auth.uid())::text = pg_catalog.split_part(name, '/', 1));

-- Results: owners can read/delete their results; only the trusted backend writes results.
drop policy if exists try_on_results_read_own on storage.objects;
create policy try_on_results_read_own on storage.objects
  for select to authenticated
  using (bucket_id = 'try-on-results' and (select auth.uid())::text = pg_catalog.split_part(name, '/', 1));
drop policy if exists try_on_results_delete_own on storage.objects;
create policy try_on_results_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'try-on-results' and (select auth.uid())::text = pg_catalog.split_part(name, '/', 1));
-- Deliberately no authenticated INSERT/UPDATE policy for try-on-results.

commit;

-- Manual post-migration admin bootstrap (run only after creating the user in Auth):
-- insert into public.user_roles (user_id, role) values ('<AUTH_USER_UUID>', 'admin');
-- Do this as a trusted database administrator. Never expose user_roles writes to client apps.
