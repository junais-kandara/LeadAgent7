import crypto from 'crypto';
import { createAdminClient } from '../../db/supabase-server';
import {
  BaileysMessageData,
  BaileysWebhookPayload,
  WhatsAppBridgeAdapter,
  WhatsAppBridgeHealth,
} from './types';
import { getWhatsAppConfig } from './config';

const INTENT_KEYWORDS = [
  'price',
  'pricing',
  'cost',
  'how much',
  'demo',
  'book',
  'booking',
  'appointment',
  'call',
  'schedule',
  'buy',
  'purchase',
  'interested',
];

export class BaileysAdapter implements WhatsAppBridgeAdapter {
  private bridgeUrl: string;
  private bridgeToken: string;

  constructor(options?: { bridgeUrl?: string; bridgeToken?: string }) {
    const config = getWhatsAppConfig();
    this.bridgeUrl = options?.bridgeUrl || config.bridgeUrl;
    this.bridgeToken = options?.bridgeToken || config.bridgeToken;
  }

  /**
   * Timing-safe token verification against server-configured WHATSAPP_BRIDGE_TOKEN.
   */
  public verifyAuthToken(receivedToken?: string): boolean {
    if (!this.bridgeToken) {
      // If no token is configured in environment, permit only in development
      return process.env.NODE_ENV !== 'production';
    }

    if (!receivedToken) return false;

    try {
      const a = Buffer.from(receivedToken);
      const b = Buffer.from(this.bridgeToken);
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Health ping to the Baileys bridge service.
   */
  public async checkHealth(): Promise<WhatsAppBridgeHealth> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.bridgeUrl}/health`, {
        headers: this.bridgeToken ? { Authorization: `Bearer ${this.bridgeToken}` } : {},
      });

      const latencyMs = Date.now() - start;
      if (!res.ok) {
        return {
          healthy: false,
          bridgeUrl: this.bridgeUrl,
          connectionState: 'close',
          latencyMs,
          error: `Bridge returned status ${res.status}`,
        };
      }

      const body = await res.json().catch(() => ({}));
      return {
        healthy: true,
        bridgeUrl: this.bridgeUrl,
        connectionState: body.state || 'open',
        latencyMs,
        phoneNumber: body.phoneNumber,
      };
    } catch (err: unknown) {
      return {
        healthy: false,
        bridgeUrl: this.bridgeUrl,
        connectionState: 'unknown',
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Handles incoming webhooks from the Baileys bridge with:
   * 1. Token authentication
   * 2. Message idempotency by bridge message ID
   * 3. Automatic contact matching & lead creation/updates
   * 4. Follow-up & appointment intent detection
   */
  public async handleInboundWebhook(
    payload: BaileysWebhookPayload,
    authToken?: string
  ): Promise<{ processed: number; success: boolean }> {
    if (!this.verifyAuthToken(authToken)) {
      throw new Error('Unauthorized: Invalid or missing WhatsApp bridge webhook token.');
    }

    const supabase = createAdminClient();

    // Determine target organization
    let orgId = payload.organizationId;
    if (!orgId) {
      // Default to first active organization in database
      const { data: org } = await supabase.from('organizations').select('id').limit(1).single();
      if (!org) throw new Error('No active organization found to attach WhatsApp conversation to.');
      orgId = org.id;
    }

    let processedCount = 0;

    if (payload.event === 'messages.upsert' && payload.data.messages) {
      for (const msg of payload.data.messages) {
        await this.processSingleMessage(supabase, orgId, msg);
        processedCount++;
      }
    }

    return { processed: processedCount, success: true };
  }

  private async processSingleMessage(
    supabase: ReturnType<typeof createAdminClient>,
    organizationId: string,
    msg: BaileysMessageData
  ): Promise<void> {
    const textLower = (msg.text || '').toLowerCase();
    const hasIntent = INTENT_KEYWORDS.some((kw) => textLower.includes(kw));

    // 1. Contact Matching: Check if lead exists by phone number
    const cleanPhone = msg.senderPhone.replace(/\D/g, '');
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, contact_name, status, whatsapp_conversation_id')
      .eq('organization_id', organizationId)
      .eq('phone', cleanPhone)
      .limit(1)
      .single();

    let leadId: string | null = existingLead?.id || null;

    // 2. If no lead found and message is inbound, create new lead record
    if (!existingLead && msg.direction === 'inbound') {
      const { data: newLead } = await supabase
        .from('leads')
        .insert({
          organization_id: organizationId,
          contact_name: msg.senderName || `WhatsApp User (+${cleanPhone})`,
          phone: cleanPhone,
          source_platform: 'whatsapp',
          first_touch_source: 'whatsapp_conversation',
          latest_touch_source: 'whatsapp_conversation',
          status: hasIntent ? 'qualifying' : 'new',
          lead_score: hasIntent ? 75 : 35,
        })
        .select('id')
        .single();

      if (newLead) {
        leadId = newLead.id;

        // Record lead lifecycle event
        await supabase.from('lead_events').insert({
          organization_id: organizationId,
          lead_id: leadId,
          event_type: 'lead_created_from_whatsapp',
          metadata: {
            messageId: msg.messageId,
            initialText: msg.text,
            hasIntent,
          },
        });
      }
    } else if (existingLead && hasIntent && existingLead.status === 'new') {
      // Upgrade existing lead status to qualifying
      await supabase
        .from('leads')
        .update({
          status: 'qualifying',
          lead_score: 80,
          latest_touch_source: 'whatsapp_inquiry',
        })
        .eq('id', existingLead.id);
    }

    // 3. Upsert Conversation Record
    const { data: conversation } = await supabase
      .from('whatsapp_conversations')
      .upsert(
        {
          organization_id: organizationId,
          external_id: msg.conversationId,
          contact_name: msg.senderName || existingLead?.contact_name || `+${cleanPhone}`,
          phone: cleanPhone,
          last_message_at: msg.timestamp || new Date().toISOString(),
          requires_followup: hasIntent || false,
          lead_id: leadId,
        },
        { onConflict: 'organization_id, external_id' }
      )
      .select('id')
      .single();

    if (!conversation) return;

    // Link lead back to conversation if not already linked
    if (leadId && (!existingLead || !existingLead.whatsapp_conversation_id)) {
      await supabase
        .from('leads')
        .update({ whatsapp_conversation_id: conversation.id })
        .eq('id', leadId);
    }

    // 4. Ingest Message (Idempotent via unique constraint on organization_id, external_id)
    await supabase.from('whatsapp_messages').upsert(
      {
        organization_id: organizationId,
        conversation_id: conversation.id,
        external_id: msg.messageId,
        direction: msg.direction,
        message_type: msg.messageType || 'text',
        text: msg.text || null,
        sent_at: msg.timestamp || new Date().toISOString(),
      },
      { onConflict: 'organization_id, external_id' }
    );

    // 5. If inbound, increment unread count & record lead event
    if (msg.direction === 'inbound') {
      try {
        const { error: rpcErr } = await supabase.rpc('increment_wa_unread', { conv_id: conversation.id });
        if (rpcErr) {
          await supabase
            .from('whatsapp_conversations')
            .update({ unread_count: 1 })
            .eq('id', conversation.id);
        }
      } catch {
        await supabase
          .from('whatsapp_conversations')
          .update({ unread_count: 1 })
          .eq('id', conversation.id);
      }

      if (leadId) {
        await supabase.from('lead_events').insert({
          organization_id: organizationId,
          lead_id: leadId,
          event_type: 'whatsapp_message_received',
          metadata: {
            messageId: msg.messageId,
            text: msg.text,
            hasIntent,
          },
        });
      }
    }
  }

  /**
   * Sends an outbound message through the Baileys bridge API.
   */
  public async sendMessage(
    organizationId: string,
    conversationId: string,
    text: string
  ): Promise<{ success: boolean; messageId: string }> {
    const supabase = createAdminClient();

    // Retrieve conversation details
    const { data: conv, error: convErr } = await supabase
      .from('whatsapp_conversations')
      .select('external_id, phone')
      .eq('id', conversationId)
      .eq('organization_id', organizationId)
      .single();

    if (convErr || !conv) {
      throw new Error('Conversation not found.');
    }

    let messageId = `out_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Dispatch to external bridge API if configured
    if (this.bridgeUrl) {
      try {
        const res = await fetch(`${this.bridgeUrl}/api/messages/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.bridgeToken ? { Authorization: `Bearer ${this.bridgeToken}` } : {}),
          },
          body: JSON.stringify({
            jid: conv.external_id,
            text,
          }),
        });

        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          if (body.messageId) messageId = body.messageId;
        }
      } catch {
        // If local mock or dev bridge offline, proceed with local persistence
      }
    }

    const now = new Date().toISOString();

    // Persist outbound message in database
    await supabase.from('whatsapp_messages').insert({
      organization_id: organizationId,
      conversation_id: conversationId,
      external_id: messageId,
      direction: 'outbound',
      message_type: 'text',
      text,
      sent_at: now,
    });

    // Update conversation timestamp
    await supabase
      .from('whatsapp_conversations')
      .update({
        last_message_at: now,
        requires_followup: false, // Replying resolves follow-up required flag
      })
      .eq('id', conversationId);

    return { success: true, messageId };
  }
}
