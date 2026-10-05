-- Migration 02: Marketing, Social Accounts, Content, Comments, Ad Accounts and Metrics

-- 1. Social Accounts
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

CREATE TRIGGER tr_social_accounts_updated_at
  BEFORE UPDATE ON public.social_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_social_accounts_org_id ON public.social_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(organization_id, platform);

-- 2. Content
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

CREATE TRIGGER tr_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_content_org_id ON public.content(organization_id);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON public.content(organization_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_social_account ON public.content(social_account_id);

-- 3. Content Metrics (Time-series)
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

-- 4. Comments
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

CREATE TRIGGER tr_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_comments_content ON public.comments(content_id);
CREATE INDEX IF NOT EXISTS idx_comments_org_id ON public.comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_comments_lead_score ON public.comments(organization_id, lead_score DESC);

-- 5. Ad Accounts
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

CREATE TRIGGER tr_ad_accounts_updated_at
  BEFORE UPDATE ON public.ad_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_ad_accounts_org_id ON public.ad_accounts(organization_id);

-- 6. Ad Campaigns
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

CREATE TRIGGER tr_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_org_id ON public.ad_campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_account ON public.ad_campaigns(ad_account_id);

-- 7. Ad Metrics
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

-- Enable RLS for all marketing tables
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;

-- Policies: Social Accounts
CREATE POLICY "Members can view social accounts"
  ON public.social_accounts FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can manage social accounts"
  ON public.social_accounts FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- Policies: Content
CREATE POLICY "Members can view content"
  ON public.content FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Managers, admins and owners can modify content"
  ON public.content FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

-- Policies: Content Metrics
CREATE POLICY "Members can view content metrics"
  ON public.content_metrics FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Managers, admins and owners can insert content metrics"
  ON public.content_metrics FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

-- Policies: Comments
CREATE POLICY "Members can view comments"
  ON public.comments FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Staff can update comments"
  ON public.comments FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));

-- Policies: Ad Accounts
CREATE POLICY "Members can view ad accounts"
  ON public.ad_accounts FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can manage ad accounts"
  ON public.ad_accounts FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

-- Policies: Ad Campaigns
CREATE POLICY "Members can view ad campaigns"
  ON public.ad_campaigns FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Managers, admins and owners can manage ad campaigns"
  ON public.ad_campaigns FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

-- Policies: Ad Metrics
CREATE POLICY "Members can view ad metrics"
  ON public.ad_metrics FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Managers, admins and owners can insert ad metrics"
  ON public.ad_metrics FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));
