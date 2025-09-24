-- Add idempotency to orders to prevent duplicate processing
alter table public.orders add column if not exists idempotency_key text;

create unique index if not exists idx_orders_user_id_idempotency
  on public.orders(user_id, idempotency_key)
  where idempotency_key is not null;
