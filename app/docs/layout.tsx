"use client";

import { DocsNav } from "@/components/docs-nav";
import DocsToc from "@/components/docs-toc";
import DocsFooter from "@/components/docs-footer";
import { useSearchParams } from "next/navigation";
import React from "react";
import { PanelLeft, Search } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const [collapsed, setCollapsed] = React.useState(false);
  const [focusSearchTick, setFocusSearchTick] = React.useState(0);

  // Persist collapse state
  React.useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('docs_sidebar_collapsed') : null;
    if (saved) setCollapsed(saved === '1');
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      if (typeof window !== 'undefined') {
        localStorage.setItem('docs_sidebar_collapsed', next ? '1' : '0');
      }
      return next;
    });
  };

  const openAndFocusSearch = () => {
    setCollapsed(false);
    // Nudge DocsNav to focus the search after it mounts/expands
    setTimeout(() => setFocusSearchTick((t) => t + 1), 120);
  };

  return (
    <div className={embed ? "min-h-screen" : "flex min-h-screen w-full relative bg-black"}>
      {/* Subtle top radial glow to match hero */}
      {!embed && (
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226,232,240,0.12), transparent 60%), #000000",
          }}
        />
      )}

      {/* Sidebar: sticky/non-scrolling, collapsible */}
      {!embed && (
        <aside
          className={
            (collapsed
              ? "w-0 pointer-events-none border-transparent bg-transparent"
              : "w-64 border-border/60 bg-background/70 supports-[backdrop-filter]:bg-background/60 backdrop-blur") +
            " shrink-0 border-r transition-[width] duration-300 ease-out"
          }
          aria-hidden={collapsed}
        >
          <div className="sticky top-0 h-screen flex flex-col">
            <div className="flex-1 overflow-hidden">
              <DocsNav collapsed={collapsed} onToggle={toggleCollapsed} focusSearchTick={focusSearchTick} />
            </div>
          </div>
        </aside>
      )}

      {/* Floating controls when collapsed */}
      {!embed && collapsed && (
        <div className="fixed left-6 top-6 z-[9999] flex items-center gap-2">
          <button
            onClick={toggleCollapsed}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={openAndFocusSearch}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            aria-label="Search"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main content: grid with right-side TOC on xl */}
      <main className={embed ? "p-6 max-w-3xl mx-auto" : "flex-1 overflow-y-auto p-8"}>
        {embed ? (
          <div className="docs-content mx-auto max-w-3xl">{children}</div>
        ) : (
          <div className="mx-auto w-full max-w-6xl xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-8">
            <div className="docs-content mx-auto max-w-3xl space-y-8">
              {children}
              <DocsFooter />
            </div>
            <div className="mt-8 xl:mt-0">
              <DocsToc />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
