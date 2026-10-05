-- Migration 04: AI Insights, Sync Jobs and Audit Logs

-- 1. AI Insights
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

-- 2. Sync Jobs (Job Tracking & Idempotency)
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

-- 3. Audit Logs
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

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies: AI Insights
CREATE POLICY "Members can view AI insights"
  ON public.ai_insights FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Managers, admins and owners can generate/manage AI insights"
  ON public.ai_insights FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

-- Policies: Sync Jobs
CREATE POLICY "Members can view sync jobs"
  ON public.sync_jobs FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Managers, admins and owners can trigger/update sync jobs"
  ON public.sync_jobs FOR ALL
  USING (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager']));

-- Policies: Audit Logs
CREATE POLICY "Owners and admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Staff can insert audit log entries"
  ON public.audit_logs FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin', 'manager', 'sales']));
