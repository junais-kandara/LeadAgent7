import { NextResponse } from 'next/server';
import { BaileysAdapter } from '@/lib/connectors/whatsapp/baileys-adapter';

export async function GET() {
  try {
    const adapter = new BaileysAdapter();
    const health = await adapter.checkHealth();

    return NextResponse.json({
      status: 'ok',
      bridge: health,
      engine: 'Baileys Multi-Device WebSockets',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        status: 'degraded',
        error: message,
        engine: 'Baileys Multi-Device WebSockets',
      },
      { status: 200 }
    );
  }
}
