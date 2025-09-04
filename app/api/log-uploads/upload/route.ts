import { NextRequest, NextResponse } from "next/server";
import { verifyUploadToken } from "@/lib/upload-token";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function datePrefix() {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
}

export async function PUT(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") || "";
  const secret = process.env.LOG_UPLOADS_SECRET || "";
  const bucket = process.env.LOG_UPLOADS_BUCKET || "logs";

  if (!secret) {
    return NextResponse.json(
      { error: "Server not configured (LOG_UPLOADS_SECRET missing)" },
      { status: 500 },
    );
  }

  const payload = verifyUploadToken(token, secret);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const key = `${datePrefix()}/${payload.sid}.json`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(key, new Blob([JSON.stringify(body)], { type: "application/json" }), {
        contentType: "application/json",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, key, sid: payload.sid });
  } catch (err) {
    console.error("upload route error", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function OPTIONS() {
  // Basic CORS for Electron app; adjust as needed
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
