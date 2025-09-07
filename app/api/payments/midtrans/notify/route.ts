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

    // Update order and profile in Supabase (best-effort)
    try {
      const supa = getSupabaseAdmin()
      // Update or insert order status
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

      // Fetch the order to get user_id and plan info
      const { data: orderRows } = await supa.from("orders").select("user_id, plan, billing_cycle").eq("order_id", order_id).limit(1)
      const order = orderRows?.[0]

      if (order?.user_id) {
        // Determine new profile status and period end
        let newStatus: string | null = null
        if (transaction_status === "settlement" || transaction_status === "capture") newStatus = "active"
        else if (transaction_status === "pending") newStatus = "pending"
        else if (["deny", "expire", "cancel", "failure"].includes(String(transaction_status))) newStatus = "inactive"

        // Calculate period end based on billing_cycle
        let current_period_end: string | null = null
        if (newStatus === "active") {
          const days = order.billing_cycle === "annual" ? 365 : 30
          const end = new Date()
          end.setDate(end.getDate() + days)
          current_period_end = end.toISOString()
        }

        await supa
          .from("profiles")
          .upsert(
            {
              id: order.user_id,
              plan: order.plan ?? null,
              status: newStatus,
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
