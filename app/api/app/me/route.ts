import { NextResponse } from "next/server"
import { authenticateAppRequest } from "@/lib/app-auth"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export const runtime = "nodejs"

function withCORS(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type")
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  return res
}

export async function OPTIONS() {
  return withCORS(new NextResponse(null, { status: 204 }))
}

export async function GET(req: Request) {
  try {
    // We need NextRequest for headers; cast is fine
    const ctx = await authenticateAppRequest(req as any)
    if (!ctx) {
      return withCORS(NextResponse.json({ error: "Unauthorized" }, { status: 401 }))
    }
    const supa = getSupabaseAdmin()
    const { data: profile } = await supa
      .from("profiles")
      .select("id, plan, status, current_period_end")
      .eq("id", ctx.user_id)
      .maybeSingle()

    const rawPlan = (profile?.plan ?? "free").toLowerCase()
    const status = (profile?.status ?? "inactive")
    const current_period_end = profile?.current_period_end ?? null
    const now = new Date()
    const periodEnd = current_period_end ? new Date(current_period_end) : null
    const isTrialPlan = rawPlan === "free-trial" || rawPlan === "trial" || status.toLowerCase().includes("trial")
    const isTrialActive = !!(isTrialPlan && periodEnd && periodEnd > now)

    const effectivePlan = isTrialActive ? "pro" : rawPlan

    // Feature flags derived from effective plan/status (treat active trial as pro)
    const feature_flags = effectivePlan === "pro"
      ? { pro: true, priority: "high", max_tokens: 1000000 }
      : effectivePlan === "plus"
        ? { pro: true, priority: "premium", max_tokens: 2000000 }
        : { pro: false, priority: "standard", max_tokens: 50000 }

    // Fetch email from auth (service role)
    const { data: authUser } = await supa.auth.admin.getUserById(ctx.user_id)
    const email = (authUser?.user?.email as string) || null

    return withCORS(NextResponse.json({
      user_id: ctx.user_id,
      device_id: ctx.device_id,
      email,
      plan: effectivePlan,
      status,
      current_period_end,
      feature_flags,
    }))
  } catch (err: any) {
    return withCORS(NextResponse.json({ error: "Server error" }, { status: 500 }))
  }
}
