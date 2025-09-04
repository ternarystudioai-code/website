"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReleaseNotes } from "@/components/release-notes";

export default function ReleasesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const versionParam = searchParams.get("v") || searchParams.get("version") || "";
  const [version, setVersion] = useState(versionParam);

  useEffect(() => {
    setVersion(versionParam);
  }, [versionParam]);

  const navigateWithVersion = useCallback(
    (v: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (v) {
        params.set("v", v);
        params.delete("version");
      } else {
        params.delete("v");
        params.delete("version");
      }
      router.push(`/releases?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="container mx-auto max-w-5xl p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Dyad Release Notes</h1>
        <p className="text-sm text-muted-foreground">
          Enter a Dyad version to view its release notes. Example: <code>0.1.0</code>
        </p>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Version (e.g. 0.1.0)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigateWithVersion(version.trim());
            }}
            className="max-w-xs"
          />
          <Button onClick={() => navigateWithVersion(version.trim())}>Open</Button>
        </div>
      </div>

      <ReleaseNotes version={versionParam} />
    </div>
  );
}
