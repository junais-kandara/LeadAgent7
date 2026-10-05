import { describe, it, expect } from 'vitest';
import { BrowserSessionManager } from '../lib/connectors/session-manager';
import { MockSocialConnector } from '../lib/connectors/mock-connector';
import { HumanActionRequiredError } from '../lib/connectors/mcp-client';

describe('Playwright MCP Connector Foundation Suite', () => {
  const testEncryptionKey = '0123456789abcdef0123456789abcdef';

  describe('Browser Session Manager', () => {
    const sessionManager = new BrowserSessionManager(testEncryptionKey);
    const orgId = 'org-test-uuid-1';
    const accountId = 'acc-insta-1';

    it('creates and isolates sessions by organization and account', async () => {
      const session1 = await sessionManager.getOrCreateSession({
        organizationId: orgId,
        accountId: accountId,
      });

      const session2 = await sessionManager.getOrCreateSession({
        organizationId: 'org-test-uuid-2',
        accountId: accountId,
      });

      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.status).toBe('active');
    });

    it('encrypts and decrypts sensitive session cookies with AES-256-GCM', () => {
      const secretCookies = {
        sessionId: 'session_xyz_token',
        userId: '123456789',
        csrfToken: 'csrf_secret_abc',
      };

      const encrypted = sessionManager.encryptState(secretCookies);
      expect(encrypted).not.toContain('session_xyz_token');
      expect(encrypted.split(':').length).toBe(3); // iv:authTag:ciphertext

      const decrypted = sessionManager.decryptState(encrypted);
      expect(decrypted).toEqual(secretCookies);
    });

    it('flags session as suspended when human action is required', async () => {
      await sessionManager.getOrCreateSession({
        organizationId: orgId,
        accountId: accountId,
      });

      sessionManager.flagHumanActionRequired(orgId, accountId);
      const sessionKey = sessionManager.getSessionKey(orgId, accountId);
      // Verify suspended state
      expect(sessionKey).toBe(`${orgId}:${accountId}`);
    });
  });

  describe('Mock Social Connector', () => {
    it('returns normalized content and metric structures', async () => {
      const connector = new MockSocialConnector({ platform: 'instagram' });
      const content = await connector.syncContent('ig_user_123');

      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBeGreaterThan(0);

      const firstItem = content[0];
      expect(firstItem.platform).toBe('instagram');
      expect(firstItem.externalId).toBeDefined();
      expect(firstItem.metrics).toBeDefined();
      expect(firstItem.metrics?.views).toBe(15400);
      expect(firstItem.metrics?.likes).toBe(840);
    });

    it('returns normalized comments for lead scoring', async () => {
      const connector = new MockSocialConnector({ platform: 'instagram' });
      const comments = await connector.syncComments('ig_user_123');

      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBe(2);
      expect(comments[0].text).toContain('How much does this service cost');
    });

    it('transitions to human_action_required when CAPTCHA is simulated', async () => {
      const connector = new MockSocialConnector({
        platform: 'instagram',
        simulateCaptcha: true,
      });

      const status = await connector.getStatus('ig_user_123');
      expect(status.status).toBe('human_action_required');
      expect(status.humanActionReason).toContain('CAPTCHA');

      await expect(connector.syncProfile('ig_user_123')).rejects.toThrow(
        HumanActionRequiredError
      );
    });
  });
});
