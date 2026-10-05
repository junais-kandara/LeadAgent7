-- Migration 01: Multi-tenant Organizations, Membership, Roles and Security
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Automatic updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER tr_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Organization Members Table with 5 Roles
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'analyst', 'sales')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

CREATE TRIGGER tr_org_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for tenancy lookup
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.organization_members(organization_id);

-- 4. Fast RLS Helper Functions (SECURITY DEFINER to prevent recursive RLS)
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

-- 5. RLS Policies for Tenancy & Membership
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Members can view their own organization"
  ON public.organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can update their organization"
  ON public.organizations FOR UPDATE
  USING (has_org_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(id, ARRAY['owner', 'admin']));

CREATE POLICY "Owners can delete their organization"
  ON public.organizations FOR DELETE
  USING (has_org_role(id, ARRAY['owner']));

-- Organization Members policies
CREATE POLICY "Members can view membership within their organization"
  ON public.organization_members FOR SELECT
  USING (organization_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Owners and admins can invite and insert members"
  ON public.organization_members FOR INSERT
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Owners and admins can update member roles"
  ON public.organization_members FOR UPDATE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY "Owners and admins can remove members"
  ON public.organization_members FOR DELETE
  USING (has_org_role(organization_id, ARRAY['owner', 'admin']));
