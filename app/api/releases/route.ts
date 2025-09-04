import { NextRequest, NextResponse } from "next/server";

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;

export async function GET(_req: NextRequest) {
  try {
    if (!OWNER || !REPO || !TOKEN) {
      return NextResponse.json(
        { error: "Server is not configured with GitHub repo or token" },
        { status: 500 },
      );
    }

    const url = `https://api.github.com/repos/${OWNER}/${REPO}/releases?per_page=100`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": `${OWNER}-${REPO}-downloads`
      },
      // Never cache in edge/CDN, we want current releases
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "Failed to fetch releases", details: text },
        { status: resp.status },
      );
    }

    const releases = await resp.json();

    // Shape response: separate stable and beta. Exclude drafts. Include assets with proxy URL.
    const stable = [] as any[];
    const beta = [] as any[];

    for (const r of releases) {
      if (r.draft) continue;
      const shaped = {
        id: r.id,
        tag_name: r.tag_name,
        name: r.name ?? r.tag_name,
        body: r.body ?? "",
        published_at: r.published_at,
        html_url: r.html_url,
        prerelease: r.prerelease,
        assets: (r.assets || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          size: a.size,
          content_type: a.content_type,
          download_url: `/api/download?asset_id=${a.id}`,
        })),
      };
      if (r.prerelease) beta.push(shaped);
      else stable.push(shaped);
    }

    return NextResponse.json({ stable, beta });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected error fetching releases", details: err?.message },
      { status: 500 },
    );
  }
}
