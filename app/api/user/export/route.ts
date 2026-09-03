import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

/**
 * GET: GDPR Data Portability - Export all user data as JSON
 * Returns wishes + pillars as a downloadable JSON file.
 */
export async function GET() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // Fetch all user's wishes
    const { data: wishes, error: wishesError } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_email', userEmail);

    if (wishesError) throw wishesError;

    // Fetch all user's pillars
    const { data: pillars, error: pillarsError } = await supabase
      .from('pillars')
      .select('*')
      .eq('user_email', userEmail);

    if (pillarsError) throw pillarsError;

    const exportData = {
      exported_at: new Date().toISOString(),
      user_email: userEmail,
      wishes: wishes || [],
      pillars: pillars || [],
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="my_sanctuary_data_${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
