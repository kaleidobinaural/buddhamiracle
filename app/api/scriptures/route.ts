import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// Cache on Vercel CDN Edge for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('scriptures')
      .select('id, content, metadata, translations');

    if (error) {
      console.error('[Scriptures API] Supabase query error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    console.error('[Scriptures API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
