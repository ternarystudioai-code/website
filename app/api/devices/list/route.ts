import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization")
    if (!auth?.startsWith("Bearer ")) return bad("Missing bearer token", 401)
    const jwt = auth.slice("Bearer ".length)

    const supa = getSupabaseAdmin()
    const { data: userRes, error: userErr } = await supa.auth.getUser(jwt)
    if (userErr || !userRes.user) return bad("Invalid session", 401)
    const user = userRes.user

    const { data: devices } = await supa.from("devices").select("id, name, platform, last_seen_at, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false })
    const { data: tokens } = await supa.from("app_tokens").select("device_id, revoked_at, last_used_at, created_at").eq("user_id", user.id)

    const tokenMap = new Map<string, any>()
    ;(tokens || []).forEach(t => {
      tokenMap.set(t.device_id as string, t)
    })

    const enriched = (devices || []).map(d => ({
      ...d,
      token: tokenMap.get(d.id) || null,
    }))

    return NextResponse.json({ devices: enriched })
  } catch (err: any) {
    return bad("Server error", 500)
  }
}
