import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-server';
import { SyncOrchestrator } from '../lib/connectors/sync-orchestrator';
import { MockSocialConnector } from '../lib/connectors/mock-connector';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

describe('End-to-End Connector Sync Orchestrator Live DB Test', () => {
  const supabase = createAdminClient();
  const orchestrator = new SyncOrchestrator();

  let testOrgId: string;
  let testAccountId: string;

  beforeAll(async () => {
    // 1. Create temporary test organization
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: 'Test Tenant Org',
        slug: `test-org-${Date.now()}`,
        timezone: 'UTC',
      })
      .select('id')
      .single();

    if (orgErr || !org) throw new Error(`Failed to create test org: ${orgErr?.message}`);
    testOrgId = org.id;

    // 2. Create test social account
    const { data: account, error: accErr } = await supabase
      .from('social_accounts')
      .insert({
        organization_id: testOrgId,
        platform: 'instagram',
        external_id: 'test_ig_account_1',
        account_name: 'Test Instagram Account',
        status: 'connected',
      })
      .select('id')
      .single();

    if (accErr || !account) throw new Error(`Failed to create test social account: ${accErr?.message}`);
    testAccountId = account.id;
  });

  afterAll(async () => {
    // Clean up test org (cascades all child records)
    if (testOrgId) {
      await supabase.from('organizations').delete().eq('id', testOrgId);
    }
  });

  it('orchestrates a full sync job, upserting content, metrics, comments and audit logs', async () => {
    const connector = new MockSocialConnector({ platform: 'instagram' });

    const result = await orchestrator.executeSyncJob(connector, {
      organizationId: testOrgId,
      socialAccountId: testAccountId,
      connectorName: 'mock_instagram',
      jobType: 'full_sync',
    });

    expect(result.status).toBe('completed');
    expect(result.postsSynced).toBe(2);
    expect(result.commentsSynced).toBe(2);

    // Verify records created in Supabase
    const { data: contentList } = await supabase
      .from('content')
      .select('id, title, external_id')
      .eq('organization_id', testOrgId);

    expect(contentList?.length).toBe(2);

    const { data: commentsList } = await supabase
      .from('comments')
      .select('id, text')
      .eq('organization_id', testOrgId);

    expect(commentsList?.length).toBe(2);

    const { data: auditEntries } = await supabase
      .from('audit_logs')
      .select('id, action')
      .eq('organization_id', testOrgId);

    expect(auditEntries?.length).toBeGreaterThan(0);
    expect(auditEntries?.[0].action).toBe('connector.sync.completed');
  });

  it('guarantees idempotency on repeated sync runs without duplicate entries', async () => {
    const connector = new MockSocialConnector({ platform: 'instagram' });

    // Run second sync with identical external IDs
    const result2 = await orchestrator.executeSyncJob(connector, {
      organizationId: testOrgId,
      socialAccountId: testAccountId,
      connectorName: 'mock_instagram',
      jobType: 'full_sync',
    });

    expect(result2.status).toBe('completed');

    // Content table count should remain exactly 2 (no duplicates!)
    const { count: contentCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', testOrgId);

    expect(contentCount).toBe(2);
  });

  it('handles CAPTCHA challenge by transitioning account status to human_action_required', async () => {
    const challengeConnector = new MockSocialConnector({
      platform: 'instagram',
      simulateCaptcha: true,
    });

    const result = await orchestrator.executeSyncJob(challengeConnector, {
      organizationId: testOrgId,
      socialAccountId: testAccountId,
      connectorName: 'mock_instagram',
      jobType: 'full_sync',
    });

    expect(result.status).toBe('failed');
    expect(result.error).toContain('checkpoint');

    // Verify social_accounts table transitioned to human_action_required
    const { data: updatedAccount } = await supabase
      .from('social_accounts')
      .select('status')
      .eq('id', testAccountId)
      .single();

    expect(updatedAccount?.status).toBe('human_action_required');
  });
});
