import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { getAnnualPriceIDR, getMonthlyPriceIDR } from "@/data/pricing"

function getBaseSnapUrl(env?: string) {
  return env === "production"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com"
}

function makeOrderId(prefix = "order") {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${rand}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const env = process.env.MIDTRANS_ENV || "sandbox"
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json(
        { error: "Missing MIDTRANS_SERVER_KEY on server" },
        { status: 500 }
      )
    }

    const baseUrl = getBaseSnapUrl(env)

    const {
      amount: clientAmount,
      orderId,
      items,
      customer,
      metadata,
      redirect_url,
      product, // 'monthly' | 'annual'
      idempotency_key,
      user_id: bodyUserId,
    }: {
      amount?: number
      orderId?: string
      items?: Array<{ id?: string; price: number; quantity: number; name: string }>
      customer?: {
        first_name?: string
        last_name?: string
        email?: string
        phone?: string
      }
      metadata?: Record<string, any>
      redirect_url?: string
      product?: 'monthly' | 'annual'
      idempotency_key?: string
      user_id?: string
    } = body

    const supa = getSupabaseAdmin()

    const user_id = bodyUserId || (metadata?.user_id as string | undefined)
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
    }

    // Idempotency: if an initiated order exists for this user+key, return its token
    if (idempotency_key) {
      const { data: existing } = await supa
        .from('orders')
        .select('order_id, token, status')
        .eq('user_id', user_id)
        .eq('idempotency_key', idempotency_key)
        .limit(1)
      if (existing && existing[0]) {
        return NextResponse.json({
          token: existing[0].token,
          order_id: existing[0].order_id,
          reused: true,
        })
      }
    }

    // Load current profile to decide stacking / upgrade
    const { data: profile } = await supa
      .from('profiles')
      .select('plan, status, current_period_end')
      .eq('id', user_id)
      .maybeSingle()

    const now = new Date()
    const cpe = profile?.current_period_end ? new Date(profile.current_period_end) : null
    const active = !!(cpe && cpe > now)
    const planLower = (profile?.plan || '').toLowerCase()

    const requested = product || (metadata?.billing_cycle as 'monthly' | 'annual' | undefined) || 'monthly'
    const planName = (metadata?.plan as string | undefined) || 'Pro'
    const monthlyIdr = getMonthlyPriceIDR(planName)
    const annualIdr = getAnnualPriceIDR(planName)
    if (!monthlyIdr || !annualIdr) {
      return NextResponse.json({ error: `Unknown plan: ${planName}` }, { status: 400 })
    }

    // Compute amount server-side to avoid client tampering
    let grossAmount = requested === 'annual' ? annualIdr : monthlyIdr
    let plan = planName.toLowerCase()
    let billing_cycle: 'monthly' | 'annual' = requested === 'annual' ? 'annual' : 'monthly'

    // If requesting annual and user has remaining monthly time, apply credit
    let creditApplied = 0
    if (requested === 'annual' && active && planLower !== 'plus') {
      const msLeft = cpe!.getTime() - now.getTime()
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))
      const dailyMonthly = monthlyIdr / 30
      creditApplied = Math.floor(dailyMonthly * daysLeft)
      grossAmount = Math.max(annualIdr - creditApplied, Math.floor(annualIdr * 0.05))
    }

    // Prevent duplicate annual purchases stacking, if already on active annual
    if (requested === 'annual' && active && planLower === 'pro') {
      // If you prefer blocking: return 409 with suggestion
      // Otherwise allow stacking: comment out block below
      return NextResponse.json(
        {
          error: 'Already on an active plan',
          message:
            'You already have an active plan. Consider stacking monthly time or we can pro-rate your annual upgrade.',
          suggestion: 'Upgrade to annual with credit, or wait until closer to expiry.',
        },
        { status: 409 },
      )
    }

    // If monthly and active, stacking is allowed (extend by webhook on settlement)
    // If amount was supplied by client, ignore in favor of computed grossAmount

    const finalOrderId = orderId || makeOrderId("plan")

    const payload: any = {
      transaction_details: {
        order_id: finalOrderId,
        // Midtrans expects integer currency units (e.g., IDR) not cents
        gross_amount: Math.round(grossAmount),
      },
      credit_card: { secure: true },
    }

    if (items && Array.isArray(items) && items.length > 0) {
      payload.item_details = items.map((it, idx) => ({
        id: it.id || `item-${idx + 1}`,
        price: Math.round(it.price),
        quantity: it.quantity,
        name: it.name,
      }))
    }

    if (customer) {
      payload.customer_details = customer
    }

    if (metadata) {
      payload.custom_field1 = JSON.stringify(metadata).slice(0, 128)
    }

    // If a finish redirect URL is provided, pass it through to Snap callbacks
    if (redirect_url) {
      payload.callbacks = {
        finish: redirect_url,
      }
    }

    const authHeader =
      "Basic " + Buffer.from(`${serverKey}:`).toString("base64")

    const res = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
      // Keep short timeout via AbortController if you wish; omitted for brevity
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: "Midtrans create transaction failed", details: text },
        { status: 500 }
      )
    }

    const json = await res.json()
    // json has fields: token, redirect_url

    // Attempt to record order in Supabase (best-effort)
    try {
      const { error: dbError } = await supa.from("orders").insert({
        order_id: finalOrderId,
        user_id,
        amount: Math.round(grossAmount),
        currency: "IDR",
        plan,
        billing_cycle,
        status: "initiated",
        gateway: "midtrans",
        token: json.token,
        redirect_url: json.redirect_url,
        idempotency_key: idempotency_key || null,
      })
      if (dbError) {
        console.error("[orders.insert] error", {
          message: dbError.message,
          details: (dbError as any).details,
          hint: (dbError as any).hint,
          code: (dbError as any).code,
        })
      }
    } catch (e) {
      // swallow; do not block payment if DB not configured
      console.warn("Supabase order insert failed (exception)", e)
    }

    return NextResponse.json({
      token: json.token,
      redirect_url: json.redirect_url,
      order_id: finalOrderId,
      amount: Math.round(grossAmount),
      credit_applied: creditApplied,
      plan,
      billing_cycle,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err?.message || err) },
      { status: 500 }
    )
  }
}
