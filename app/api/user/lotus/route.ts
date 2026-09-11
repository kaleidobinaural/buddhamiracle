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
    let { data, error } = await supabase
      .from('user_limits')
      .select('email, lotus_count')
      .ilike('email', userEmail)
      .maybeSingle();

    if (error) throw error;

    // Auto-create user_limits record if missing
    if (!data) {
      const today = new Date().toISOString().split('T')[0];
      const { data: newRow, error: insertError } = await supabase
        .from('user_limits')
        .insert([{ email: userEmail, chat_count: 0, last_chat_date: today, lotus_count: 0 }])
        .select('email, lotus_count')
        .single();
      if (insertError) throw insertError;
      data = newRow;
    }

    const currentCount = data?.lotus_count ?? 0;
    if (!isAdmin && currentCount < amount) {
      return NextResponse.json({
        error: 'Insufficient lotuses',
        lotus_count: currentCount
      }, { status: 403 });
    }

    const newCount = isAdmin ? currentCount : Math.max(0, currentCount - amount);

    if (data?.email && !isAdmin) {
      const { error: updateError } = await supabase
        .from('user_limits')
        .update({ lotus_count: newCount })
        .ilike('email', userEmail);

      if (updateError) throw updateError;

      // ── If this was a lotus offering (not a chat spend), record as a pillar supporter ──
      const reason: string = body?.reason || '';
      if (reason.startsWith('offering_')) {
        const tierMap: Record<string, number> = {
          offering_wish: 10,
          offering_wisdom: 54,
          offering_sanctuary: 333,
        };
        const offeringAmount = tierMap[reason] ?? amount;
        const userName = session?.user?.name || 'Anonymous Pilgrim';
        // Best-effort insert — if pillars table doesn't exist or insert fails, ignore
        await supabase.from('pillars').insert([{
          user_email: userEmail,
          name: userName,
          amount: offeringAmount,
          pillar_type: 'donor',
          is_public: true,
          message: `Lotus Offering — ${offeringAmount} lotuses`,
        }]).then(() => {}).catch(() => {});
      }
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
