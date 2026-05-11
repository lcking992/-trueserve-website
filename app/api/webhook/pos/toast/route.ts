import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientIp, checkRateLimit } from '@/lib/rateLimiter';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logAuditAction } from '@/lib/audit';

/**
 * Toast Webhook Handler
 * ---------------------
 * This endpoint is called by Toast when order status or menu data changes.
 *
 * To obtain this Webhook URL:
 * 1. Log in to your Toast Developer Portal.
 * 2. Navigate to 'Partner API Configuration' -> 'Webhooks'.
 * 3. Add your production URL: https://www.trueservedelivery.com/api/webhook/pos/toast
 */
export async function POST(req: Request) {
  // --- Rate Limiting ---
  const ip = getClientIp(req);
  const limit = checkRateLimit(`toast_webhook:${ip}`, { limit: 30, windowSeconds: 60 });
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) }
    });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const signature = req.headers.get('X-Toast-Signature');

    // --- Signature Validation (enabled in production) ---
    if (process.env.NODE_ENV === 'production') {
      const { validateToastSignature: validate } = await import('@/lib/posWebhooks');
      if (!validate(body, signature, process.env.TOAST_CLIENT_SECRET)) {
        await logAuditAction({ action: 'WEBHOOK_INVALID_SIGNATURE', targetId: 'TOAST', entityType: 'System', message: `Invalid signature from IP: ${ip}` });
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
      }
    }

    const supabase = await createClient();

    // --- Resolve Restaurant ID ---
    // Map Toast restaurant GUID to TrueServe Restaurant using posClientId
    const { data: restaurant } = await supabaseAdmin
      .from('Restaurant')
      .select('id')
      .eq('posClientId', body.restaurantGuid || body.restaurantId)
      .maybeSingle();

    if (!restaurant) {
      console.warn(`[Toast Sync] No restaurant found for GUID: ${body.restaurantGuid}`);
      // Still return 200 to prevent Toast from retrying endlessly
      return NextResponse.json({ success: true, message: 'Restaurant not found — skipped' });
    }

    // --- Event Processing ---
    if (body.eventType === 'ORDER_CREATED') {
      const toastOrder = body.order;
      const { error } = await supabase.from('Order').insert({
        status: 'PENDING',
        total: (toastOrder.checkTotal || 0) / 100, // Toast sends in cents
        posReference: `TOAST-${toastOrder.guid || toastOrder.id}`,
        restaurantId: restaurant.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      if (error) throw error;
      console.log(`[Toast Sync] Created order for Restaurant ${restaurant.id}`);
    }

    if (body.eventType === 'ORDER_STATUS_UPDATED') {
      const statusMap: Record<string, string> = {
        'IN_PROGRESS': 'PREPARING',
        'COMPLETED': 'DELIVERED',
        'VOIDED': 'CANCELLED'
      };
      const newStatus = statusMap[body.order?.status] || 'PENDING';
      await supabaseAdmin
        .from('Order')
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq('posReference', `TOAST-${body.order?.guid}`);
    }

    return NextResponse.json({ success: true, message: 'Toast Webhook Processed' });
  } catch (error: any) {
    console.error('[Toast Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Health check — Toast pings this on setup
export async function GET() {
  return new NextResponse('Toast Protocol Active Done', { status: 200 });
}
