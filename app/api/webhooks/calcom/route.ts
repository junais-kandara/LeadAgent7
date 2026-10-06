import { NextRequest, NextResponse } from 'next/server';
import { CalComAdapter } from '@/lib/connectors/calcom/adapter';
import { CalComBookingPayload } from '@/lib/connectors/calcom/types';

export async function POST(req: NextRequest) {
  try {
    const payload: CalComBookingPayload = await req.json();

    if (!payload.triggerEvent || !payload.payload?.startTime) {
      return NextResponse.json(
        { error: 'Invalid Cal.com webhook payload format.' },
        { status: 400 }
      );
    }

    const adapter = new CalComAdapter();
    const result = await adapter.handleWebhook(payload);

    return NextResponse.json({
      success: true,
      result,
      syncedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
