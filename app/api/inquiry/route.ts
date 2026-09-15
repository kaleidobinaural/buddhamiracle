import { NextRequest, NextResponse, after } from 'next/server';
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

    // ★ Save to Supabase (primary DB - fast ~100ms)
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

    // ★ Dual-save to Google Apps Script (backup & email notification)
    // GAS takes 4-8 seconds due to container boot, sheet write, and MailApp.sendEmail.
    // Using after() decouples GAS execution so the user receives a response in <200ms
    // while GAS reliably finishes writing to Google Sheets and sending emails in background.
    if (GAS_URL) {
      const isVvip = type.toLowerCase() === 'vvip' || type.toLowerCase().includes('vvip');
      const isPremium = type.toLowerCase().includes('premium');
      const subject = isVvip
        ? 'VVIP Private Journey'
        : isPremium
          ? 'Premium Collection'
          : (type === 'Support' ? 'Payment Support (결제방법 문의)' : (type || '일반 문의'));

      const params = new URLSearchParams();
      params.append('subject', subject);
      params.append('name', name);
      params.append('email', email);
      params.append('message', message);
      params.append('amount', '');

      after(async () => {
        try {
          await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
        } catch (gasErr) {
          console.warn('[Inquiry] Background GAS save failed (non-fatal):', gasErr);
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Inquiry] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
