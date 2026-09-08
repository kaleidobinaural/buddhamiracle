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

export async function POST(req: Request) {
  const session = await auth();
  const rawEmail = session?.user?.email;

  if (!rawEmail) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const amount = Number(body?.amount);

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'Invalid lotus amount' }, { status: 400 });
    }

    const userEmail = rawEmail.trim().toLowerCase();
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const isAdmin = adminEmails.includes(userEmail);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('user_limits')
      .select('id, lotus_count')
      .ilike('email', userEmail)
      .maybeSingle();

    if (error) throw error;

    const currentCount = data?.lotus_count ?? 0;
    if (!isAdmin && currentCount < amount) {
      return NextResponse.json({
        error: 'Insufficient lotuses',
        lotus_count: currentCount
      }, { status: 403 });
    }

    const newCount = isAdmin ? currentCount : Math.max(0, currentCount - amount);

    if (data?.id && !isAdmin) {
      const { error: updateError } = await supabase
        .from('user_limits')
        .update({ lotus_count: newCount })
        .eq('id', data.id);

      if (updateError) throw updateError;
    }

    return NextResponse.json({
      success: true,
      lotus_count: newCount,
      deducted: isAdmin ? 0 : amount
    });
  } catch (err: any) {
    console.error('[Lotus API Error]:', err);
    return NextResponse.json({ error: err.message || 'Failed to deduct lotus' }, { status: 500 });
  }
}
