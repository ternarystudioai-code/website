// Compatibility alias: /api/v1/releases/[version] mirrors /api/releases/[version]
import { NextRequest, NextResponse } from 'next/server';
import { releases } from '@/data/releases/manifest';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ version: string }> },
) {
  try {
    const { version } = await params;
    const meta = releases.find(
      (r) => r.version === version || r.slug === version,
    );
    if (!meta) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }

    return NextResponse.json({
      version: meta.version,
      title: meta.title,
      subtitle: meta.subtitle,
      slug: meta.slug,
      component: meta.component,
    });
  } catch (error) {
    console.error('Error reading release from manifest (v1):', error);
    return NextResponse.json({ error: 'Failed to load release' }, { status: 500 });
  }
}
