create extension if not exists "pgcrypto";

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    price numeric(12, 2) not null check (price >= 0),
    image_url text,
    scoville integer,
    stock integer not null default 0 check (stock >= 0),
    created_at timestamptz not null default now()
);

create table if not exists public.carts (
    id uuid primary key default gen_random_uuid(),
    cart_key text not null  unique,
    items jsonb not null default '[]'::jsonb,
    updated_at timestamptz not null default now()
);

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id text,
    cart_key text,
    customer jsonb not null,
    items jsonb not null,
    total numeric(12, 2) not null check (total >= 0),
    status text not null default 'new',
    created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

create table if not exists public.users (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    password_hash text not null,
    role text not null default 'user' check (role in ('user', 'admin')),
    name text,
    created_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_unique on public.users (lower(email));
create index if not exists users_role_idx on public.users (role);

alter table public.users
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists shipping_address text;

alter table public.products
  add column if not exists product_type text;

alter table public.products
  add column if not exists is_hidden boolean not null default false;

create or replace function public.get_admin_dashboard()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'totalSales', (
      select coalesce(sum(total), 0)
      from public.orders
      where status in ('confirmed', 'shipped', 'delivered')
    ),
    'totalUsers', (
      select count(*) from public.users
    ),
    'totalOrders', (
      select count(*) from public.orders
    ),
    'totalPending', (
      select count(*)
      from public.orders
      where status in ('new', 'pending')
    )
  );
$$;

revoke execute on function public.get_admin_dashboard()
  from public, anon, authenticated;

grant execute on function public.get_admin_dashboard()
  to service_role;

alter table public.orders
  add column if not exists request_id uuid,
  add column if not exists request_payload jsonb,
  add column if not exists payment_method text,
  add column if not exists payment_status text not null default 'unpaid';

create unique index if not exists orders_user_request_unique
  on public.orders (user_id, request_id);

create or replace function public.create_store_order(
  p_user_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request_id uuid := (p_payload->>'requestId')::uuid;
  v_existing public.orders%rowtype;
  v_order public.orders%rowtype;
  v_product record;
  v_items jsonb := '[]'::jsonb;
  v_total numeric := 0;
  v_count integer := 0;
  v_email text;
begin
  perform pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || v_request_id::text, 0)
  );

  select * into v_existing
  from public.orders
  where user_id = p_user_id::text
    and request_id = v_request_id;

  if found then
    if v_existing.request_payload <> p_payload then
      raise exception 'This request already created an order. Check your order history.';
    end if;

    return to_jsonb(v_existing);
  end if;

  select email into v_email
  from public.users
  where id = p_user_id;

  if not found then
    raise exception 'User not found.';
  end if;

  for v_product in
    select p.*, i.quantity as ordered_quantity
    from public.products p
    join jsonb_to_recordset(p_payload->'items')
      as i(id uuid, quantity integer) on i.id = p.id
    order by p.id
    for update of p
  loop
    if v_product.is_hidden then
      raise exception 'A product is no longer available.';
    end if;

    if v_product.stock < v_product.ordered_quantity then
      raise exception 'Not enough stock for "%".', v_product.name;
    end if;

    v_total := v_total + v_product.price * v_product.ordered_quantity;
    v_count := v_count + 1;

    v_items := v_items || jsonb_build_array(jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'quantity', v_product.ordered_quantity,
      'image_url', v_product.image_url
    ));

    update public.products
    set stock = stock - v_product.ordered_quantity
    where id = v_product.id;
  end loop;

  if v_count = 0 or v_count <> jsonb_array_length(p_payload->'items') then
    raise exception 'One or more products no longer exist.';
  end if;

  if v_total * 100 <> (p_payload->>'expectedTotalCents')::bigint then
    raise exception 'Product prices have changed. Refresh your cart before ordering.';
  end if;

  insert into public.orders (
    user_id, customer, items, total, status,
    request_id, request_payload, payment_method, payment_status
  )
  values (
    p_user_id::text,
    (p_payload->'customer') || jsonb_build_object('email', v_email),
    v_items,
    v_total,
    'new',
    v_request_id,
    p_payload,
    p_payload->>'paymentMethod',
    'unpaid'
  )
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

revoke execute on function public.create_store_order(uuid, jsonb)
  from public, anon, authenticated;

grant execute on function public.create_store_order(uuid, jsonb)
  to service_role;