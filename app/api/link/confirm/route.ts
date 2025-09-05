import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { generateRawToken, hashToken } from "@/lib/app-tokens"

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
    const { code } = body || {}
    if (!code) return bad("Missing code")

    // Find link request
    const { data: link, error: linkErr } = await supa
      .from("device_links")
      .select("id, status, expires_at")
      .eq("code", code)
      .maybeSingle()
    if (linkErr || !link) return bad("Invalid code", 404)
    if (link.expires_at && new Date(link.expires_at) < new Date()) return bad("Code expired", 400)
    if (link.status !== "pending") return bad("Code not pending", 400)

    // Create device
    const { data: deviceRow, error: deviceErr } = await supa
      .from("devices")
      .insert({ user_id: user.id })
      .select("id")
      .single()
    if (deviceErr) return bad(`Device insert failed: ${deviceErr.message}`, 500)

    // Create token
    const raw = generateRawToken()
    const token_hash = hashToken(raw)
    const { error: tokenErr } = await supa.from("app_tokens").insert({
      user_id: user.id,
      device_id: deviceRow.id,
      token_hash,
      scope: "app:read usage:write",
    })
    if (tokenErr) return bad(`Token insert failed: ${tokenErr.message}`, 500)

    // Mark link as confirmed and stash the raw token for polling pickup
    const { error: updErr } = await supa
      .from("device_links")
      .update({ status: "confirmed", approved_at: new Date().toISOString(), user_id: user.id, token_temp: raw })
      .eq("code", code)
    if (updErr) return bad(`Confirm failed: ${updErr.message}`, 500)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("/api/link/confirm error", err)
    return bad("Internal Server Error", 500)
  }
}
