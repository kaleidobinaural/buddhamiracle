export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// ============================================================
// Lemon Squeezy Webhook — Charges lotus credits on purchase.
// Products must be registered in Lemon Squeezy dashboard:
//   • LEMONSQUEEZY_PRODUCT_ID_20  → grants 20 lotus
//   • LEMONSQUEEZY_PRODUCT_ID_60  → grants 60 lotus
// ============================================================

const LOTUS_PACKAGES: Record<string, number> = {
  [process.env.LEMONSQUEEZY_PRODUCT_ID_20 || '__unset_20__']: 20,
  [process.env.LEMONSQUEEZY_PRODUCT_ID_60 || '__unset_60__']: 60,
};

/**
 * Verifies the Lemon Squeezy webhook signature using HMAC-SHA256.
 * Prevents fake/forged payment notifications.
 */
async function verifySignature(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Webhook] LEMONSQUEEZY_WEBHOOK_SECRET is not set!');
    return false;
  }
  const signature = req.headers.get('x-signature');
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');

  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // ★ SECURITY: Verify signature before processing anything
  const isValid = await verifySignature(req, rawBody);
  if (!isValid) {
    console.warn('[Webhook] Invalid signature — potential forgery attempt.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const eventName: string = payload?.meta?.event_name ?? '';
  const eventId: string = payload?.meta?.custom_data?.event_id ?? payload?.data?.id ?? '';

  // Only process successful order events
  if (eventName !== 'order_created') {
    return NextResponse.json({ received: true, skipped: true });
  }

  const supabase = getSupabaseAdmin();

  // ★ IDEMPOTENCY: Check if this event was already processed
  const { data: existing } = await supabase
    .from('webhook_logs')
    .select('id')
    .eq('event_id', eventId)
    .single();

  if (existing) {
    console.log(`[Webhook] Duplicate event ${eventId} — skipping.`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Extract order data
  const orderData = payload?.data?.attributes;
  const productId = String(orderData?.first_order_item?.product_id ?? '');
  const customerEmail: string = orderData?.user_email ?? '';
  const orderStatus: string = orderData?.status ?? '';

  if (orderStatus !== 'paid') {
    return NextResponse.json({ received: true, skipped: true, reason: 'Order not paid.' });
  }

  if (!customerEmail) {
    console.error('[Webhook] No customer email in order.');
    return NextResponse.json({ error: 'No customer email.' }, { status: 422 });
  }

  const lotusToGrant = LOTUS_PACKAGES[productId] ?? 0;
  if (lotusToGrant === 0) {
    console.warn(`[Webhook] Unknown product ID: ${productId}`);
    return NextResponse.json({ received: true, skipped: true, reason: 'Unknown product.' });
  }

  // ★ Upsert user record and add lotus credits atomically
  const { data: existing_user } = await supabase
    .from('user_limits')
    .select('lotus_count')
    .eq('email', customerEmail)
    .single();

  if (existing_user) {
    await supabase
      .from('user_limits')
      .update({ lotus_count: (existing_user.lotus_count ?? 0) + lotusToGrant })
      .eq('email', customerEmail);
  } else {
    await supabase
      .from('user_limits')
      .insert([{ email: customerEmail, lotus_count: lotusToGrant, chat_count: 0 }]);
  }

  // Log this event to prevent duplicate processing
  await supabase.from('webhook_logs').insert([{
    event_id: eventId,
    event_type: eventName,
  }]);

  console.log(`[Webhook] ✅ Granted ${lotusToGrant} lotus to ${customerEmail} (product: ${productId})`);
  return NextResponse.json({ received: true, granted: lotusToGrant });
}
