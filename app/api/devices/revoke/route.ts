import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization")
    if (!auth?.startsWith("Bearer ")) return bad("Missing bearer token", 401)
    const jwt = auth.slice("Bearer ".length)

    const supa = getSupabaseAdmin()
    const { data: userRes, error: userErr } = await supa.auth.getUser(jwt)
    if (userErr || !userRes.user) return bad("Invalid session", 401)
    const user = userRes.user

    const body = await req.json().catch(() => ({}))
    const { device_id } = body || {}
    if (!device_id) return bad("Missing device_id")

    // Revoke all tokens for this device belonging to the user
    const { error: updErr } = await supa
      .from("app_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("device_id", device_id)

    if (updErr) return bad(`Revoke failed: ${updErr.message}`, 500)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return bad("Server error", 500)
  }
}
