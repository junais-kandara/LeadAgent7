export type OrganizationRole = 'owner' | 'admin' | 'manager' | 'analyst' | 'sales';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  organization_id: string;
  platform: 'instagram' | 'facebook' | 'youtube' | string;
  external_id: string;
  account_name: string;
  status: 'connected' | 'disconnected' | 'error' | 'human_action_required';
  credential_reference?: string | null;
  last_sync_at?: string | null;
  sync_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  organization_id: string;
  social_account_id?: string | null;
  platform: string;
  external_id: string;
  content_type: 'post' | 'reel' | 'video' | 'story' | string;
  title?: string | null;
  text?: string | null;
  url?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentMetrics {
  id: string;
  organization_id: string;
  content_id: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  captured_at: string;
}

export interface Comment {
  id: string;
  organization_id: string;
  content_id: string;
  external_id: string;
  author_name?: string | null;
  text: string;
  published_at?: string | null;
  sentiment?: 'positive' | 'neutral' | 'negative' | null;
  intent?: 'purchase' | 'pricing' | 'booking' | 'support' | 'spam' | string | null;
  lead_score?: number | null;
  ai_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdAccount {
  id: string;
  organization_id: string;
  platform: 'google_ads' | string;
  external_account_id: string;
  account_name?: string | null;
  status: 'active' | 'paused' | 'disabled';
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  organization_id: string;
  ad_account_id: string;
  external_id: string;
  name: string;
  status: string;
  budget?: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdMetrics {
  id: string;
  organization_id: string;
  ad_campaign_id: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversion_value: number;
  cpl: number;
  captured_at: string;
}

export interface WhatsAppConversation {
  id: string;
  organization_id: string;
  external_id: string;
  contact_name?: string | null;
  phone: string;
  status: 'active' | 'archived' | 'closed';
  assigned_user_id?: string | null;
  first_message_at?: string | null;
  last_message_at?: string | null;
  unread_count: number;
  requires_followup: boolean;
  lead_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  organization_id: string;
  conversation_id: string;
  external_id: string;
  direction: 'inbound' | 'outbound';
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  text?: string | null;
  sent_at: string;
  created_at: string;
}

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualifying'
  | 'qualified'
  | 'booking_scheduled'
  | 'won'
  | 'lost';

export interface Lead {
  id: string;
  organization_id: string;
  contact_name: string;
  phone?: string | null;
  email?: string | null;
  source_platform?: string | null;
  source_content_id?: string | null;
  campaign_id?: string | null;
  first_touch_source?: string | null;
  latest_touch_source?: string | null;
  status: LeadStatus;
  lead_score: number;
  owner_user_id?: string | null;
  whatsapp_conversation_id?: string | null;
  booking_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadEvent {
  id: string;
  organization_id: string;
  lead_id: string;
  event_type: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export type BookingStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'No-show' | 'Cancelled';

export interface Booking {
  id: string;
  organization_id: string;
  lead_id?: string | null;
  title: string;
  start_at: string;
  end_at: string;
  timezone: string;
  status: BookingStatus;
  owner_user_id?: string | null;
  source?: string | null;
  notes?: string | null;
  outcome?: string | null;
  reminder_status: string;
  created_at: string;
  updated_at: string;
}

export interface AIInsight {
  id: string;
  organization_id: string;
  insight_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  summary: string;
  evidence: Record<string, unknown>;
  recommendations: Array<{
    title: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
    expected_impact: string;
  }>;
  model: string;
  prompt_version: string;
  created_at: string;
}

export interface SyncJob {
  id: string;
  organization_id: string;
  connector: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string | null;
  completed_at?: string | null;
  error?: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_user_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
