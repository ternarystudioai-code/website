-- Ensure 'orders' and 'profiles' exist and add missing 'gateway' column on orders
create extension if not exists moddatetime;

-- Create tables if missing (no-ops if they exist)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  plan text default 'free',
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.orders (
  order_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  amount bigint not null,
  currency text not null default 'IDR',
  plan text,
  billing_cycle text,
  status text,
  fraud_status text,
  payment_type text,
  status_code text,
  token text,
  redirect_url text,
  gross_amount text,
  signature_key text,
  transaction_time text,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add missing column used by API
alter table public.orders add column if not exists gateway text;

-- Triggers (drop/create to be idempotent)
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure moddatetime(updated_at);

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute procedure moddatetime(updated_at);

-- RLS enable
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Policies (drop/create to be idempotent)
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "orders self read" on public.orders;
create policy "orders self read" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "orders self insert" on public.orders;
create policy "orders self insert" on public.orders for insert with check (auth.uid() = user_id);
