-- Migration 03: WhatsApp, Leads, Lead Events and Bookings

-- 1. WhatsApp Conversations
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_message_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  unread_count INT NOT NULL DEFAULT 0,
  requires_followup BOOLEAN NOT NULL DEFAULT false,
  lead_id UUID, -- Foreign key added below after leads table
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_whatsapp_conv UNIQUE (organization_id, external_id)
);

CREATE TRIGGER tr_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_wa_conv_org_id ON public.whatsapp_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON public.whatsapp_conversations(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_wa_conv_followup ON public.whatsapp_conversations(organization_id, requires_followup);
CREATE INDEX IF NOT EXISTS idx_wa_conv_last_message ON public.whatsapp_conversations(organization_id, last_message_at DESC);

-- 2. WhatsApp Messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT NOT NULL DEFAULT 'text',
  text TEXT,
  sent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_whatsapp_msg UNIQUE (organization_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON public.whatsapp_messages(conversation_id, sent_at ASC);
CREATE INDEX IF NOT EXISTS idx_wa_msg_org_id ON public.whatsapp_messages(organization_id);

-- 3. Leads (Core CRM with Attribution)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source_platform TEXT,
  source_content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.ad_campaigns(id) ON DELETE SET NULL,
  first_touch_source TEXT,
  latest_touch_source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualifying', 'qualified', 'booking_scheduled', 'won', 'lost')),
  lead_score INT NOT NULL DEFAULT 0,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  whatsapp_conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE SET NULL,
  booking_id UUID, -- Foreign key added below after bookings table
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER tr_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add circular foreign key for whatsapp_conversations.lead_id
ALTER TABLE public.whatsapp_conversations
  ADD CONSTRAINT fk_wa_conv_lead
  FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(organization_id, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(organization_id, created_at DESC);

-- 4. Lead Events
CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_lead_events_lead ON public.lead_events(lead_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_events_org ON public.lead_events(organization_id);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'No-show', 'Cancelled')),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT,
  notes TEXT,
  outcome TEXT,
  reminder_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER tr_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add circular foreign key for leads.booking_id
ALTER TABLE public.leads
  ADD CONSTRAINT fk_lead_booking
  FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_org_id ON public.bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON public.bookings(organization_id, start_at ASC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_lead ON public.bookings(lead_id);

-- Enable RLS
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies: WhatsApp Conversations
CREATE POLICY "Members can view whatsapp conversations"
  ON public.whatsapp_conversations FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Staff can modify whatsapp conversations"
  ON public.whatsapp_conversations FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

-- Policies: WhatsApp Messages
CREATE POLICY "Members can view whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Staff can insert whatsapp messages"
  ON public.whatsapp_messages FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

-- Policies: Leads
CREATE POLICY "Members can view leads"
  ON public.leads FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Staff can manage leads"
  ON public.leads FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

-- Policies: Lead Events
CREATE POLICY "Members can view lead events"
  ON public.lead_events FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Staff can record lead events"
  ON public.lead_events FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

-- Policies: Bookings
CREATE POLICY "Members can view bookings"
  ON public.bookings FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Staff can manage bookings"
  ON public.bookings FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));
