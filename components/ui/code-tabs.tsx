"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CodeTab = {
  id: string;
  label: string;
  code: string;
};

interface CodeTabsProps {
  tabs: CodeTab[];
  initialId?: string;
  language?: string; // for future syntax highlighting
  className?: string;
}

export function CodeTabs({ tabs, initialId, className }: CodeTabsProps) {
  const defaultId = initialId ?? (tabs[0] ? tabs[0].id : "");
  const [active, setActive] = React.useState(defaultId);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!tabs.find((t) => t.id === active)) setActive(defaultId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs]);

  const handleCopy = async () => {
    if (!activeTab) return;
    try {
      await navigator.clipboard.writeText(activeTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  if (!activeTab) return null;

  return (
    <div className={cn("rounded-xl border border-border/60 bg-background/60 backdrop-blur", className)}>
      <div className="flex items-center justify-between px-2 pt-2">
        <div className="inline-flex rounded-lg border border-border/60 bg-background/70 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                t.id === active
                  ? "bg-muted/60 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className={"px-2 py-1 text-xs rounded border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/40"}
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="px-3 pb-3 pt-2">
        <pre className="m-0 overflow-x-auto rounded-lg bg-background/60 p-3 text-sm">
          <code>{activeTab.code}</code>
        </pre>
      </div>
    </div>
  );
}
