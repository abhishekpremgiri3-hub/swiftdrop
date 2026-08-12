create table if not exists orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  pickup_address text not null,
  drop_address text not null,
  package_type text not null,
  distance_km numeric not null,
  price_inr numeric not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at);
