"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface TocItem {
  id: string;
  text: string;
  level: number; // 1, 2, 3
}

export default function DocsToc() {
  const pathname = usePathname();
  const [items, setItems] = React.useState<TocItem[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");

  // Build TOC from headings in the main docs content
  React.useEffect(() => {
    const container = document.querySelector(".docs-content");
    if (!container) return;

    const headings = Array.from(
      container.querySelectorAll<HTMLElement>("h1, h2, h3")
    );

    const slugify = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    const newItems: TocItem[] = headings.map((el) => {
      if (!el.id) {
        const base = slugify(el.innerText);
        // ensure uniqueness
        let id = base;
        let i = 1;
        while (document.getElementById(id)) {
          id = `${base}-${i++}`;
        }
        el.id = id;
      }
      const level = el.tagName === "H1" ? 1 : el.tagName === "H2" ? 2 : 3;
      return { id: el.id, text: el.innerText, level };
    });

    setItems(newItems);
  }, [pathname]);

  // Observe headings for active highlight
  React.useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    items.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="sticky top-8 hidden xl:block w-64">
      <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80"><path fill="currentColor" d="M4 5h16v2H4zm0 6h10v2H4zm0 6h16v2H4z"/></svg>
          <span>On this page</span>
        </div>
        <nav aria-label="Table of contents">
          <ul className="relative ml-3 pl-3 text-sm text-muted-foreground">
            <span className="absolute left-0 top-0 bottom-0 w-px bg-border/60 rounded" aria-hidden />
            {items.map((item) => {
              const indent = item.level === 1 ? "" : item.level === 2 ? "ml-3" : "ml-6 text-[12px]";
              const isActive = activeId === item.id;
              return (
                <li key={item.id} className={`relative py-1 ${indent}`}>
                  <a
                    href={`#${item.id}`}
                    className={`group inline-flex items-center gap-2 rounded px-1 py-0.5 transition-colors ${
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isActive ? "bg-primary" : "bg-border"
                      }`}
                      aria-hidden
                    />
                    <span className={item.level === 1 ? "font-semibold" : ""}>{item.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
