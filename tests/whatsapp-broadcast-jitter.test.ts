import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-server';
import { BaileysAdapter } from '../lib/connectors/whatsapp/baileys-adapter';
import {
  WhatsAppBroadcastDispatcher,
  calculateRandomJitter,
  interpolateTemplate,
} from '../lib/connectors/whatsapp/broadcast-dispatcher';
import { BroadcastProgress, BroadcastRecipient } from '../lib/connectors/whatsapp/types';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

describe('WhatsApp Broadcast vs AI Chat Jitter Delay Suite', () => {
  const supabase = createAdminClient();
  let testOrgId: string;

  beforeAll(async () => {
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: 'Jitter Test Tenant',
        slug: `jitter-test-${Date.now()}`,
        timezone: 'UTC',
      })
      .select('id')
      .single();

    testOrgId = org!.id;
  });

  afterAll(async () => {
    if (testOrgId) {
      await supabase.from('organizations').delete().eq('id', testOrgId);
    }
  });

  describe('Randomized Jitter Utility', () => {
    it('generates random values within min and max boundaries', () => {
      for (let i = 0; i < 50; i++) {
        const jitter = calculateRandomJitter(8000, 18000);
        expect(jitter).toBeGreaterThanOrEqual(8000);
        expect(jitter).toBeLessThanOrEqual(18000);
      }
    });

    it('handles inverted min/max gracefully', () => {
      const jitter = calculateRandomJitter(15000, 5000);
      expect(jitter).toBeGreaterThanOrEqual(5000);
      expect(jitter).toBeLessThanOrEqual(15000);
    });

    it('interpolates template placeholders for broadcast recipients', () => {
      const template = 'Hi {{contact_name}}, special offer for {{company}}: code {{promo}}!';
      const recipient: BroadcastRecipient = {
        phone: '+971501112233',
        contactName: 'Ahmed Al-Mansoor',
        customVariables: {
          company: 'Acme Corp',
          promo: 'VIP2026',
        },
      };

      const result = interpolateTemplate(template, recipient);
      expect(result).toBe('Hi Ahmed Al-Mansoor, special offer for Acme Corp: code VIP2026!');
    });
  });

  describe('AI Chat / 1-on-1 Messages (NO Jitter)', () => {
    it('sendMessage sends immediately with ZERO artificial jitter delay', async () => {
      const adapter = new BaileysAdapter();

      // Create a test conversation
      const { data: conv } = await supabase
        .from('whatsapp_conversations')
        .insert({
          organization_id: testOrgId,
          external_id: `test_interactive_${Date.now()}@s.whatsapp.net`,
          phone: '+971500000001',
          contact_name: 'Interactive Chat Lead',
          status: 'active',
          unread_count: 0,
          requires_followup: false,
        })
        .select('id')
        .single();

      const startTime = Date.now();

      // Direct interactive message (simulating AI chat response)
      const res = await adapter.sendMessage(
        testOrgId,
        conv!.id,
        'Hello! Here is the immediate response from our AI assistant.'
      );

      const elapsed = Date.now() - startTime;

      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();
      // Must be immediate (< 1500ms database roundtrip, definitely not waiting 8-18s)
      expect(elapsed).toBeLessThan(2500);

      // Verify message was stored in DB
      const { data: storedMsg } = await supabase
        .from('whatsapp_messages')
        .select('id, text, direction')
        .eq('external_id', res.messageId)
        .single();

      expect(storedMsg).toBeDefined();
      expect(storedMsg?.direction).toBe('outbound');
    });
  });

  describe('Broadcast Campaigns (ENFORCED Randomized Jitter)', () => {
    it('applies randomized jitter delays strictly between consecutive broadcast messages', async () => {
      const adapter = new BaileysAdapter();
      const dispatcher = new WhatsAppBroadcastDispatcher(adapter);

      const recordedDelays: number[] = [];
      const mockSleep = vi.fn(async (ms: number) => {
        recordedDelays.push(ms);
      });

      const recipients: BroadcastRecipient[] = [
        { phone: '+971500000002', contactName: 'Client 1' },
        { phone: '+971500000003', contactName: 'Client 2' },
        { phone: '+971500000004', contactName: 'Client 3' },
      ];

      const progressEvents: BroadcastProgress[] = [];

      const result = await dispatcher.dispatchBroadcast({
        organizationId: testOrgId,
        templateText: 'Hello {{contact_name}}, this is our broadcast message!',
        recipients,
        minJitterMs: 8000,
        maxJitterMs: 18000,
        sleepFn: mockSleep,
        onProgress: (p) => {
          progressEvents.push(p);
        },
      });

      expect(result.total).toBe(3);
      expect(result.sentCount).toBe(3);
      expect(result.skippedCount).toBe(0);

      // In a 3-message broadcast: delay is applied between msg 1 -> 2, and msg 2 -> 3 (exactly 2 delays)
      expect(recordedDelays.length).toBe(2);
      expect(mockSleep).toHaveBeenCalledTimes(2);

      // Verify each recorded jitter delay fell within 8,000ms and 18,000ms
      for (const delay of recordedDelays) {
        expect(delay).toBeGreaterThanOrEqual(8000);
        expect(delay).toBeLessThanOrEqual(18000);
      }

      // Progress events should be recorded for all 3
      expect(progressEvents.length).toBe(3);
      expect(progressEvents[0].status).toBe('sent');
      expect(progressEvents[1].status).toBe('sent');
      expect(progressEvents[2].status).toBe('sent');

      // The last recipient does not trigger another jitter delay
      expect(progressEvents[2].jitterDelayMsApplied).toBe(0);
    });

    it('respects opt-out flags and skips unsubscribed contacts without jitter', async () => {
      const adapter = new BaileysAdapter();
      const dispatcher = new WhatsAppBroadcastDispatcher(adapter);

      const recordedDelays: number[] = [];
      const mockSleep = vi.fn(async (ms: number) => {
        recordedDelays.push(ms);
      });

      const recipients: BroadcastRecipient[] = [
        { phone: '+971500000005', contactName: 'Subscribed A' },
        { phone: '+971500000006', contactName: 'Opted Out User', isOptedOut: true },
        { phone: '+971500000007', contactName: 'Subscribed B' },
      ];

      const result = await dispatcher.dispatchBroadcast({
        organizationId: testOrgId,
        templateText: 'Special update for {{contact_name}}',
        recipients,
        minJitterMs: 8000,
        maxJitterMs: 18000,
        sleepFn: mockSleep,
      });

      expect(result.sentCount).toBe(2);
      expect(result.skippedCount).toBe(1);
    });

    it('aborts broadcast promptly when AbortSignal fires', async () => {
      const adapter = new BaileysAdapter();
      const dispatcher = new WhatsAppBroadcastDispatcher(adapter);

      const controller = new AbortController();
      let sentCount = 0;

      const recipients: BroadcastRecipient[] = [
        { phone: '+971500000008', contactName: 'Lead 1' },
        { phone: '+971500000009', contactName: 'Lead 2' },
        { phone: '+971500000010', contactName: 'Lead 3' },
      ];

      const mockSleep = vi.fn(async () => {
        // Abort right after first send during delay
        controller.abort();
      });

      const result = await dispatcher.dispatchBroadcast({
        organizationId: testOrgId,
        templateText: 'Broadcast testing abort',
        recipients,
        sleepFn: mockSleep,
        signal: controller.signal,
        onProgress: (p) => {
          if (p.status === 'sent') sentCount++;
        },
      });

      // Should stop after the first or second before completing all 3
      expect(result.sentCount).toBeLessThan(3);
    });
  });
});
