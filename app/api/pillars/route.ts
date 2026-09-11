import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'amount';
  const type = searchParams.get('type'); // 'founder' | 'supporter'
  const showMine = searchParams.get('mine') === 'true';
  const session = await auth();
  const rawEmail = session?.user?.email;
  const userEmail = rawEmail ? rawEmail.trim().toLowerCase() : null;
  const adminView = searchParams.get('admin') === 'true';
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  try {
    const supabase = getSupabaseAdmin();
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
      query = query.ilike('user_email', userEmail);
    } else if (isAdmin && adminView) {
      // Admin sees all pillars, no filter applied
    } else if (userEmail) {
      query = query.or(`is_public.eq.true,user_email.ilike.${userEmail}`);
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
    const supabase = getSupabaseAdmin();

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
 * PATCH: User can toggle is_public on their own pillar (or admin).
 */
export async function PATCH(request: Request) {
  const session = await auth();
  const rawEmail = session?.user?.email;
  if (!rawEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userEmail = rawEmail.trim().toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = adminEmails.includes(userEmail);

  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id, is_public } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Fetch existing pillar to verify ownership
    const { data: pillar, error: fetchError } = await supabase
      .from('pillars')
      .select('id, is_public, user_email')
      .eq('id', id)
      .single();

    if (fetchError || !pillar) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const isOwner = pillar.user_email && pillar.user_email.trim().toLowerCase() === userEmail;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const nextIsPublic = typeof is_public === 'boolean' ? is_public : !pillar.is_public;

    const { data: updated, error: updateError } = await supabase
      .from('pillars')
      .update({ is_public: nextIsPublic })
      .eq('id', id)
      .select();

    if (updateError) throw updateError;
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Admin or owner can delete a pillar by ID.
 */
export async function DELETE(request: Request) {
  const session = await auth();
  const rawEmail = session?.user?.email;
  if (!rawEmail) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userEmail = rawEmail.trim().toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = adminEmails.includes(userEmail);

  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data: pillar, error: fetchError } = await supabase
      .from('pillars')
      .select('id, user_email')
      .eq('id', id)
      .single();

    if (fetchError || !pillar) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const isOwner = pillar.user_email && pillar.user_email.trim().toLowerCase() === userEmail;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('pillars')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

