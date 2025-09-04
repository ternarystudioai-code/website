"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ReleaseNotesProps {
  version: string;
}

export function ReleaseNotes({ version }: ReleaseNotesProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const [releaseUrl, setReleaseUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function check() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/v1/releases/exists?v=${encodeURIComponent(version)}`, {
          method: "GET",
          cache: "no-store",
        });
        const data = (await res.json()) as { exists: boolean; url?: string; error?: string };
        if (!active) return;
        setExists(data.exists);
        if (data.exists && data.url) {
          const url = `${data.url}?hideHeader=true&theme=${theme ?? "light"}`;
          setReleaseUrl(url);
        } else {
          setReleaseUrl(null);
        }
      } catch (e) {
        if (!active) return;
        setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }
    check();
    return () => {
      active = false;
    };
  }, [version, theme]);

  const openExternal = useMemo(() => {
    if (!releaseUrl) return null;
    // strip query params we added
    try {
      const u = new URL(releaseUrl);
      u.search = "";
      return u.toString();
    } catch {
      return releaseUrl;
    }
  }, [releaseUrl]);

  if (!version) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Provide a version via the URL query parameter `v`.</div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
        <span className="text-sm text-muted-foreground">Loading release notes…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 dark:text-red-400">Failed to check release notes: {error}</div>
    );
  }

  if (!exists) {
    return (
      <div className="p-4 space-y-2">
        <div className="text-lg font-semibold">No release notes found</div>
        <div className="text-sm text-muted-foreground">
          We couldn't find release notes for version <code>v{version}</code> on dyad.sh.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pr-2">
        <div className="text-base font-medium">What's new in v{version}?</div>
        {openExternal && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => window.open(openExternal!, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab
          </Button>
        )}
      </div>
      <div className="overflow-auto h-[70vh]">
        {releaseUrl && (
          <iframe
            src={releaseUrl}
            className="w-full h-full border-0 rounded-lg bg-background"
            title={`Release notes for v${version}`}
          />
        )}
      </div>
    </div>
  );
}
