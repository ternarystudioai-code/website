import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function required(name: string, val: string | undefined): string {
  if (!val) throw new Error(`Missing env ${name}`);
  return val;
}

export async function POST(req: NextRequest) {
  try {
    const tokenUri = process.env.SUPA_CONNECT_TOKEN_URL || "https://api.supabase.com/v1/oauth/token";
    const clientId = required("SUPA_CONNECT_CLIENT_ID", process.env.SUPA_CONNECT_CLIENT_ID);
    const clientSecret = required(
      "SUPA_CONNECT_CLIENT_SECRET",
      process.env.SUPA_CONNECT_CLIENT_SECRET,
    );

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    let bodyJson: any;
    try {
      bodyJson = await req.json();
    } catch {
      return new NextResponse(JSON.stringify({ message: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const refreshToken = bodyJson?.refreshToken;
    if (!refreshToken) {
      return new NextResponse(JSON.stringify({ message: "Refresh token is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const form = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
    });

    const tokenRes = await fetch(tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
      body: form,
    });

    if (!tokenRes.ok) {
      const details = await tokenRes.json().catch(() => ({}));
      return new NextResponse(
        JSON.stringify({ message: `Failed to refresh token: ${tokenRes.statusText}`, details }),
        { status: tokenRes.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } },
      );
    }

    const tokens = await tokenRes.json();
    const resBody = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    };

    return new NextResponse(JSON.stringify(resBody), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: any) {
    console.error("/connect-supabase/refresh error", err);
    return new NextResponse(JSON.stringify({ message: `Internal server error: ${err?.message || "error"}` }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
