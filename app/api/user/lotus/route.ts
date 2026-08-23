export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// Simple endpoint: returns the current user's lotus count.
// Called on chat page mount to display the 🪷 badge.
export async function GET() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    return NextResponse.json({ lotus_count: 0 }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_limits')
    .select('lotus_count')
    .eq('email', userEmail)
    .single();

  return NextResponse.json({ lotus_count: data?.lotus_count ?? 0 });
}
