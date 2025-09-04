"use client";

import { DocsNav } from "@/components/docs-nav";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";
  const [collapsed, setCollapsed] = React.useState(false);

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

  return (
    <div className={embed ? "min-h-screen" : "flex h-screen"}>
      {/* Sidebar: sticky/non-scrolling, collapsible */}
      {!embed && (
        <aside className={(collapsed ? "w-12" : "w-64") + " shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"}>
          <div className="sticky top-0 h-screen flex flex-col">
            <div className="p-2 flex items-center justify-end">
              <button
                onClick={toggleCollapsed}
                className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? ">" : "<"}
              </button>
            </div>
            <div className={"flex-1 overflow-hidden " + (collapsed ? "hidden" : "block") }>
              <DocsNav />
            </div>
          </div>
        </aside>
      )}

      {/* Main content: its own scroll container */}
      <main className={embed ? "p-6 max-w-3xl mx-auto" : "flex-1 overflow-y-auto p-8"}>
        <div className="mx-auto max-w-3xl">
          {children}
        </div>
      </main>
    </div>
  );
}
