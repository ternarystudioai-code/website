import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function required(name: string, val: string | undefined): string {
  if (!val) throw new Error(`Missing env ${name}`);
  return val;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    if (!code) {
      return new NextResponse("Missing code", { status: 400 });
    }

    const codeVerifier = req.cookies.get("supa_code_verifier")?.value;
    if (!codeVerifier) {
      return new NextResponse("Missing code_verifier", { status: 400 });
    }

    const clientId = required("SUPA_CONNECT_CLIENT_ID", process.env.SUPA_CONNECT_CLIENT_ID);
    const clientSecret = required(
      "SUPA_CONNECT_CLIENT_SECRET",
      process.env.SUPA_CONNECT_CLIENT_SECRET,
    );
    const redirectUri = required(
      "SUPA_CONNECT_REDIRECT_URI",
      process.env.SUPA_CONNECT_REDIRECT_URI,
    );
    const tokenUri = process.env.SUPA_CONNECT_TOKEN_URL || "https://api.supabase.com/v1/oauth/token";

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch(tokenUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${basic}`,
      },
      body,
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      console.error("Supabase token exchange failed", tokenRes.status, err);
      return new NextResponse(
        JSON.stringify({ error: "Token exchange failed", details: err }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.accessToken ?? tokens.access_token;
    const refreshToken = tokens.refreshToken ?? tokens.refresh_token;
    const expiresIn = tokens.expiresIn ?? tokens.expires_in;

    const deepLinkUrl = `ternary://supabase-oauth-return?token=${encodeURIComponent(
      accessToken,
    )}&refreshToken=${encodeURIComponent(refreshToken)}&expiresIn=${encodeURIComponent(expiresIn)}`;

    const res = NextResponse.redirect(deepLinkUrl, { status: 302 });
    // Clear the verifier cookie after use
    res.cookies.set("supa_code_verifier", "", { maxAge: 0, path: "/" });
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch (err: any) {
    console.error("/connect-supabase/oauth2/callback error", err);
    return new NextResponse(`Authentication failed: ${err?.message || "error"}`, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
