-- Linking schema: devices, device_links, app_tokens
create extension if not exists moddatetime;

-- devices
create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text,
  platform text,
  last_seen_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists set_devices_updated_at on public.devices;
create trigger set_devices_updated_at
before update on public.devices
for each row execute procedure moddatetime(updated_at);

alter table public.devices enable row level security;

drop policy if exists "devices self read" on public.devices;
create policy "devices self read" on public.devices for select using (auth.uid() = user_id);

drop policy if exists "devices self update" on public.devices;
create policy "devices self update" on public.devices for update using (auth.uid() = user_id);

-- device_links (service role only)
create table if not exists public.device_links (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  polling_token text unique,
  device_info jsonb,
  user_id uuid,
  status text default 'pending', -- pending | confirmed | expired | revoked
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists set_device_links_updated_at on public.device_links;
create trigger set_device_links_updated_at
before update on public.device_links
for each row execute procedure moddatetime(updated_at);

alter table public.device_links disable row level security;

-- app_tokens
create table if not exists public.app_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  token_hash text not null,
  scope text,
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_app_tokens_user_id on public.app_tokens(user_id);
create index if not exists idx_app_tokens_device_id on public.app_tokens(device_id);
create index if not exists idx_app_tokens_token_hash on public.app_tokens(token_hash);

drop trigger if exists set_app_tokens_updated_at on public.app_tokens;
create trigger set_app_tokens_updated_at
before update on public.app_tokens
for each row execute procedure moddatetime(updated_at);

alter table public.app_tokens enable row level security;

drop policy if exists "app_tokens self read" on public.app_tokens;
create policy "app_tokens self read" on public.app_tokens for select using (auth.uid() = user_id);

-- No insert/update via client; tokens are created server-side using service role.
