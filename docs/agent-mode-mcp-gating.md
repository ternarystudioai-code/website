# Agent Mode + MCP Gating (Plan-Based)

This document explains how Agent Mode with MCP is gated by the connected account plan and how MCP processes run within the app project directory.

## Overview

- Desktop app code paths live in `dyad/`.
- Website APIs and database live in `website/`.
- Agent Mode is enabled for:
  - Paid plans (pro, team, enterprise, business)
  - Active free trial (7 days)
  - Feature flag `feature_flags.pro = true`

## Desktop App (Dyad)

- File: `dyad/src/lib/schemas.ts`
  - Function: `isAgentMcpEnabled(settings)`
  - Logic: returns true if paid plan, active trial, or `featureFlags.pro`.

- File: `dyad/src/ipc/handlers/chat_stream_handlers.ts`
  - Gating is enforced right before running Agent-mode MCP tools.
  - On not entitled: sends `chat:response:error` and ends stream.
  - On entitled: proceeds.

- MCP CWD enforcement
  - File: `dyad/src/ipc/handlers/chat_stream_handlers.ts`
    - Calls `getMcpTools(event, appPath)` in Agent mode.
  - File: `dyad/src/ipc/utils/mcp_manager.ts`
    - `getClient(serverId, { cwd, extraEnv })` runs stdio transports with `cwd = appPath` and env hints (`PROJECT_ROOT`, `TERNARY_APP_PATH`).

## Website

- Device endpoint (used by app): `website/app/api/app/me/route.ts`
  - Input: `Authorization: Bearer <device_token>`
  - Output: `{ plan, status, current_period_end, feature_flags }`
  - Treats active trial as `pro` for `feature_flags.pro`.

- Trial initialization: `website/supabase/migrations/20250924113000_trial_defaults.sql`

## Integration Contract

- The app should fetch `/api/app/me` on startup and before enabling Agent.
- If 401, remove local entitlement and prompt relink.
- Entitlement freshness recommended (< 24h).

## Testing

- Free account: Agent disabled in UI and backend.
- Free-trial (active): Agent enabled.
- Trial expired: Agent disabled.
- Paid plan: Agent enabled.
- Figma MCP downloads: assets land inside the app project folder.
