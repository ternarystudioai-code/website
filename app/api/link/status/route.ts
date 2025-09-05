import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

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
    const { polling_token } = body || {}
    if (!polling_token) {
      return withCORS(NextResponse.json({ error: "Missing polling_token" }, { status: 400 }))
    }

    const supa = getSupabaseAdmin()
    const { data: link, error } = await supa
      .from("device_links")
      .select("status, user_id, token_temp")
      .eq("polling_token", polling_token)
      .maybeSingle()

    if (error || !link) {
      return withCORS(NextResponse.json({ error: "Not found" }, { status: 404 }))
    }

    if (link.status !== "confirmed") {
      return withCORS(NextResponse.json({ status: link.status }))
    }

    // When confirmed, return the temp token and clear it so it can't be fetched twice
    const token = link.token_temp

    // Optional: fetch a device_id (best-effort)
    let device_id: string | null = null
    if (link.user_id) {
      const { data: lastToken } = await supa
        .from("app_tokens")
        .select("device_id, created_at")
        .eq("user_id", link.user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      device_id = (lastToken as any)?.device_id ?? null
    }

    // Clear token_temp after handing off
    await supa
      .from("device_links")
      .update({ token_temp: null })
      .eq("polling_token", polling_token)

    return withCORS(NextResponse.json({ status: "confirmed", token, device_id }))
  } catch (e: any) {
    return withCORS(NextResponse.json({ error: "Internal Server Error" }, { status: 500 }))
  }
}
