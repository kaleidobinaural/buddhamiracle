import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();
  try {

    // 1. Insert a test wish
    const { data: insertData, error: insertError } = await supabase
      .from('wishes')
      .insert([
        { text: 'May this digital sanctuary bring peace to all.', author: 'System Test' }
      ])
      .select();

    if (insertError) {
      // If table doesn't exist, we'll catch it here
      return NextResponse.json({ 
        success: false, 
        message: 'Insert failed. Make sure to run the SQL schema first!',
        error: insertError 
      }, { status: 500 });
    }

    // 2. Fetch all wishes to verify
    const { data: wishes, error: fetchError } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection verified!',
      inserted: insertData,
      totalWishes: wishes?.length,
      recentWishes: wishes?.slice(0, 5)
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
