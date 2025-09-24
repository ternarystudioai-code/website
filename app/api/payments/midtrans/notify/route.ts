import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { generateLiteLLMKey, getBaseUrlFromHeaders } from "../_keygen"

function sha512(data: string) {
  return crypto.createHash("sha512").update(data).digest("hex")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      return NextResponse.json(
        { error: "Missing MIDTRANS_SERVER_KEY on server" },
        { status: 500 }
      )
    }

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
    } = body || {}

    if (!order_id) {
      return NextResponse.json({ error: "Invalid notification payload" }, { status: 400 })
    }

    const expectedSig = sha512(`${order_id}${status_code}${gross_amount}${serverKey}`)
    const valid = (signature_key || "").toLowerCase() === expectedSig

    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    // Update order and profile in Supabase (best-effort, idempotent)
    try {
      const supa = getSupabaseAdmin()

      // Fetch existing order
      const { data: existingOrders } = await supa
        .from("orders")
        .select("order_id, user_id, plan, billing_cycle, status, paid_at")
        .eq("order_id", order_id)
        .limit(1)
      const existing = existingOrders?.[0]

      // If already settled, respond OK (idempotent)
      if (
        existing?.paid_at &&
        (existing.status === "settlement" || existing.status === "capture")
      ) {
        return NextResponse.json({ ok: true, order_id, transaction_status })
      }

      // Update order status
      await supa
        .from("orders")
        .update({
          status: transaction_status,
          fraud_status: fraud_status ?? null,
          payment_type: payment_type ?? null,
          status_code: status_code ?? null,
          gross_amount,
          signature_key,
          transaction_time,
          paid_at:
            transaction_status === "settlement" || transaction_status === "capture"
              ? new Date().toISOString()
              : null,
        })
        .eq("order_id", order_id)

      // If not a success state, stop after order update
      const isSuccess = transaction_status === "settlement" || transaction_status === "capture"
      if (!isSuccess) {
        return NextResponse.json({ ok: true, order_id, transaction_status })
      }

      // On success, compute new subscription end date
      if (existing?.user_id) {
        const userId = existing.user_id as string
        // Read current profile
        const { data: profile } = await supa
          .from("profiles")
          .select("plan, current_period_end")
          .eq("id", userId)
          .maybeSingle()

        const now = new Date()
        const cpe = profile?.current_period_end
          ? new Date(profile.current_period_end)
          : null
        const active = !!(cpe && cpe > now)

        let base = now
        // For monthly stacking: extend from current_period_end if active
        if (existing.billing_cycle === "monthly" && active && cpe) {
          base = cpe
        }
        // For annual, policy choice: set from now. If you want stacking annuals, uncomment:
        // if (existing.billing_cycle === "annual" && active && cpe) base = cpe

        const days = existing.billing_cycle === "annual" ? 365 : 30
        const end = new Date(base)
        end.setDate(end.getDate() + days)
        const current_period_end = end.toISOString()

        await supa
          .from("profiles")
          .upsert(
            {
              id: userId,
              plan: existing.plan ?? null,
              status: "active",
              current_period_end,
            },
            { onConflict: "id" }
          )
      }
    } catch (e) {
      console.warn("Supabase webhook update failed", e)
    }

    // Stripe parity: when payment succeeds, also generate API key and return deeplink/success URL
    let apiKey: string | null = null
    let redirectUrl: string | null = null
    let successUrl: string | null = null

    if (transaction_status === "settlement" || transaction_status === "capture") {
      try {
        // Fetch minimal order again to get plan/user_id
        const supa2 = getSupabaseAdmin()
        const { data: orderRows2 } = await supa2
          .from("orders")
          .select("user_id, plan")
          .eq("order_id", order_id)
          .limit(1)
        const order2 = orderRows2?.[0]
        const plan = (order2?.plan as string | undefined) || "pro"
        const userId = (order2?.user_id as string | undefined) || "user"

        apiKey = await generateLiteLLMKey({
          plan,
          emailOrUserId: userId,
          key_alias: `midtrans-webhook-${order_id}`,
        })

        const host = req.headers.get("host") || "ternary.app"
        const base = getBaseUrlFromHeaders(host)
        const url = new URL("/success", base)
        url.searchParams.set("apiKey", apiKey)
        successUrl = url.toString()
        redirectUrl = `ternary://ternary-pro-return?key=${apiKey}`
      } catch (e) {
        // Do not fail the webhook if keygen fails; just log
        console.error("Keygen in midtrans webhook failed:", e)
      }
    }

    return NextResponse.json({
      ok: true,
      order_id,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_time,
      ...(apiKey ? { apiKey } : {}),
      ...(redirectUrl ? { redirectUrl } : {}),
      ...(successUrl ? { successUrl } : {}),
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err?.message || err) },
      { status: 500 }
    )
  }
}
