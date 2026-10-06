/**
 * Open-Source Cal.com Webhook & Embed Types
 */

export type CalComTriggerEvent =
  | 'BOOKING_CREATED'
  | 'BOOKING_RESCHEDULED'
  | 'BOOKING_CANCELLED'
  | 'MEETING_ENDED';

export interface CalComAttendee {
  name: string;
  email: string;
  timeZone?: string;
  phoneNumber?: string;
}

export interface CalComOrganizer {
  name: string;
  email: string;
  timeZone?: string;
}

export interface CalComBookingPayload {
  triggerEvent: CalComTriggerEvent;
  createdAt: string;
  payload: {
    uid: string;
    title: string;
    description?: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    organizer: CalComOrganizer;
    attendees: CalComAttendee[];
    status?: string;
    metadata?: Record<string, unknown>;
    videoCallUrl?: string;
  };
}

export interface CalComSyncResult {
  success: boolean;
  bookingId: string;
  leadId: string;
  event: CalComTriggerEvent;
  attendeeEmail: string;
}
