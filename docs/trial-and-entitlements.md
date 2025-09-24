# Trial and Entitlements

This document describes the 7-day free trial, plan resolution, and entitlements returned by the website. It is the source of truth for the desktop app (Dyad) to enable/disable paid features like Agent + MCP.

## Data Model

- Table: `public.profiles`
  - `plan` (text): `free` | `free-trial` | `trial` | `pro` | `plus` | etc.
  - `status` (text): e.g., `active`, `inactive`, `active-trial`, etc.
  - `current_period_end` (timestamptz): Next billing/trial end time.

## Trial Initialization

- Migration: `supabase/migrations/20250924113000_trial_defaults.sql`
- Behavior:
  - On `auth.users` insert, a trigger inserts a matching `profiles` row:
    - `plan = 'free-trial'`
    - `status = 'active-trial'`
    - `current_period_end = now() + interval '7 days'`
  - If profile already exists (`on conflict (id) do nothing`), no changes.

## Entitlements (Browser session)

- Endpoint: `app/api/user/entitlements.ts`
- Logic:
  - Fetch `plan`, `status`, `current_period_end` from `profiles`.
  - Compute `isTrialActive` when:
    - `plan` is `free-trial`/`trial` or `status` includes `trial`, and
    - `current_period_end > now`.
  - `effectiveTier`:
    - `pro` when `isTrialActive`.
    - Otherwise map `plan` to `free` | `pro` | `plus`.
  - Response includes `plan.source` set to `trial` when active trial.
  - Entitlements treat `trial` as `pro`.

## Device Endpoint (App Integration)

- Endpoint: `app/api/app/me/route.ts`
- Inputs: `Authorization: Bearer <device_token>`.
- Behavior:
  - Auth via `lib/app-auth.ts`:
    - Verifies `app_tokens.token_hash` exists, not `revoked_at`, not expired.
  - Returns:
    - `plan` (normalized to `pro` when active trial)
    - `status`, `current_period_end`
    - `feature_flags` with `pro: true` during trial

## App Consumption Contract

- The desktop app should:
  - Call `/api/app/me` on startup and before enabling Agent mode.
  - Treat `plan = pro` or `feature_flags.pro = true` as entitled.
  - Refuse Agent mode on 401 (revoked/expired device token) and prompt relink.
  - Optionally require entitlements freshness (< 24h old) before enabling paid features.

## Notes

- Multiple free trials by creating new accounts is a separate business decision. We currently grant 7 days to each new `auth.users` entry.
- To harden further, consider signed entitlements (JWT with expiry) returned by the server.
