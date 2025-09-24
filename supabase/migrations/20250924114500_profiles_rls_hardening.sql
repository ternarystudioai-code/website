-- Harden RLS on public.profiles to prevent users from self-upgrading plan/trial.
-- Users may only update benign fields; sensitive fields must be updated by service-role code.

-- Drop existing permissive policy allowing arbitrary self update
drop policy if exists "profiles self update" on public.profiles;

-- NOTE: We cannot refer to NEW/OLD in RLS policies. The actual guard is enforced
-- via a BEFORE UPDATE trigger in 20250924115500_profiles_guard.sql.
-- Intentionally no policy is created here.

-- Optional: allow self insert only when id matches auth.uid (already present in earlier migration)
-- Keep as-is or re-create to be explicit.
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles
  for insert
  with check (auth.uid() = id);

-- Note: Service-role API (backend) should perform plan/status/current_period_end updates.
