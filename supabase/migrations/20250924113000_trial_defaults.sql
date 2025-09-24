-- 7-day free trial for new users
-- Creates a trigger on auth.users to insert a profile row with a trial window

create or replace function public.handle_new_user_trial()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Insert a profile row if it doesn't already exist
  insert into public.profiles (id, plan, status, current_period_end, created_at, updated_at)
  values (new.id, 'free-trial', 'active-trial', now() + interval '7 days', now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Create trigger on auth.users for new signups
-- If a previous trigger exists, drop and recreate to ensure it uses the latest function
drop trigger if exists on_auth_user_created_trial on auth.users;
create trigger on_auth_user_created_trial
  after insert on auth.users
  for each row execute procedure public.handle_new_user_trial();
