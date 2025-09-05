import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

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
      amount,
      orderId,
      items,
      customer,
      metadata,
      redirect_url,
    }: {
      amount: number
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
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    const finalOrderId = orderId || makeOrderId("plan")

    const payload: any = {
      transaction_details: {
        order_id: finalOrderId,
        // Midtrans expects integer currency units (e.g., IDR) not cents
        gross_amount: Math.round(amount),
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
      const supa = getSupabaseAdmin()
      const user_id = metadata?.user_id as string | undefined
      const plan = (metadata?.plan as string | undefined) || null
      const billing_cycle = (metadata?.billing_cycle as string | undefined) || null
      const { error: dbError } = await supa.from("orders").insert({
        order_id: finalOrderId,
        user_id,
        amount,
        currency: "IDR",
        plan,
        billing_cycle,
        status: "initiated",
        gateway: "midtrans",
        token: json.token,
        redirect_url: json.redirect_url,
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
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: String(err?.message || err) },
      { status: 500 }
    )
  }
}
