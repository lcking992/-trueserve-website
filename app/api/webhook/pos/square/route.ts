import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

const SQUARE_WEBHOOK_URL = 'https://trueserve.delivery/api/webhook/pos/square';

function validateSquareSignature(rawBody: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(SQUARE_WEBHOOK_URL + rawBody);
  return hmac.digest('base64') === signature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-square-hmacsha256-signature');

    if (!validateSquareSignature(rawBody, signature, process.env.SQUARE_WEBHOOK_SIGNATURE_KEY)) {
      console.warn('[Square Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const supabase = await createClient();

    if (body.type === 'order.created') {
      const squareOrder = body.data?.object?.order_created;
      if (squareOrder) {
        const { data: restaurant } = await supabase
          .from('Restaurant')
          .select('id')
          .eq('squareMerchantId', body.merchant_id)
          .single();

        await supabase.from('Order').insert({
          status: 'PENDING',
          totalAmount: (squareOrder.total_money?.amount ?? 0) / 100,
          posReference: `SQUARE-${squareOrder.order_id}`,
          restaurantId: restaurant?.id ?? null,
          createdAt: body.created_at ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (body.type === 'order.updated') {
      const updated = body.data?.object?.order_updated;
      if (updated?.order_id) {
        await supabase
          .from('Order')
          .update({ updatedAt: new Date().toISOString() })
          .eq('posReference', `SQUARE-${updated.order_id}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Square Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Square Protocol Active', { status: 200 });
}
