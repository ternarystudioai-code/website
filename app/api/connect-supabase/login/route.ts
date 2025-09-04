import { NextRequest, NextResponse } from "next/server";
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";

export const runtime = "nodejs";

function required(name: string, val: string | undefined): string {
  if (!val) throw new Error(`Missing env ${name}`);
  return val;
}

export async function GET(req: NextRequest) {
  try {
    const clientId = required("SUPA_CONNECT_CLIENT_ID", process.env.SUPA_CONNECT_CLIENT_ID);
    const redirectUri = required(
      "SUPA_CONNECT_REDIRECT_URI",
      process.env.SUPA_CONNECT_REDIRECT_URI,
    );
    const authorizationEndpointUri =
      process.env.SUPA_CONNECT_AUTH_URL || "https://api.supabase.com/v1/oauth/authorize";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const authorizeUrl = new URL(authorizationEndpointUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    // Optional scope; keep broad for management access. Adjust as needed.
    if (process.env.SUPA_CONNECT_SCOPE) {
      authorizeUrl.searchParams.set("scope", process.env.SUPA_CONNECT_SCOPE);
    }

    const res = NextResponse.redirect(authorizeUrl.toString(), { status: 302 });
    // Store verifier in a short-lived, secure, httpOnly cookie
    res.cookies.set("supa_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 10 * 60, // 10 minutes
    });
    // CORS for safety
    res.headers.set("Access-Control-Allow-Origin", "*");
    return res;
  } catch (err) {
    console.error("/connect-supabase/login error", err);
    return new NextResponse("Internal Server Error", {
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
