"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Entry {
  href: string;
  title: string;
  subtitle?: string;
}

// Ordered docs map for prev/next. Add to this list as new pages are created.
const DOCS_ORDER: Entry[] = [
  { href: "/docs", title: "Documentation", subtitle: "Overview and quick links" },
  // Guides
  { href: "/docs/guides/debugging", title: "Debugging", subtitle: "Techniques to isolate and fix issues" },
  { href: "/docs/guides/ai-rules", title: "AI Rules", subtitle: "Customize and guide AI behavior" },
  { href: "/docs/guides/mobile-app", title: "Mobile App", subtitle: "Build a mobile app with Capacitor" },
  // Templates
  { href: "/docs/templates/portal", title: "Portal Template", subtitle: "Full‑stack template with migrations" },
  // Integrations
  { href: "/docs/integrations/github", title: "GitHub Integration", subtitle: "Connect your repository" },
  { href: "/docs/integrations/supabase", title: "Supabase Integration", subtitle: "Auth, database, storage" },
  // Upgrades
  { href: "/docs/upgrades/select-component", title: "Select Component", subtitle: "Jump from UI to source" },
  // Help
  { href: "/docs/help/ai-rate-limit", title: "AI Rate Limit", subtitle: "Resolve rate limit issues" },
  { href: "/docs/help/nodejs", title: "Node.js", subtitle: "Fix Node.js install/detection" },
  // Policies & Roadmap
  { href: "/docs/policies/privacy-policy", title: "Privacy Policy", subtitle: "Data collection and options" },
  { href: "/docs/roadmap", title: "Roadmap", subtitle: "What we're building next" },
];

function getPrevNext(pathname: string) {
  const idx = DOCS_ORDER.findIndex((e) => e.href === pathname);
  if (idx === -1) return { prev: undefined, next: undefined };
  return {
    prev: DOCS_ORDER[idx - 1],
    next: DOCS_ORDER[idx + 1],
  };
}

export default function DocsFooter() {
  const pathname = usePathname();
  const { prev, next } = getPrevNext(pathname);

  if (!prev && !next) return null;

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prev && (
          <Link
            href={prev.href}
            className="group rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4 transition-all hover:bg-muted/40 hover:-translate-y-0.5"
          >
            <div className="text-sm font-medium text-foreground">‹ {prev.title}</div>
            {prev.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{prev.subtitle}</p>
            )}
          </Link>
        )}
        {next && (
          <Link
            href={next.href}
            className="group rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4 transition-all hover:bg-muted/40 hover:-translate-y-0.5 text-right md:text-left"
          >
            <div className="text-sm font-medium text-foreground">{next.title} ›</div>
            {next.subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{next.subtitle}</p>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
