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
    const { state, return_uri, device_name, platform, app_version } = body || {}
    if (!state || !return_uri) return bad("Missing state or return_uri")

    // Create or insert device
    const { data: deviceRow, error: deviceErr } = await supa
      .from("devices")
      .insert({
        user_id: user.id,
        name: device_name || null,
        platform: platform || null,
      })
      .select("id")
      .single()
    if (deviceErr) return bad(`Device insert failed: ${deviceErr.message}`, 500)

    // Create app token
    const raw = generateRawToken()
    const token_hash = hashToken(raw)
    const { error: tokenErr } = await supa.from("app_tokens").insert({
      user_id: user.id,
      device_id: deviceRow.id,
      token_hash,
      scope: "app:read usage:write",
    })
    if (tokenErr) return bad(`Token insert failed: ${tokenErr.message}`, 500)

    const callback = new URL(return_uri)
    callback.searchParams.set("status", "ok")
    callback.searchParams.set("token", raw)
    callback.searchParams.set("device_id", deviceRow.id)
    callback.searchParams.set("state", String(state))
    if (platform) callback.searchParams.set("platform", platform)
    if (app_version) callback.searchParams.set("app_version", app_version)

    return NextResponse.json({ redirect: callback.toString() })
  } catch (err: any) {
    console.error("/api/link/approve error", err)
    return bad("Internal Server Error", 500)
  }
}
