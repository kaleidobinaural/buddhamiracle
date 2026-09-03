import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from "@/auth";

// ─── Simple in-process rate limiter ─────────────────────────────────────────
// Stores { count, resetAt } per email. Resets every RATE_WINDOW_MS.
const RATE_WINDOW_MS = 60_000; // 1 minute window
const RATE_LIMIT     = 5;      // max 5 wishes per window

const wishRateMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const entry = wishRateMap.get(email);
  if (!entry || now > entry.resetAt) {
    wishRateMap.set(email, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET: Fetch wishes (Public ones + User's private ones)
 */
export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'date';
  const showMine = searchParams.get('mine') === 'true';
  const adminView = searchParams.get('admin') === 'true';
  const session = await auth();
  const userEmail = session?.user?.email;
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  try {
    let query = supabase.from('wishes').select('*');

    // Sorting Logic
    if (sort === 'likes') {
      query = query.order('likes_count', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Filter Logic:
    if (showMine && userEmail) {
      query = query.eq('user_email', userEmail);
    } else if (isAdmin && adminView) {
      // Admin dashboard sees all wishes, no privacy filter applied
    } else {
      if (userEmail) {
        query = query.or(`is_public.eq.true,user_email.eq.${userEmail}`);
      } else {
        query = query.eq('is_public', true);
      }
    }

    // Search Logic:
    if (search) {
      query = query.or(`content.ilike.%${search}%,user_name.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseAdmin();
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required to light up a wish.' }, { status: 401 });
  }

  const likerEmail = session.user.email!;
  const body = await request.json();

  try {
    const { id, action } = body;
    if (!id || !action) return NextResponse.json({ error: 'ID and action required' }, { status: 400 });

    // Toggle public/private - owner only
    if (action === 'toggle_public') {
      const userEmail = session?.user?.email;
      if (!userEmail) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      // Fetch current state
      const { data: wish, error: fetchError } = await supabase
        .from('wishes').select('is_public, user_email').eq('id', id).single();
      if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
      if (wish.user_email !== userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      const { data: updated, error: updateError } = await supabase
        .from('wishes').update({ is_public: !wish.is_public }).eq('id', id).select();
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
      return NextResponse.json({ success: true, data: updated });
    }

    if (action !== 'like' && action !== 'unlike') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // ── Duplicate-like prevention via wish_likes table ──────────────────────
    // Check if a like record already exists for this user + wish pair
    const { data: existingLike } = await supabase
      .from('wish_likes')
      .select('id')
      .eq('wish_id', id)
      .eq('user_email', likerEmail)
      .maybeSingle();

    if (action === 'like' && existingLike) {
      return NextResponse.json({ error: 'You have already lit up this wish.' }, { status: 409 });
    }
    if (action === 'unlike' && !existingLike) {
      return NextResponse.json({ error: 'You have not lit up this wish.' }, { status: 409 });
    }

    // Insert or delete the like record
    if (action === 'like') {
      const { error: likeInsertError } = await supabase
        .from('wish_likes')
        .insert([{ wish_id: id, user_email: likerEmail }]);
      if (likeInsertError) throw likeInsertError;
    } else {
      const { error: likeDeleteError } = await supabase
        .from('wish_likes')
        .delete()
        .eq('wish_id', id)
        .eq('user_email', likerEmail);
      if (likeDeleteError) throw likeDeleteError;
    }
    // ────────────────────────────────────────────────────────────────────────

    const delta = action === 'like' ? 1 : -1;

    // Atomic increment via raw SQL — prevents race condition
    const { data, error } = await supabase.rpc('adjust_wish_likes', {
      p_id: id,
      p_delta: delta,
    });

    if (error) {
      // Fallback: if RPC doesn't exist yet, use safe select-then-update
      const { data: wish, error: fetchError } = await supabase
        .from('wishes')
        .select('likes_count')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const newCount = Math.max(0, (wish?.likes_count || 0) + delta);
      const { data: updated, error: updateError } = await supabase
        .from('wishes')
        .update({ likes_count: newCount })
        .eq('id', id)
        .select();
      if (updateError) throw updateError;
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Save a new wish with privacy option
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin();
  const session = await auth();

  // Authentication required to post a wish
  if (!session?.user) {
    return NextResponse.json({ error: 'Sign in to inscribe your wish upon the roof.' }, { status: 401 });
  }

  // Rate limiting — max 5 wishes per minute per user
  const userEmail = session.user.email!;
  if (isRateLimited(userEmail)) {
    return NextResponse.json(
      { error: 'Too many wishes sent. Please wait a moment before inscribing another.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { content, user_name, color, is_public } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Wish content is required' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Wish is too long (max 500 characters)' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('wishes')
      .insert([{
        content: content.trim(),
        user_name: user_name || session.user.name || 'Anonymous',
        user_email: session.user.email,
        is_public: is_public ?? true,
        color: color || '#ffcc00'
      }])
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Owner or Admin can delete a wish by ID.
 */
export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const session = await auth();
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const userEmail = session?.user?.email;
  
  if (!userEmail) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const isAdmin = adminEmails.includes(userEmail);

    // Fetch wish to check ownership
    const { data: wish, error: fetchError } = await supabase
      .from('wishes').select('user_email').eq('id', id).single();
    if (fetchError) return NextResponse.json({ error: 'Wish not found' }, { status: 404 });

    if (!isAdmin && wish.user_email !== userEmail) {
      return NextResponse.json({ error: 'Unauthorized. You can only delete your own wishes.' }, { status: 403 });
    }

    const { error } = await supabase.from('wishes').delete().eq('id', id);
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
