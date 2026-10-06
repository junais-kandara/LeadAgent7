import { createAdminClient } from '../../db/supabase-server';
import { CalComBookingPayload, CalComSyncResult } from './types';

export class CalComAdapter {
  /**
   * Processes a Cal.com webhook event and synchronizes it into Supabase.
   */
  public async handleWebhook(
    payload: CalComBookingPayload,
    organizationId?: string
  ): Promise<CalComSyncResult> {
    const supabase = createAdminClient();

    // Default to the first organization if not specified in webhook URL
    let targetOrgId = organizationId;
    if (!targetOrgId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();
      targetOrgId = org?.id;
    }

    if (!targetOrgId) {
      throw new Error('No organization context available for Cal.com booking sync.');
    }

    const { triggerEvent, payload: bookingData } = payload;
    const attendee = bookingData.attendees?.[0] || {
      name: 'Cal.com Client',
      email: 'client@example.com',
    };

    // 1. Find or create lead by attendee email
    let leadId: string;
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, status')
      .eq('organization_id', targetOrgId)
      .eq('email', attendee.email)
      .single();

    if (existingLead) {
      leadId = existingLead.id;
      // Advance stage to booking_scheduled if not won
      if (existingLead.status !== 'won') {
        await supabase
          .from('leads')
          .update({
            status: triggerEvent === 'BOOKING_CANCELLED' ? 'qualifying' : 'booking_scheduled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', leadId);
      }
    } else {
      const { data: newLead } = await supabase
        .from('leads')
        .insert({
          organization_id: targetOrgId,
          contact_name: attendee.name,
          email: attendee.email,
          phone: attendee.phoneNumber || null,
          source_platform: 'cal.com',
          status: triggerEvent === 'BOOKING_CANCELLED' ? 'qualifying' : 'booking_scheduled',
          lead_score: 80,
        })
        .select('id')
        .single();

      if (!newLead) {
        throw new Error('Failed to create lead from Cal.com attendee.');
      }
      leadId = newLead.id;
    }

    // 2. Map booking status
    let bookingStatus: 'Confirmed' | 'Scheduled' | 'Cancelled' = 'Confirmed';
    if (triggerEvent === 'BOOKING_CANCELLED') {
      bookingStatus = 'Cancelled';
    } else if (triggerEvent === 'BOOKING_RESCHEDULED') {
      bookingStatus = 'Scheduled';
    }

    // 3. Upsert booking record in bookings table
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        organization_id: targetOrgId,
        lead_id: leadId,
        title: bookingData.title || 'Client Consultation',
        start_at: bookingData.startTime,
        end_at: bookingData.endTime,
        timezone: attendee.timeZone || 'UTC',
        status: bookingStatus,
        source: 'cal.com',
        notes: `Cal.com Booking UID: ${bookingData.uid}. Video Link: ${bookingData.videoCallUrl || 'N/A'}`,
        reminder_status: 'pending',
      })
      .select('id')
      .single();

    if (bookingErr || !booking) {
      throw new Error(`Failed to insert booking: ${bookingErr?.message}`);
    }

    // 4. Emit lifecycle audit event
    await supabase.from('lead_events').insert({
      organization_id: targetOrgId,
      lead_id: leadId,
      event_type: `calcom_${triggerEvent.toLowerCase()}`,
      metadata: {
        bookingId: booking.id,
        calComUid: bookingData.uid,
        startTime: bookingData.startTime,
        triggerEvent,
      },
    });

    return {
      success: true,
      bookingId: booking.id,
      leadId,
      event: triggerEvent,
      attendeeEmail: attendee.email,
    };
  }
}
