// Compatibility alias: /api/v1/releases mirrors /api/releases
import { NextResponse } from 'next/server';
import { releases } from '@/data/releases/manifest';

export async function GET() {
  try {
    const sorted = [...releases].sort((a, b) => {
      const parse = (v: string) => v.split('.').map((n) => parseInt(n.replace(/[^\d]/g, '')) || 0);
      const av = parse(a.version);
      const bv = parse(b.version);
      for (let i = 0; i < Math.max(av.length, bv.length); i++) {
        const ai = av[i] || 0;
        const bi = bv[i] || 0;
        if (ai !== bi) return bi - ai;
      }
      const ab = a.version.includes('beta');
      const bb = b.version.includes('beta');
      if (ab !== bb) return ab ? 1 : -1;
      return 0;
    });

    return NextResponse.json({ releases: sorted });
  } catch (error) {
    console.error('Error reading releases manifest (v1):', error);
    return NextResponse.json({ error: 'Failed to load releases' }, { status: 500 });
  }
}
