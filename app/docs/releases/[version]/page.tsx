"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";

interface ReleasePageProps {
  params: Promise<{
    version: string;
  }>;
}

export default function ReleasePage({ params }: ReleasePageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { version } = React.use(params);
  const [CustomComponent, setCustomComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      setCustomComponent(null);

      // TSX-only: load the version-specific component, 404 if missing
      try {
        const mod = await import(`@/data/releases/components/${version}.tsx`);
        if (!cancelled) {
          const Comp = mod.default || (mod as any).Release || null;
          if (!Comp) throw new Error("Component export missing");
          setCustomComponent(() => Comp);
        }
      } catch (err) {
        if (!cancelled) {
          setError('not-found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [version]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (CustomComponent) {
    return <CustomComponent />;
  }

  if (error === 'not-found' || !CustomComponent) {
    notFound();
  }
  return null;
}
