import crypto from 'crypto';
import { BrowserSession, BrowserSessionConfig } from './types';
import { getConnectorConfig } from './config';

/**
 * Browser Session Manager
 * Provides isolated browser session contexts, state persistence,
 * and AES-256 credential encryption.
 */
export class BrowserSessionManager {
  private sessions = new Map<string, BrowserSession>();

  constructor(private encryptionKey?: string) {
    if (!this.encryptionKey) {
      this.encryptionKey = getConnectorConfig().encryptionKey;
    }
  }

  /**
   * Generates a unique, deterministic session key scoped by organization and account.
   */
  public getSessionKey(organizationId: string, accountId: string): string {
    return `${organizationId}:${accountId}`;
  }

  /**
   * Creates or retrieves an active isolated browser session.
   */
  public async getOrCreateSession(config: BrowserSessionConfig): Promise<BrowserSession> {
    const key = this.getSessionKey(config.organizationId, config.accountId);
    const existing = this.sessions.get(key);

    if (existing && existing.status === 'active') {
      existing.lastActivityAt = new Date();
      return existing;
    }

    const newSession: BrowserSession = {
      sessionId: `sess_${crypto.randomUUID()}`,
      accountId: config.accountId,
      organizationId: config.organizationId,
      status: 'active',
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };

    this.sessions.set(key, newSession);
    return newSession;
  }

  /**
   * Encrypts sensitive session credentials / cookies before storing in DB.
   */
  public encryptState(data: Record<string, unknown>): string {
    const key = crypto.createHash('sha256').update(this.encryptionKey!).digest();
    const iv = crypto.randomBytes(12); // GCM standard IV 12 bytes
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const plaintext = JSON.stringify(data);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts stored session credentials / cookies.
   */
  public decryptState(encryptedData: string): Record<string, unknown> {
    const [ivHex, authTagHex, cipherText] = encryptedData.split(':');
    if (!ivHex || !authTagHex || !cipherText) {
      throw new Error('Invalid encrypted state payload format.');
    }

    const key = crypto.createHash('sha256').update(this.encryptionKey!).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(cipherText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Marks a session as requiring human intervention (e.g. 2FA/CAPTCHA).
   */
  public flagHumanActionRequired(organizationId: string, accountId: string): void {
    const key = this.getSessionKey(organizationId, accountId);
    const session = this.sessions.get(key);
    if (session) {
      session.status = 'suspended';
      session.lastActivityAt = new Date();
    }
  }

  /**
   * Closes and removes a session.
   */
  public closeSession(organizationId: string, accountId: string): void {
    const key = this.getSessionKey(organizationId, accountId);
    const session = this.sessions.get(key);
    if (session) {
      session.status = 'closed';
      this.sessions.delete(key);
    }
  }
}
