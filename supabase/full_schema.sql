-- ==============================================================================
-- LEADAGENT7 / SKYLETIC - MILESTONE 1 COMPLETE DATABASE FOUNDATION & RLS
-- Run this in Supabase Dashboard -> SQL Editor
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. UTILITY FUNCTIONS & TIMESTAMP TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TENANCY & ROLE ACCESS (organizations, organization_members)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS tr_organizations_updated_at ON public.organizations;
CREATE TRIGGER tr_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'analyst', 'sales')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

DROP TRIGGER IF EXISTS tr_org_members_updated_at ON public.organization_members;
CREATE TRIGGER tr_org_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);

-- RLS Helper Functions (SECURITY DEFINER to prevent recursive RLS)
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS TABLE (org_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT om.organization_id
  FROM public.organization_members om
  WHERE om.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_org_role(target_org_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = target_org_id
      AND om.user_id = auth.uid()
      AND om.role = ANY(allowed_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own organization" ON public.organizations;
CREATE POLICY "Members can view their own organization"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Owners and admins can update their organization" ON public.organizations;
CREATE POLICY "Owners and admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (has_org_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Owners can delete their organization" ON public.organizations;
CREATE POLICY "Owners can delete their organization"
  ON public.organizations FOR DELETE
  USING (has_org_role(id, ARRAY['owner']));

DROP POLICY IF EXISTS "Members can view membership within their organization" ON public.organization_members;
CREATE POLICY "Members can view membership within their organization"
  ON public.organization_members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Owners and admins can invite and insert members" ON public.organization_members;
CREATE POLICY "Owners and admins can invite and insert members"
  ON public.organization_members FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Owners and admins can update member roles" ON public.organization_members;
CREATE POLICY "Owners and admins can update member roles"
  ON public.organization_members FOR UPDATE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.organization_members;
CREATE POLICY "Owners and admins can remove members"
  ON public.organization_members FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));


-- ==============================================================================
-- 3. MARKETING & SOCIAL (social_accounts, content, content_metrics, comments, ad_accounts, ad_campaigns, ad_metrics)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'connected',
  credential_reference TEXT,
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_social_account UNIQUE (organization_id, platform, external_id)
);

DROP TRIGGER IF EXISTS tr_social_accounts_updated_at ON public.social_accounts;
CREATE TRIGGER tr_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_social_accounts_org_id ON public.social_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(organization_id, platform);

CREATE TABLE IF NOT EXISTS public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT,
  text TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_content_external UNIQUE (organization_id, platform, external_id)
);

DROP TRIGGER IF EXISTS tr_content_updated_at ON public.content;
CREATE TRIGGER tr_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_content_org_id ON public.content(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content(organization_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_social_account ON public.content(social_account_id);

CREATE TABLE IF NOT EXISTS public.content_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  views BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  comments BIGINT NOT NULL DEFAULT 0,
  shares BIGINT NOT NULL DEFAULT 0,
  saves BIGINT NOT NULL DEFAULT 0,
  reach BIGINT NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_content_metrics_content ON public.content_metrics(content_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_metrics_org_captured ON public.content_metrics(organization_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  author_name TEXT,
  text TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  sentiment TEXT,
  intent TEXT,
  lead_score INT,
  ai_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_comment_external UNIQUE (organization_id, external_id)
);

DROP TRIGGER IF EXISTS tr_comments_updated_at ON public.comments;
CREATE TRIGGER tr_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_org_id ON public.comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_comments_lead_score ON public.comments(organization_id, lead_score DESC);

CREATE TABLE IF NOT EXISTS public.ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_account_id TEXT NOT NULL,
  account_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_ad_account UNIQUE (organization_id, platform, external_account_id)
);

DROP TRIGGER IF EXISTS tr_ad_accounts_updated_at ON public.ad_accounts;
CREATE TRIGGER tr_ad_accounts_updated_at
  BEFORE UPDATE ON public.ad_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_ad_accounts_org_id ON public.ad_accounts(organization_id);

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ad_account_id UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  budget NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_ad_campaign UNIQUE (organization_id, external_id)
);

DROP TRIGGER IF EXISTS tr_ad_campaigns_updated_at ON public.ad_campaigns;
CREATE TRIGGER tr_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_org_id ON public.ad_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_account ON public.ad_campaigns(ad_account_id);

CREATE TABLE IF NOT EXISTS public.ad_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  ad_campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  ctr NUMERIC(6, 4) NOT NULL DEFAULT 0,
  cpc NUMERIC(10, 4) NOT NULL DEFAULT 0,
  conversions NUMERIC(10, 2) NOT NULL DEFAULT 0,
  conversion_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cpl NUMERIC(10, 2) NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ad_metrics_campaign ON public.ad_metrics(ad_campaign_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_metrics_org_captured ON public.ad_metrics(organization_id, captured_at DESC);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view social accounts" ON public.social_accounts;
CREATE POLICY "Members can view social accounts" ON public.social_accounts FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Owners and admins can manage social accounts" ON public.social_accounts;
CREATE POLICY "Owners and admins can manage social accounts" ON public.social_accounts FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Members can view content" ON public.content;
CREATE POLICY "Members can view content" ON public.content FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Managers, admins and owners can modify content" ON public.content;
CREATE POLICY "Managers, admins and owners can modify content" ON public.content FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

DROP POLICY IF EXISTS "Members can view content metrics" ON public.content_metrics;
CREATE POLICY "Members can view content metrics" ON public.content_metrics FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Managers, admins and owners can insert content metrics" ON public.content_metrics;
CREATE POLICY "Managers, admins and owners can insert content metrics" ON public.content_metrics FOR INSERT WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

DROP POLICY IF EXISTS "Members can view comments" ON public.comments;
CREATE POLICY "Members can view comments" ON public.comments FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Staff can update comments" ON public.comments;
CREATE POLICY "Staff can update comments" ON public.comments FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

DROP POLICY IF EXISTS "Members can view ad accounts" ON public.ad_accounts;
CREATE POLICY "Members can view ad accounts" ON public.ad_accounts FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Owners and admins can manage ad accounts" ON public.ad_accounts;
CREATE POLICY "Owners and admins can manage ad accounts" ON public.ad_accounts FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Members can view ad campaigns" ON public.ad_campaigns;
CREATE POLICY "Members can view ad campaigns" ON public.ad_campaigns FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Managers, admins and owners can manage ad campaigns" ON public.ad_campaigns;
CREATE POLICY "Managers, admins and owners can manage ad campaigns" ON public.ad_campaigns FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

DROP POLICY IF EXISTS "Members can view ad metrics" ON public.ad_metrics;
CREATE POLICY "Members can view ad metrics" ON public.ad_metrics FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Managers, admins and owners can insert ad metrics" ON public.ad_metrics;
CREATE POLICY "Managers, admins and owners can insert ad metrics" ON public.ad_metrics FOR INSERT WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));


-- ==============================================================================
-- 4. CRM, WHATSAPP, LEADS & BOOKINGS (whatsapp_conversations, whatsapp_messages, leads, lead_events, bookings)
-- ==============================================================================
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
  lead_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_whatsapp_conv UNIQUE (organization_id, external_id)
);

DROP TRIGGER IF EXISTS tr_whatsapp_conversations_updated_at ON public.whatsapp_conversations;
CREATE TRIGGER tr_whatsapp_conversations_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_wa_conv_org_id ON public.whatsapp_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON public.whatsapp_conversations(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_wa_conv_followup ON public.whatsapp_conversations(organization_id, requires_followup);
CREATE INDEX IF NOT EXISTS idx_wa_conv_last_message ON public.whatsapp_conversations(organization_id, last_message_at DESC);

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
  booking_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS tr_leads_updated_at ON public.leads;
CREATE TRIGGER tr_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_wa_conv_lead' AND table_name = 'whatsapp_conversations'
  ) THEN
    ALTER TABLE public.whatsapp_conversations
      ADD CONSTRAINT fk_wa_conv_lead
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_org_id ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(organization_id, lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(organization_id, phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(organization_id, created_at DESC);

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

DROP TRIGGER IF EXISTS tr_bookings_updated_at ON public.bookings;
CREATE TRIGGER tr_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_lead_booking' AND table_name = 'leads'
  ) THEN
    ALTER TABLE public.leads
      ADD CONSTRAINT fk_lead_booking
      FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_org_id ON public.bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start ON public.bookings(organization_id, start_at ASC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_lead ON public.bookings(lead_id);

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view whatsapp conversations" ON public.whatsapp_conversations;
CREATE POLICY "Members can view whatsapp conversations" ON public.whatsapp_conversations FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Staff can modify whatsapp conversations" ON public.whatsapp_conversations;
CREATE POLICY "Staff can modify whatsapp conversations" ON public.whatsapp_conversations FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

DROP POLICY IF EXISTS "Members can view whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Members can view whatsapp messages" ON public.whatsapp_messages FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Staff can insert whatsapp messages" ON public.whatsapp_messages;
CREATE POLICY "Staff can insert whatsapp messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

DROP POLICY IF EXISTS "Members can view leads" ON public.leads;
CREATE POLICY "Members can view leads" ON public.leads FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Staff can manage leads" ON public.leads;
CREATE POLICY "Staff can manage leads" ON public.leads FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

DROP POLICY IF EXISTS "Members can view lead events" ON public.lead_events;
CREATE POLICY "Members can view lead events" ON public.lead_events FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Staff can record lead events" ON public.lead_events;
CREATE POLICY "Staff can record lead events" ON public.lead_events FOR INSERT WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

DROP POLICY IF EXISTS "Members can view bookings" ON public.bookings;
CREATE POLICY "Members can view bookings" ON public.bookings FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Staff can manage bookings" ON public.bookings;
CREATE POLICY "Staff can manage bookings" ON public.bookings FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));


-- ==============================================================================
-- 5. AI INSIGHTS, SYNC JOBS & AUDIT LOGS (ai_insights, sync_jobs, audit_logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'monthly')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  summary TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL DEFAULT 'v1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_org_period ON public.ai_insights(organization_id, insight_type, period_end DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_org_created ON public.ai_insights(organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connector TEXT NOT NULL,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sync_jobs_org_status ON public.sync_jobs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_org_created ON public.sync_jobs(organization_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON public.audit_logs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_action ON public.audit_logs(organization_id, action);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view AI insights" ON public.ai_insights;
CREATE POLICY "Members can view AI insights" ON public.ai_insights FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Managers, admins and owners can generate/manage AI insights" ON public.ai_insights;
CREATE POLICY "Managers, admins and owners can generate/manage AI insights" ON public.ai_insights FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

DROP POLICY IF EXISTS "Members can view sync jobs" ON public.sync_jobs;
CREATE POLICY "Members can view sync jobs" ON public.sync_jobs FOR SELECT USING (organization_id IN (SELECT get_user_org_ids()));

DROP POLICY IF EXISTS "Managers, admins and owners can trigger/update sync jobs" ON public.sync_jobs;
CREATE POLICY "Managers, admins and owners can trigger/update sync jobs" ON public.sync_jobs FOR ALL USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager'])) WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

DROP POLICY IF EXISTS "Owners and admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Owners and admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Staff can insert audit log entries" ON public.audit_logs;
CREATE POLICY "Staff can insert audit log entries" ON public.audit_logs FOR INSERT WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));
