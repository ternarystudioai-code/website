import { NextRequest } from "next/server";

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;

export async function GET(req: NextRequest) {
  try {
    if (!OWNER || !REPO || !TOKEN) {
      return new Response(
        JSON.stringify({ error: "Server is not configured with GitHub repo or token" }),
        { status: 500, headers: { "content-type": "application/json" } },
      );
    }

    const assetId = req.nextUrl.searchParams.get("asset_id");
    if (!assetId) {
      return new Response(JSON.stringify({ error: "Missing asset_id" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${assetId}`;

    // First request with manual redirect to get the signed URL
    const head = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/octet-stream",
        "User-Agent": `${OWNER}-${REPO}-downloads`,
      },
      redirect: "manual",
      cache: "no-store",
    });

    if (head.status === 302 || head.status === 301) {
      const location = head.headers.get("location");
      if (!location) {
        return new Response(JSON.stringify({ error: "Missing redirect location" }), {
          status: 502,
          headers: { "content-type": "application/json" },
        });
      }
      // Stream the asset content from the signed URL to the client
      const fileResp = await fetch(location, { redirect: "manual" });
      const headers = new Headers();
      const ct = fileResp.headers.get("content-type") || "application/octet-stream";
      const cd = fileResp.headers.get("content-disposition");
      const len = fileResp.headers.get("content-length");
      headers.set("content-type", ct);
      if (cd) headers.set("content-disposition", cd);
      if (len) headers.set("content-length", len);
      // prevent caching
      headers.set("cache-control", "no-store");
      return new Response(fileResp.body, { status: 200, headers });
    }

    const text = await head.text();
    return new Response(
      JSON.stringify({ error: "Failed to fetch asset", details: text }),
      { status: head.status, headers: { "content-type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Unexpected error fetching asset", details: err?.message }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}
