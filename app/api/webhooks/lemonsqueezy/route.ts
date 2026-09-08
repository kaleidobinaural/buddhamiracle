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
    .maybeSingle();

  if (existing) {
    console.log(`[Webhook] Duplicate event ${eventId} — skipping.`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Extract order data
  const orderData = payload?.data?.attributes;
  const firstItem = orderData?.first_order_item;
  const productId = String(firstItem?.product_id ?? '').trim();
  const rawEmail = String(orderData?.user_email ?? '').trim();
  const customerEmail = rawEmail.toLowerCase();
  const customerName: string = orderData?.user_name ?? 'Anonymous';
  const orderStatus: string = orderData?.status ?? '';

  console.log('[Webhook] Received order:', {
    eventId,
    productId,
    customerEmail,
    orderStatus,
  });

  if (orderStatus !== 'paid') {
    return NextResponse.json({ received: true, skipped: true, reason: 'Order not paid.' });
  }

  if (!customerEmail) {
    console.error('[Webhook] No customer email in order.');
    return NextResponse.json({ error: 'No customer email.' }, { status: 422 });
  }

  // Strictly match by Product ID from environment variables
  const envCandle = (process.env.LEMONSQUEEZY_PRODUCT_ID_CANDLE || '').replace(/['"]/g, '').trim();
  const envLotus  = (process.env.LEMONSQUEEZY_PRODUCT_ID_LOTUS || '').replace(/['"]/g, '').trim();
  const envMala   = (process.env.LEMONSQUEEZY_PRODUCT_ID_MALA || '').replace(/['"]/g, '').trim();

  let lotusToGrant = 0;
  let isMala = false;

  if (envCandle && productId === envCandle) {
    lotusToGrant = 54;
  } else if (envLotus && productId === envLotus) {
    lotusToGrant = 333;
  } else if (envMala && productId === envMala) {
    lotusToGrant = 1080;
    isMala = true;
  }

  if (lotusToGrant === 0) {
    console.warn(`[Webhook] Unknown product ID: "${productId}". Configured product IDs:`, {
      candle: envCandle,
      lotus: envLotus,
      mala: envMala,
    });
    return NextResponse.json({ received: true, skipped: true, reason: 'Unknown product.' });
  }

  // ★ Upsert user record case-insensitively and add lotus credits
  const { data: existingUsers, error: fetchUserError } = await supabase
    .from('user_limits')
    .select('email, lotus_count')
    .ilike('email', customerEmail);

  if (fetchUserError) {
    console.error('[Webhook] Error querying user_limits:', fetchUserError);
  }

  const existing_user = existingUsers?.[0];

  if (existing_user) {
    const newCount = (existing_user.lotus_count ?? 0) + lotusToGrant;
    const { error: updateError } = await supabase
      .from('user_limits')
      .update({
        lotus_count: newCount,
        email: customerEmail, // normalize to lowercase
      })
      .ilike('email', customerEmail);

    if (updateError) {
      console.error('[Webhook] Failed to update user_limits:', updateError);
      return NextResponse.json({ error: 'DB update failed.' }, { status: 500 });
    }
    console.log(`[Webhook] ✅ Updated user (${customerEmail}): ${existing_user.lotus_count} -> ${newCount} lotuses`);
  } else {
    const { error: insertError } = await supabase
      .from('user_limits')
      .insert([{ email: customerEmail, lotus_count: lotusToGrant, chat_count: 0 }]);

    if (insertError) {
      console.error('[Webhook] Failed to insert user_limits:', insertError);
      return NextResponse.json({ error: 'DB insert failed.' }, { status: 500 });
    }
    console.log(`[Webhook] ✅ Inserted new user ${customerEmail} with ${lotusToGrant} lotuses`);
  }

  // ★ AUTO-PILLAR: If this product qualifies (Mala package), register on Supporter's Wall
  if (isMala) {
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
    } else {
      console.log(`[Webhook] ✅ Pillar registered for ${customerName} (${customerEmail})`);
    }
  }

  // Log this event to prevent duplicate processing
  await supabase.from('webhook_logs').insert([{
    event_id: eventId,
    event_type: eventName,
  }]);

  console.log(`[Webhook] ✅ Successfully granted ${lotusToGrant} lotus to ${customerEmail} (product: ${productId})`);
  return NextResponse.json({ received: true, granted: lotusToGrant, email: customerEmail });
}
