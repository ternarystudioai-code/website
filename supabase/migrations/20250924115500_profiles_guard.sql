-- Guard sensitive fields on profiles using a trigger (NEW/OLD not usable in RLS policies)

-- Helper to detect service role
create or replace function public.is_service_role()
returns boolean
language sql
stable
as $$
  select coalesce(
    (nullif(current_setting('request.jwt.claims', true), '')::json->>'role') = 'service_role',
    false
  );
$$;

-- Trigger function to block client updates to plan/status/current_period_end
create or replace function public.enforce_profile_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow service role to update anything
  if public.is_service_role() then
    return new;
  end if;

  -- Block changes to sensitive columns by non-service role clients
  if (new.plan is distinct from old.plan)
     or (new.status is distinct from old.status)
     or (new.current_period_end is distinct from old.current_period_end) then
    raise exception 'modifying plan/status/current_period_end is not allowed';
  end if;

  return new;
end;
$$;

-- Attach trigger
drop trigger if exists trg_profiles_guard on public.profiles;
create trigger trg_profiles_guard
before update on public.profiles
for each row execute function public.enforce_profile_update_guard();

-- Replace the earlier invalid policy with a generic, safe update policy
-- (RLS policies cannot reference NEW/OLD directly.)
drop policy if exists "profiles self update safe" on public.profiles;
create policy "profiles self update limited"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
