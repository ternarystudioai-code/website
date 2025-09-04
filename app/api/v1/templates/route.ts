// /api/v1/templates must mirror Dyad's public API: returns ApiTemplate[]
// ApiTemplate shape: { githubOrg, githubRepo, title, description, imageUrl }
import { NextRequest, NextResponse } from 'next/server';
import { localTemplatesData } from '@/data/templates';

type ApiTemplate = {
  githubOrg: string;
  githubRepo: string;
  title: string;
  description: string;
  imageUrl: string;
};

function toApiTemplate(t: { id: string; title: string; description: string; imageUrl: string }) {
  // Expect id in the form ORG/REPO for community templates
  const [githubOrg, githubRepo] = t.id.split('/');
  if (!githubOrg || !githubRepo) return null;
  const item: ApiTemplate = {
    githubOrg,
    githubRepo,
    title: t.title,
    description: t.description,
    imageUrl: t.imageUrl,
  };
  return item;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Build ApiTemplate[] from community templates (non-official, id like org/repo)
    const apiTemplates = localTemplatesData
      .filter((t) => !t.isOfficial && t.id.includes('/'))
      .map(toApiTemplate)
      .filter((x): x is ApiTemplate => !!x);

    if (id) {
      // Client may query by id in the form org/repo
      const [org, repo] = id.split('/');
      const match = apiTemplates.find(
        (t) => t.githubOrg === org && t.githubRepo === repo,
      );
      if (!match) {
        return NextResponse.json({ error: `Template ${id} not found` }, { status: 404 });
      }
      return NextResponse.json(match);
    }

    return NextResponse.json(apiTemplates);
  } catch (error) {
    console.error('Templates API v1 error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch templates' },
      { status: 500 },
    );
  }
}
