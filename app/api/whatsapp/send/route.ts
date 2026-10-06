import { NextRequest, NextResponse } from 'next/server';
import { BaileysAdapter } from '@/lib/connectors/whatsapp/baileys-adapter';
import { createAdminClient } from '@/lib/db/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, text } = body;

    if (!conversationId || !text) {
      return NextResponse.json(
        { error: 'Missing conversationId or text parameter.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Retrieve conversation to verify tenant organization
    const { data: conv, error: convErr } = await supabase
      .from('whatsapp_conversations')
      .select('id, organization_id')
      .eq('id', conversationId)
      .single();

    if (convErr || !conv) {
      return NextResponse.json(
        { error: 'Conversation not found.' },
        { status: 404 }
      );
    }

    const adapter = new BaileysAdapter();
    const result = await adapter.sendMessage(
      conv.organization_id,
      conversationId,
      text
    );

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
