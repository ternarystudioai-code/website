import { NextRequest, NextResponse } from "next/server";

function getBaseUrl(req: NextRequest) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const host = req.headers.get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;
    const { plan, email, amount: amountRaw, billing_cycle } = body || {};

    if (!plan || !email) {
      return NextResponse.json(
        { error: "Missing plan or email" },
        { status: 400 },
      );
    }

    const amountFromEnv = (() => {
      if (plan === "hobby") return Number(process.env.MIDTRANS_HOBBY_AMOUNT || 0);
      if (plan === "pro") return Number(process.env.MIDTRANS_PRO_AMOUNT || 0);
      if (plan === "team") return Number(process.env.MIDTRANS_TEAM_AMOUNT || 0);
      return 0;
    })();
    const amount = Number(amountRaw || amountFromEnv);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Provide amount or set MIDTRANS_*_AMOUNT envs." },
        { status: 400 },
      );
    }

    const base = getBaseUrl(req);
    const finishUrl = `${base}/success`;

    // Call our create endpoint to generate snap token/redirect
    const resp = await fetch(`${base}/api/payments/midtrans/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        metadata: { plan, email, billing_cycle: billing_cycle || "monthly", user_id: email },
        redirect_url: finishUrl,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data?.redirect_url) {
      return NextResponse.json(
        { error: "Failed to initialize Midtrans transaction", details: data },
        { status: 500 },
      );
    }

    return NextResponse.redirect(data.redirect_url);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
