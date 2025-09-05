import { NextResponse } from "next/server"
import { authenticateAppRequest } from "@/lib/app-auth"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    // We need NextRequest for headers; cast is fine
    const ctx = await authenticateAppRequest(req as any)
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const supa = getSupabaseAdmin()
    const { data: profile } = await supa
      .from("profiles")
      .select("id, plan, status, current_period_end")
      .eq("id", ctx.user_id)
      .maybeSingle()

    const plan = profile?.plan ?? "free"
    const status = profile?.status ?? "inactive"
    const current_period_end = profile?.current_period_end ?? null

    // Feature flags derived from plan/status
    const feature_flags = plan === "Pro" || plan === "pro"
      ? { pro: true, priority: "high", max_tokens: 1000000 }
      : { pro: false, priority: "standard", max_tokens: 50000 }

    return NextResponse.json({
      user_id: ctx.user_id,
      device_id: ctx.device_id,
      plan,
      status,
      current_period_end,
      feature_flags,
    })
  } catch (err: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
