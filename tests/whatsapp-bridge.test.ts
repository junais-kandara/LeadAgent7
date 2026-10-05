import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-server';
import { BaileysAdapter } from '../lib/connectors/whatsapp/baileys-adapter';
import { BaileysWebhookPayload } from '../lib/connectors/whatsapp/types';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

describe('WhatsApp Baileys Bridge Integration Suite', () => {
  const supabase = createAdminClient();
  const testToken = 'secret_webhook_token_987';
  const adapter = new BaileysAdapter({ bridgeToken: testToken });

  let testOrgId: string;

  beforeAll(async () => {
    // Setup test organization
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: 'WhatsApp Test Tenant',
        slug: `wa-test-${Date.now()}`,
        timezone: 'UTC',
      })
      .select('id')
      .single();

    testOrgId = org!.id;
  });

  afterAll(async () => {
    // Cleanup cascades conversations, messages, leads and events
    if (testOrgId) {
      await supabase.from('organizations').delete().eq('id', testOrgId);
    }
  });

  it('rejects unauthorized webhook requests with invalid or missing tokens', async () => {
    const payload: BaileysWebhookPayload = {
      event: 'messages.upsert',
      organizationId: testOrgId,
      data: { messages: [] },
    };

    // Missing token
    await expect(adapter.handleInboundWebhook(payload, '')).rejects.toThrow(/Unauthorized/);

    // Invalid token
    await expect(adapter.handleInboundWebhook(payload, 'wrong_token')).rejects.toThrow(/Unauthorized/);
  });

  it('ingests inbound message, matches/creates lead, and links conversation', async () => {
    const testJid = '971509998877@s.whatsapp.net';
    const testPhone = '971509998877';
    const messageId1 = `msg_${Date.now()}_1`;

    const payload: BaileysWebhookPayload = {
      event: 'messages.upsert',
      organizationId: testOrgId,
      data: {
        messages: [
          {
            messageId: messageId1,
            conversationId: testJid,
            senderPhone: testPhone,
            senderName: 'Karim Mansour',
            direction: 'inbound',
            messageType: 'text',
            text: 'Hello, what is your pricing and can I book a demo call?',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };

    const res = await adapter.handleInboundWebhook(payload, testToken);
    expect(res.success).toBe(true);
    expect(res.processed).toBe(1);

    // Verify conversation was created
    const { data: conv } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('organization_id', testOrgId)
      .eq('external_id', testJid)
      .single();

    expect(conv).toBeDefined();
    expect(conv?.requires_followup).toBe(true); // Pricing / demo keyword triggered follow-up
    expect(conv?.lead_id).toBeDefined();

    // Verify lead was automatically created with qualifying status
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', conv!.lead_id!)
      .single();

    expect(lead?.contact_name).toBe('Karim Mansour');
    expect(lead?.phone).toBe(testPhone);
    expect(lead?.source_platform).toBe('whatsapp');
    expect(lead?.status).toBe('qualifying');
    expect(lead?.lead_score).toBeGreaterThanOrEqual(70);

    // Verify lead event recorded
    const { data: events } = await supabase
      .from('lead_events')
      .select('*')
      .eq('lead_id', lead!.id);

    expect(events?.length).toBeGreaterThan(0);
  });

  it('guarantees idempotency when the same message is delivered multiple times', async () => {
    const testJid = '971509998877@s.whatsapp.net';
    const testPhone = '971509998877';
    const duplicateMessageId = `msg_duplicate_id_xyz`;

    const payload: BaileysWebhookPayload = {
      event: 'messages.upsert',
      organizationId: testOrgId,
      data: {
        messages: [
          {
            messageId: duplicateMessageId,
            conversationId: testJid,
            senderPhone: testPhone,
            direction: 'inbound',
            messageType: 'text',
            text: 'Idempotency test message',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };

    // First ingestion
    await adapter.handleInboundWebhook(payload, testToken);

    // Second ingestion (duplicate redelivery)
    await adapter.handleInboundWebhook(payload, testToken);

    // Check count in database for this external_id - MUST be exactly 1
    const { count } = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', testOrgId)
      .eq('external_id', duplicateMessageId);

    expect(count).toBe(1);
  });

  it('matches subsequent messages to the existing lead without duplicate leads', async () => {
    const testJid = '971509998877@s.whatsapp.net';
    const testPhone = '971509998877';

    const payload: BaileysWebhookPayload = {
      event: 'messages.upsert',
      organizationId: testOrgId,
      data: {
        messages: [
          {
            messageId: `msg_${Date.now()}_second`,
            conversationId: testJid,
            senderPhone: testPhone,
            direction: 'inbound',
            messageType: 'text',
            text: 'I am available on Thursday morning.',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    };

    await adapter.handleInboundWebhook(payload, testToken);

    // Check lead count for this phone number in org - MUST remain 1
    const { count: leadCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', testOrgId)
      .eq('phone', testPhone);

    expect(leadCount).toBe(1);
  });

  it('supports outbound reply and resets follow-up required flag', async () => {
    const testJid = '971509998877@s.whatsapp.net';

    const { data: conv } = await supabase
      .from('whatsapp_conversations')
      .select('id')
      .eq('organization_id', testOrgId)
      .eq('external_id', testJid)
      .single();

    expect(conv).toBeDefined();

    const sendRes = await adapter.sendMessage(
      testOrgId,
      conv!.id,
      'Hi Karim, thank you for reaching out! We would love to show you a demo.'
    );

    expect(sendRes.success).toBe(true);

    // Verify conversation updated
    const { data: updatedConv } = await supabase
      .from('whatsapp_conversations')
      .select('requires_followup')
      .eq('id', conv!.id)
      .single();

    expect(updatedConv?.requires_followup).toBe(false);
  });
});
