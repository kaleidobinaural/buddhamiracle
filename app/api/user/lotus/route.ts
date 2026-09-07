import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

// Simple endpoint: returns the current user's lotus count.
// Called on chat page mount to display the lotus badge.
export async function GET() {
  const session = await auth();
  const rawEmail = session?.user?.email;

  if (!rawEmail) {
    return NextResponse.json({ lotus_count: 0 }, { status: 401 });
  }

  const userEmail = rawEmail.trim().toLowerCase();
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('user_limits')
    .select('lotus_count')
    .ilike('email', userEmail)
    .maybeSingle();

  return NextResponse.json({ lotus_count: data?.lotus_count ?? 0 });
}
