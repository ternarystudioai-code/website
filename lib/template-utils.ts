// Template utilities for local backend (no external requests)
// Mirrors ternary local data from ternary/src/shared/templates.ts

import type { Template as LocalTemplate } from "@/data/templates";
import { localTemplatesData } from "@/data/templates";

export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  isOfficial: boolean;
  isExperimental?: boolean;
  requiresNeon?: boolean;
}

// In-memory cache for local templates (optional but keeps API consistent)
let templatesCache: Template[] | null = null;

function fromLocal(t: LocalTemplate): Template {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    imageUrl: t.imageUrl,
    githubUrl: t.githubUrl,
    isOfficial: t.isOfficial,
    isExperimental: t.isExperimental,
    requiresNeon: t.requiresNeon,
  };
}

export async function fetchApiTemplates(): Promise<Template[]> {
  if (templatesCache) return templatesCache;
  // Map ternary local data directly; no network calls
  templatesCache = localTemplatesData.map(fromLocal);
  return templatesCache;
}

export async function getTemplateById(templateId: string): Promise<Template | null> {
  const all = await fetchApiTemplates();
  return all.find((t) => t.id === templateId) || null;
}

export function clearTemplateCache(): void {
  templatesCache = null;
}
