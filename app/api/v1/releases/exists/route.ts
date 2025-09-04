// Compatibility alias: /api/v1/releases/exists mirrors /api/releases/exists
import { NextRequest, NextResponse } from 'next/server';
import { releases } from '@/data/releases/manifest';

// GET /api/v1/releases/exists?v=<version>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const version = searchParams.get('v') || searchParams.get('version');

  if (!version) {
    return NextResponse.json(
      { error: "Missing query parameter 'v' (version)." },
      { status: 400 }
    );
  }

  const match = releases.find((r) => r.version === version || r.slug === version);

  if (match) {
    const url = `/docs/releases/${encodeURIComponent(match.slug)}`;
    return NextResponse.json({ exists: true, url });
  }

  return NextResponse.json({ exists: false });
}
