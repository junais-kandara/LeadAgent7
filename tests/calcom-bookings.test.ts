import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-server';
import { CalComAdapter } from '../lib/connectors/calcom/adapter';
import { CalComBookingPayload } from '../lib/connectors/calcom/types';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

describe('Cal.com Scheduling Webhook & Booking Sync Suite', () => {
  const supabase = createAdminClient();
  let testOrgId: string;

  beforeAll(async () => {
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: 'Cal.com Test Tenant',
        slug: `cal-test-${Date.now()}`,
        timezone: 'Asia/Dubai',
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

  it('processes BOOKING_CREATED, creates lead, and persists confirmed appointment', async () => {
    const adapter = new CalComAdapter();
    const testEmail = `client_${Date.now()}@emirates.ae`;

    const payload: CalComBookingPayload = {
      triggerEvent: 'BOOKING_CREATED',
      createdAt: new Date().toISOString(),
      payload: {
        uid: `uid_${Date.now()}`,
        title: '30 Min Real Estate Consultation',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 1800000).toISOString(),
        organizer: {
          name: 'Junais Kandara',
          email: 'junais@leadagent7.com',
          timeZone: 'Asia/Dubai',
        },
        attendees: [
          {
            name: 'Dr. Rashid Al-Falasi',
            email: testEmail,
            phoneNumber: '+971509998877',
            timeZone: 'Asia/Dubai',
          },
        ],
        videoCallUrl: 'https://meet.google.com/test-cal-meet',
      },
    };

    const result = await adapter.handleWebhook(payload, testOrgId);

    expect(result.success).toBe(true);
    expect(result.leadId).toBeDefined();
    expect(result.bookingId).toBeDefined();
    expect(result.attendeeEmail).toBe(testEmail);

    // Verify lead was stored and transitioned to booking_scheduled
    const { data: lead } = await supabase
      .from('leads')
      .select('id, contact_name, email, status, source_platform')
      .eq('id', result.leadId)
      .single();

    expect(lead).toBeDefined();
    expect(lead?.contact_name).toBe('Dr. Rashid Al-Falasi');
    expect(lead?.status).toBe('booking_scheduled');
    expect(lead?.source_platform).toBe('cal.com');

    // Verify booking record was persisted
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, title, status, timezone')
      .eq('id', result.bookingId)
      .single();

    expect(booking).toBeDefined();
    expect(booking?.status).toBe('Confirmed');
    expect(booking?.title).toBe('30 Min Real Estate Consultation');
    expect(booking?.timezone).toBe('Asia/Dubai');

    // Verify lead event log
    const { data: events } = await supabase
      .from('lead_events')
      .select('id, event_type')
      .eq('lead_id', result.leadId);

    expect(events?.length).toBeGreaterThan(0);
    expect(events?.[0].event_type).toBe('calcom_booking_created');
  });
});
