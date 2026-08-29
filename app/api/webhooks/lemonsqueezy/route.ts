import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import crypto from 'crypto';

// ============================================================
// Lemon Squeezy Webhook — Charges lotus credits on purchase.
// Products must be registered in Lemon Squeezy dashboard:
//   • LEMONSQUEEZY_PRODUCT_ID_CANDLE  → grants 54 lotus  (🕯️ $5)
//   • LEMONSQUEEZY_PRODUCT_ID_LOTUS   → grants 333 lotus (🪷 $25)
//   • LEMONSQUEEZY_PRODUCT_ID_MALA    → grants 1080 lotus (📿 $108) + auto-pillar
// ============================================================

const LOTUS_PACKAGES: Record<string, number> = {
  [process.env.LEMONSQUEEZY_PRODUCT_ID_CANDLE || '__unset_candle__']: 54,
  [process.env.LEMONSQUEEZY_PRODUCT_ID_LOTUS   || '__unset_lotus__']: 333,
  [process.env.LEMONSQUEEZY_PRODUCT_ID_MALA    || '__unset_mala__']: 1080,
};

// Product IDs that trigger automatic Pillar (Supporter's Wall) registration
const PILLAR_PRODUCTS = new Set([
  process.env.LEMONSQUEEZY_PRODUCT_ID_MALA || '__unset_mala__',
]);

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
  const customerName: string = orderData?.user_name ?? 'Anonymous';
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

  // ★ AUTO-PILLAR: If this product qualifies, register on Supporter's Wall
  if (PILLAR_PRODUCTS.has(productId)) {
    const { error: pillarError } = await supabase
      .from('pillars')
      .insert([{
        name: customerName,
        email: customerEmail,
        message: 'May peace and wisdom fill all beings. 📿',
        amount: 108,
        pillar_type: 'donor',
        created_at: new Date().toISOString(),
      }]);

    if (pillarError) {
      console.error('[Webhook] Failed to register pillar:', pillarError.message);
      // Non-fatal: lotus is already granted, just log the pillar failure
    } else {
      console.log(`[Webhook] ✅ Pillar registered for ${customerName} (${customerEmail})`);
    }
  }

  // Log this event to prevent duplicate processing
  await supabase.from('webhook_logs').insert([{
    event_id: eventId,
    event_type: eventName,
  }]);

  console.log(`[Webhook] ✅ Granted ${lotusToGrant} lotus to ${customerEmail} (product: ${productId})`);
  return NextResponse.json({ received: true, granted: lotusToGrant });
}
