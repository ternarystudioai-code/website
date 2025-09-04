## Downloads (Private GitHub Releases)

This app exposes secure API routes to list releases from a private GitHub repository and proxy asset downloads using a server-side token.

Environment variables required (configure in your hosting provider's project settings):

- `GITHUB_OWNER` — GitHub org or username, e.g. `ternarystudioai-code`
- `GITHUB_REPO` — Repository name, e.g. `dyad`
- `GITHUB_TOKEN` — A Personal Access Token (classic) or fine-grained token with minimal scopes to read releases and download assets. Recommended scopes: `repo:read` (or fine-grained equivalent).

Routes:

- `GET /api/releases` — Returns `{ stable: Release[], beta: Release[] }` with assets mapped to a proxy `download_url`.
- `GET /api/download?asset_id=123` — Streams the asset from GitHub to the client without exposing the token.

Page:

- `/downloads` — UI to browse Stable and Beta releases and download assets via the proxy.

Notes:

- Do not expose `GITHUB_TOKEN` in client-rendered code. It must only be used in server-side API routes.
- These endpoints are unauthenticated by default. You can add rate limiting or require a session if desired.

## Example environment configuration

Set these in your deployment provider (e.g., Vercel → Project → Settings → Environment Variables) or in a local `.env.local` when developing:

```
GITHUB_OWNER=your-org-or-username
GITHUB_REPO=your-private-repo
GITHUB_TOKEN=ghp_xxx_or_fine_grained_token
```

The token must have read access to the repository's releases and assets. For fine-grained tokens, grant minimal repository read permissions to the target repo only.

## Platform-aware instant downloads

The homepage hero (`components/home/hero.tsx`) now:

- Detects the user's OS/arch client-side via `lib/platform.ts`.
- Fetches the latest stable release from `/api/releases`.
- Presents an instant "Download for (platform)" button that links to the recommended asset through the secure proxy.
- Provides a "View all downloads" button that navigates to `/downloads`.

The Downloads page (`app/downloads/page.tsx`) also highlights a "Recommended" asset for the user's platform on the latest stable release.

## Troubleshooting

- If `/api/releases` returns 401/404, verify the three env vars are set and that the token has sufficient read permissions.
- If downloads redirect to GitHub and fail with 404, the asset is private and the token lacks access; re-check token permissions or repo scope.
- If platform detection doesn't appear, ensure the page is client-rendered (it is) and that no ad-blockers/scripts are blocking `navigator` APIs.
