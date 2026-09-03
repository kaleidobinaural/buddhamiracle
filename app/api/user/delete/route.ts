import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { auth } from "@/auth";

/**
 * DELETE: Permanent account data deletion (GDPR Right to be Forgotten)
 * Deletes all user-generated content associated with the authenticated user.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const supabase = getSupabaseAdmin();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const userEmail = session.user.email;

    // 1. Delete all wishes
    const { error: wishesError } = await supabase
      .from('wishes')
      .delete()
      .eq('user_email', userEmail);

    if (wishesError) throw wishesError;

    // 2. Delete pillar dedications
    const { error: pillarsError } = await supabase
      .from('pillars')
      .delete()
      .eq('user_email', userEmail);
    
    // 3. Delete lotus balance / user limits
    const { error: limitsError } = await supabase
      .from('user_limits')
      .delete()
      .eq('email', userEmail);

    return NextResponse.json({ 
      success: true, 
      message: 'All your personal data has been permanently removed from the Sanctuary.' 
    });
  } catch (error: any) {
    console.error('Data deletion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
