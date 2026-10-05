import { NextRequest, NextResponse } from 'next/server';
import { BaileysAdapter } from '@/lib/connectors/whatsapp/baileys-adapter';
import { BaileysWebhookPayload } from '@/lib/connectors/whatsapp/types';

export const dynamic = 'force-dynamic';

const adapter = new BaileysAdapter();

/**
 * Health check & verification for Baileys webhook
 */
export async function GET() {
  const health = await adapter.checkHealth();
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/whatsapp',
    bridgeHealth: health,
  });
}

/**
 * Inbound webhook handler for WhatsApp messages and conversation updates
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Extract authentication token
    const authHeader = req.headers.get('authorization') || '';
    const customHeader = req.headers.get('x-webhook-token') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '') || customHeader || req.nextUrl.searchParams.get('token') || '';

    // 2. Parse payload
    const payload: BaileysWebhookPayload = await req.json();

    if (!payload || !payload.event) {
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing event field' },
        { status: 400 }
      );
    }

    // 3. Process webhook through Baileys adapter
    const result = await adapter.handleInboundWebhook(payload, token);

    return NextResponse.json({
      success: true,
      processed: result.processed,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const isAuthError = errorMsg.toLowerCase().includes('unauthorized');

    return NextResponse.json(
      { error: errorMsg },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
