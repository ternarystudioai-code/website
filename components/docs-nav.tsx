"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, PanelLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Release {
  version: string;
  title: string;
  subtitle: string;
  slug: string;
}

export function DocsNav({
  collapsed = false,
  onToggle,
  focusSearchTick,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  focusSearchTick?: number;
}) {
  const pathname = usePathname();
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const [releasesOpen, setReleasesOpen] = useState(pathname.startsWith("/docs/releases"));
  const [guidesOpen, setGuidesOpen] = useState(pathname.startsWith("/docs/guides"));
  const [upgradesOpen, setUpgradesOpen] = useState(pathname.startsWith("/docs/upgrades"));
  const [templatesOpen, setTemplatesOpen] = useState(pathname.startsWith("/docs/templates"));
  const [helpOpen, setHelpOpen] = useState(pathname.startsWith("/docs/help"));
  const [integrationsOpen, setIntegrationsOpen] = useState(pathname.startsWith("/docs/integrations"));
  const [policiesOpen, setPoliciesOpen] = useState(pathname.startsWith("/docs/policies"));
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

  // Focus search when requested from parent after expand
  useEffect(() => {
    if (typeof focusSearchTick === 'number' && !collapsed) {
      // small delay to ensure input is visible
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [focusSearchTick, collapsed]);

  return (
    <nav className="w-full p-3 text-sm">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/docs" className="flex items-center gap-3">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 shadow-sm">
            <Image
              src="/logo_transparent.png"
              alt="Ternary logo"
              width={18}
              height={18}
              className="rounded-sm"
              priority
            />
          </span>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-foreground font-semibold">Ternary</div>
              <div className="text-[11px] text-muted-foreground">Documentation</div>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (collapsed && onToggle) {
                onToggle();
                setTimeout(() => searchRef.current?.focus(), 100);
              } else {
                searchRef.current?.focus();
              }
            }}
            aria-label="Search"
            title="Search"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/70 text-muted-foreground hover:text-foreground hover:bg-muted/40"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!collapsed && (
      <div className="space-y-2">
        <div className="mb-4">
          <input
            type="search"
            placeholder="Search"
            ref={searchRef}
            className="w-full px-3 py-2 text-sm rounded-md border border-border/60 bg-background/70 backdrop-blur placeholder:text-muted-foreground/70"
          />
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="opacity-80">Press</span>
            <kbd className="rounded border border-border/60 bg-background/60 px-1 py-0.5 text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="rounded border border-border/60 bg-background/60 px-1 py-0.5 text-[10px]">K</kbd>
          </div>
        </div>

        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Releases</div>
          <button
            onClick={() => setReleasesOpen(!releasesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/releases") && "bg-muted/50 text-foreground"
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
                        "group relative block px-2 py-1 rounded-md text-muted-foreground hover:text-foreground",
                        isActive && "font-medium text-foreground"
                      )}
                    >
                      <span className={cn(
                        "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/80 opacity-0 transition-opacity w-px",
                        isActive && "opacity-100"
                      )} />
                      {release.title}
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Templates Section */}
        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Templates</div>
          <button
            onClick={() => setTemplatesOpen(!templatesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/templates") && "bg-muted/50 text-foreground"
            )}
          >
            <span>Templates</span>
            {templatesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {templatesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {[
                { href: "/docs/templates/portal", label: "Portal Template" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted/60 font-medium text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/60 opacity-0 transition-opacity w-px",
                    pathname === item.href && "opacity-100"
                  )} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Help</div>
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/help") && "bg-muted/50 text-foreground"
            )}
          >
            <span>Help Center</span>
            {helpOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {helpOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {[
                { href: "/docs/help/nodejs", label: "Node.js" },
                { href: "/docs/help/ai-rate-limit", label: "AI Rate Limit" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted/60 font-medium text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/60 opacity-0 transition-opacity w-px",
                    pathname === item.href && "opacity-100"
                  )} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Integrations Section */}
        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Integrations</div>
          <button
            onClick={() => setIntegrationsOpen(!integrationsOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/integrations") && "bg-muted/50 text-foreground"
            )}
          >
            <span>Integrations</span>
            {integrationsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {integrationsOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {[
                { href: "/docs/integrations/github", label: "GitHub" },
                { href: "/docs/integrations/supabase", label: "Supabase" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted/60 font-medium text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/60 opacity-0 transition-opacity w-px",
                    pathname === item.href && "opacity-100"
                  )} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Policies Section */}
        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Policies</div>
          <button
            onClick={() => setPoliciesOpen(!policiesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/policies") && "bg-muted/50 text-foreground"
            )}
          >
            <span>Policies</span>
            {policiesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {policiesOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {[
                { href: "/docs/policies/privacy-policy", label: "Privacy Policy" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted/60 font-medium text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/60 opacity-0 transition-opacity w-px",
                    pathname === item.href && "opacity-100"
                  )} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Guides Section */}
        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Guides</div>
          <button
            onClick={() => setGuidesOpen(!guidesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/guides") && "bg-muted/50 text-foreground"
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
                    "group relative block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted/60 font-medium text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/60 opacity-0 transition-opacity w-px",
                    pathname === item.href && "opacity-100"
                  )} />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upgrades Section */}
        <div>
          <div className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">Upgrades</div>
          <button
            onClick={() => setUpgradesOpen(!upgradesOpen)}
            className={cn(
              "flex items-center justify-between w-full px-2 py-1 font-medium rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname.startsWith("/docs/upgrades") && "bg-muted/50 text-foreground"
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
                    "group relative block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                    pathname === item.href && "bg-muted/60 font-medium text-foreground"
                  )}
                >
                  <span className={cn(
                    "absolute left-0 top-1/2 -ml-2 h-4 -translate-y-1/2 rounded bg-primary/60 opacity-0 transition-opacity w-px",
                    pathname === item.href && "opacity-100"
                  )} />
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
              "block px-2 py-1 rounded-md hover:bg-muted/40 text-muted-foreground hover:text-foreground",
              pathname === "/docs/roadmap" && "bg-muted/60 font-medium text-foreground"
            )}
          >
            Roadmap
          </Link>
        </div>
      </div>
      )}
    </nav>
  );
}
