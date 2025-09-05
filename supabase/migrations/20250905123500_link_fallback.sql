-- Fallback linking support: store ephemeral raw token for polling return
alter table public.device_links add column if not exists token_temp text;
