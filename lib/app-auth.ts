import { NextRequest } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { hashToken } from "@/lib/app-tokens"

export type AppUserContext = {
  user_id: string
  device_id: string | null
}

export async function authenticateAppRequest(req: NextRequest): Promise<AppUserContext | null> {
  const auth = req.headers.get("authorization") || req.headers.get("Authorization")
  if (!auth?.startsWith("Bearer ")) return null
  const raw = auth.slice("Bearer ".length)
  if (!raw) return null
  const token_hash = hashToken(raw)
  const supa = getSupabaseAdmin()
  const { data, error } = await supa
    .from("app_tokens")
    .select("user_id, device_id, revoked_at, expires_at")
    .eq("token_hash", token_hash)
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  if (data.revoked_at) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  return { user_id: data.user_id, device_id: data.device_id }
}
