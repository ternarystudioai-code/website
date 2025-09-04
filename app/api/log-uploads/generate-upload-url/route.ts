import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createUploadToken, buildUploadUrl } from "@/lib/upload-token";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { extension, contentType } = (await req.json()) as {
      extension?: string;
      contentType?: string;
    };

    if (extension !== "json" || contentType !== "application/json") {
      return new NextResponse(
        JSON.stringify({ error: "Only JSON uploads are supported" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const secret = process.env.LOG_UPLOADS_SECRET;
    if (!secret) {
      return new NextResponse(
        JSON.stringify({ error: "Server not configured (LOG_UPLOADS_SECRET missing)" }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const origin = req.headers.get("x-forwarded-origin") || req.nextUrl.origin;

    // session id
    const sid = randomUUID().replace(/-/g, "");

    // short-lived token, default ttl inside util is 10 minutes
    const token = createUploadToken({ sid, secret });
    const uploadUrl = buildUploadUrl(origin, token);
    const filename = `${sid}.json`;

    return new NextResponse(JSON.stringify({ uploadUrl, filename }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("generate-upload-url error", err);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate upload URL" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
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
