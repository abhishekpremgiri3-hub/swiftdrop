create extension if not exists pgcrypto;

create type public.user_role as enum ('customer','rider','business','admin');
create type public.order_status as enum ('BOOKED','ACCEPTED','PICKED_UP','DELIVERED','CANCELLED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role public.user_role not null default 'customer',
  is_online boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  rider_id uuid references public.profiles(id),
  pickup text not null,
  drop_location text not null,
  package_type text not null default 'Small parcel',
  status public.order_status not null default 'BOOKED',
  fare integer not null default 59 check (fare >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_idx on public.orders(customer_id);
create index orders_rider_idx on public.orders(rider_id);
create index orders_status_idx on public.orders(status);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;

create or replace function public.my_role()
returns public.user_role
language sql stable security definer set search_path=public
as $$ select role from public.profiles where id=auth.uid() $$;

create policy "profiles own read" on public.profiles for select
using (id=auth.uid() or public.my_role()='admin');

create policy "profiles own update" on public.profiles for update
using (id=auth.uid() or public.my_role()='admin');

create policy "customers create orders" on public.orders for insert
with check (customer_id=auth.uid() and public.my_role()='customer');

create policy "customers read own orders" on public.orders for select
using (customer_id=auth.uid() or rider_id=auth.uid() or public.my_role()='admin');

create policy "riders accept booked orders" on public.orders for update
using ((public.my_role()='rider' and (rider_id=auth.uid() or (rider_id is null and status='BOOKED'))) or customer_id=auth.uid() or public.my_role()='admin')
with check ((public.my_role()='rider' and rider_id=auth.uid()) or customer_id=auth.uid() or public.my_role()='admin');

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end $$;

create trigger orders_updated_at before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.orders replica identity full;
