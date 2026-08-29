import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// ============================================================
// POST /api/inquiry
// Dual-save: Supabase (quiesan_inquiries) + optional GAS sheet
// ============================================================

const GAS_URL = process.env.QUIESAN_GAS_URL || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message, type = 'VVIP' } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 422 });
    }

    const supabase = getSupabaseAdmin();

    // ★ Save to Supabase
    const { error: dbError } = await supabase
      .from('quiesan_inquiries')
      .insert([{
        name,
        email,
        message,
        inquiry_type: type,
        created_at: new Date().toISOString(),
      }]);

    if (dbError) {
      console.error('[Inquiry] Supabase insert failed:', dbError.message);
      // Non-fatal: continue to GAS save even if Supabase fails
    }

    // ★ Dual-save to Google Apps Script (backup)
    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message, type }),
        });
      } catch (gasErr) {
        console.warn('[Inquiry] GAS save failed (non-fatal):', gasErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Inquiry] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
