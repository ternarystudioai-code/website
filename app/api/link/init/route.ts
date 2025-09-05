import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { generateShortCode, generatePollingToken } from "@/lib/linking"

export const runtime = "nodejs"

function withCORS(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type")
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  return res
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { device_name, platform, app_version } = body || {}

    const code = generateShortCode(6)
    const polling_token = generatePollingToken()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const supa = getSupabaseAdmin()
    const { error } = await supa.from("device_links").insert({
      code,
      polling_token,
      device_info: { device_name, platform, app_version },
      status: "pending",
      expires_at,
    })
    if (error) {
      return withCORS(NextResponse.json({ error: error.message }, { status: 500 }))
    }

    const base = process.env.NEXT_PUBLIC_WEBSITE_BASE || process.env.VERCEL_URL || "http://ternary-pre-domain.vercel.app"
    const origin = base.startsWith("http") ? base : (base ? `https://${base}` : "")
    const verify_url = `${origin}/link/verify?code=${encodeURIComponent(code)}`

    return withCORS(NextResponse.json({ code, polling_token, verify_url, expires_at }))
  } catch (e: any) {
    return withCORS(NextResponse.json({ error: "Internal Server Error" }, { status: 500 }))
  }
}
