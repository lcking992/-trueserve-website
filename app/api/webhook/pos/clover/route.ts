import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateCloverSignature } from '@/lib/posWebhooks';

/**
 * Clover Webhook Handler
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get('X-Clover-Signature');

    // Security validation placeholder
    // if (!validateCloverSignature(JSON.stringify(body), signature, process.env.CLOVER_SIGNING_SECRET)) {
    //   return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
    // }

    const supabase = await createClient();

    // Handle Clover webhook verification challenge
    if (body.verificationCode) {
      return NextResponse.json({ verificationCode: body.verificationCode });
    }

    // Map Clover Order Event
    if (body.type === 'ORDER_CREATED') {
        await supabase.from('Order').insert({
            id: body.id,
            status: 'PENDING',
            posReference: `CLOVER-${body.id}`,
            createdAt: new Date().toISOString()
        });
    }

    return NextResponse.json({ success: true, message: 'Clover Webhook Processed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Clover Protocol Active', { status: 200 });
}
