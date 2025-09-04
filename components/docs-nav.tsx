"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Release {
  version: string;
  title: string;
  subtitle: string;
  slug: string;
}

export function DocsNav() {
  const pathname = usePathname();
  const [releasesOpen, setReleasesOpen] = useState(pathname.startsWith("/docs/releases"));
  const [guidesOpen, setGuidesOpen] = useState(pathname.startsWith("/docs/guides"));
  const [upgradesOpen, setUpgradesOpen] = useState(pathname.startsWith("/docs/upgrades"));
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const response = await fetch('/api/v1/releases');
        const data = await response.json();
        setReleases(data.releases || []);
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReleases();
  }, []);

  return (
    <nav className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center gap-2 text-lg font-semibold">
          <div className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          Dyad
        </Link>
      </div>

      <div className="space-y-2">
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          />
          <div className="text-xs text-gray-500 mt-1">Ctrl K</div>
        </div>

        <div>
          <button
            onClick={() => setReleasesOpen(!releasesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              pathname.startsWith("/docs/releases") && "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <span>Releases</span>
            {releasesOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {releasesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {loading ? (
                <div className="px-2 py-1 text-sm text-gray-500">Loading...</div>
              ) : (
                releases.map((release: Release) => {
                  const href = `/docs/releases/${release.slug}`;
                  const isActive = pathname === href;
                  
                  return (
                    <Link
                      key={release.version}
                      href={href}
                      className={cn(
                        "block px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                        isActive && "bg-gray-200 dark:bg-gray-700 font-medium"
                      )}
                    >
                      {release.title}
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Guides Section */}
        <div>
          <button
            onClick={() => setGuidesOpen(!guidesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              pathname.startsWith("/docs/guides") && "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <span>Guides</span>
            {guidesOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {guidesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {[
                { href: "/docs/guides/debugging", label: "Debugging" },
                { href: "/docs/guides/ai-rules", label: "AI Rules" },
                { href: "/docs/guides/mobile-app", label: "Mobile App" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                    pathname === item.href && "bg-gray-200 dark:bg-gray-700 font-medium"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upgrades Section */}
        <div>
          <button
            onClick={() => setUpgradesOpen(!upgradesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              pathname.startsWith("/docs/upgrades") && "bg-gray-100 dark:bg-gray-800"
            )}
          >
            <span>Upgrades</span>
            {upgradesOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {upgradesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {[
                { href: "/docs/upgrades/select-component", label: "Select Component" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                    pathname === item.href && "bg-gray-200 dark:bg-gray-700 font-medium"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Standalone Links */}
        <div className="mt-2">
          <Link
            href="/docs/roadmap"
            className={cn(
              "block px-2 py-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
              pathname === "/docs/roadmap" && "bg-gray-200 dark:bg-gray-700 font-medium"
            )}
          >
            Roadmap
          </Link>
        </div>
      </div>
    </nav>
  );
}
