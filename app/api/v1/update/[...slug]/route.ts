// Proxy Dyad's update API to Electron Public Update Service
// This clones the behavior of https://api.dyad.sh/v1/update/* by forwarding
// requests to https://update.electronjs.org/dyad-sh/dyad/*.
// Example:
//   /api/v1/update/stable/win32/1.0.0 -> https://update.electronjs.org/dyad-sh/dyad/stable/win32/1.0.0
//   /api/v1/update/beta/darwin/1.0.0  -> https://update.electronjs.org/dyad-sh/dyad/beta/darwin/1.0.0

import { NextRequest } from 'next/server';

// Configure which GitHub repo to use for Electron Public Update Service
// Set in your hosting environment (e.g., Vercel Project Settings):
//   UPDATE_GH_OWNER=your-gh-org-or-user
//   UPDATE_GH_REPO=your-electron-app-repo
const OWNER = process.env.UPDATE_GH_OWNER || 'TernaryStudio';
const REPO = process.env.UPDATE_GH_REPO || 'Ternary-App';
const UPSTREAM_BASE = `https://update.electronjs.org/${OWNER}/${REPO}`;

async function proxy(req: NextRequest, slugParts: string[]) {
  // Preserve the remainder of the path after /api/v1/update/
  const path = slugParts.map(encodeURIComponent).join('/');
  const upstreamUrl = `${UPSTREAM_BASE}/${path}`;

  const upstreamReqInit: RequestInit = {
    method: req.method,
    // Forward only safe headers (omit host-related and nextjs specific)
    headers: new Headers(
      Array.from(req.headers.entries()).filter(([k]) =>
        !['host', 'x-forwarded-host', 'x-forwarded-proto', 'x-middleware-prefetch'].includes(k.toLowerCase()),
      ),
    ),
    // Only forward body for methods that can have one
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  };

  const upstreamRes = await fetch(upstreamUrl, upstreamReqInit);

  // Stream back the response with status and headers
  const headers = new Headers(upstreamRes.headers);
  // Ensure no conflicting CORS or encoding headers are present
  headers.delete('content-encoding');
  headers.delete('transfer-encoding');

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers,
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxy(req, slug);
}

export async function HEAD(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxy(req, slug);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxy(req, slug);
}
