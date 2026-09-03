import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'amount';
  const type = searchParams.get('type'); // 'founder' | 'supporter'
  const showMine = searchParams.get('mine') === 'true';
  const session = await auth();
  const userEmail = session?.user?.email;
  const adminView = searchParams.get('admin') === 'true';
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  try {
    let query = supabase.from('pillars').select('*');

    if (sort === 'amount') {
      query = query.order('amount', { ascending: false }).order('created_at', { ascending: false });
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Type Filter (founder vs supporter)
    if (type === 'founder') {
      query = query.in('pillar_type', ['gold', 'marble', 'stone']);
    } else if (type === 'supporter') {
      query = query.eq('pillar_type', 'donor');
    }

    // Privacy Logic:
    if (showMine && userEmail) {
      query = query.eq('user_email', userEmail);
    } else if (isAdmin && adminView) {
      // Admin sees all pillars, no filter applied
    } else if (userEmail) {
      query = query.or(`is_public.eq.true,user_email.eq.${userEmail}`);
    } else {
      query = query.eq('is_public', true);
    }

    // Search Logic:
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { name, amount, message, is_public, pillar_type } = body;

    const { data, error } = await supabase
      .from('pillars')
      .insert([
        {
          name,
          amount: amount || 0,
          message,
          user_email: session?.user?.email || null,
          is_public: is_public ?? true,
          pillar_type: pillar_type || 'stone',
        },
      ])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Admin only. Deletes a pillar by ID.
 */
export async function DELETE(request: Request) {
  const { getSupabaseAdmin } = await import('@/lib/supabase');
  const supabase = getSupabaseAdmin();
  const session = await auth();
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  
  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabase.from('pillars').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
