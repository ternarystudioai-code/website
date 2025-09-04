"use client";

import { useEffect, useMemo, useState } from "react";
import {
  detectPlatform,
  pickAssetForPlatform,
  type Release,
  type Asset,
  formatBytes,
} from "@/lib/platform";

export default function DownloadsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stable, setStable] = useState<Release[]>([]);
  const [beta, setBeta] = useState<Release[]>([]);
  const [tab, setTab] = useState<"stable" | "beta">("stable");
  const [{ os, arch }, setPlatform] = useState(detectPlatform());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/releases", { cache: "no-store" });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `Failed to load releases (${res.status})`);
        }
        const data = await res.json();
        if (!cancelled) {
          setStable(data.stable || []);
          setBeta(data.beta || []);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const releases = useMemo(() => (tab === "stable" ? stable : beta), [tab, stable, beta]);
  const latestStable = stable[0] || null;
  const suggestedAsset = useMemo(() => {
    if (!latestStable) return null;
    return pickAssetForPlatform(latestStable, os, arch);
  }, [latestStable, os, arch]);

  return (
    <div className="container mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
      <p className="text-muted-foreground mt-2">
        Browse {""}
        <span className="font-medium">{tab === "stable" ? "Stable" : "Beta"}</span>
        {" "} releases for your platform. Downloads are served via a secure proxy.
      </p>

      {suggestedAsset && (
        <div className="mt-4 p-4 border rounded-lg bg-(--background-lighter)">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Suggested for your platform{os ? ` (${os}${arch ? `/${arch}` : ""})` : ""}</div>
              <div className="font-medium font-mono truncate max-w-[60ch]">{suggestedAsset.name}</div>
              <div className="text-xs text-muted-foreground">{formatBytes(suggestedAsset.size)}</div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <a
                href={suggestedAsset.download_url}
                className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90 w-full sm:w-auto text-center"
              >
                Download for {os ?? "your platform"}
              </a>
              <a
                href="#releases"
                className="px-4 py-2 rounded-md text-sm border hover:bg-(--background) w-full sm:w-auto text-center"
              >
                View all
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button
          className={`px-3 py-1.5 rounded-md border text-sm ${
            tab === "stable" ? "bg-(--background-lighter) font-medium" : "opacity-80"
          }`}
          onClick={() => setTab("stable")}
        >
          Stable
        </button>
        <button
          className={`px-3 py-1.5 rounded-md border text-sm ${
            tab === "beta" ? "bg-(--background-lighter) font-medium" : "opacity-80"
          }`}
          onClick={() => setTab("beta")}
        >
          Beta
        </button>
      </div>

      {loading && <p className="mt-6">Loading releases…</p>}
      {error && (
        <div className="mt-6 border rounded-md p-4 text-red-600">
          Failed to load releases: {error}
        </div>
      )}

      {!loading && !error && releases.length === 0 && (
        <p className="mt-6">No {tab} releases found.</p>
      )}

      <div id="releases" className="mt-6 space-y-6">
        {releases.map((r) => (
          <div key={r.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {r.name} <span className="text-muted-foreground">({r.tag_name})</span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Published {new Date(r.published_at).toLocaleString()}
                </p>
              </div>
              <a
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline opacity-80 hover:opacity-100"
              >
                View on GitHub
              </a>
            </div>

            {r.body && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm">Release notes</summary>
                <pre className="whitespace-pre-wrap text-sm mt-2 opacity-90">{r.body}</pre>
              </details>
            )}

            <div className="mt-4">
              <h3 className="font-medium">Assets</h3>
              {r.assets.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-1">No assets</p>
              ) : (
                <ul className="mt-2 divide-y">
                  {r.assets.map((a) => (
                    <li key={a.id} className="py-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-mono text-sm truncate">{a.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>
                            {a.content_type} • {formatBytes(a.size)}
                          </span>
                          {suggestedAsset && a.id === suggestedAsset.id && (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide">
                              Recommended
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={a.download_url}
                        className="px-3 py-1.5 border rounded-md text-sm hover:bg-(--background-lighter)"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
