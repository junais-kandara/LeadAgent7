import {
  ConnectionStatus,
  NormalizedComment,
  NormalizedContent,
  SocialConnector,
} from './types';
import { HumanActionRequiredError } from './mcp-client';

export interface MockConnectorOptions {
  platform?: string;
  simulateCaptcha?: boolean;
  simulateNetworkFailure?: boolean;
}

/**
 * Mock Social Connector
 * Used for testing and staging without making live browser or external API calls.
 */
export class MockSocialConnector implements SocialConnector {
  public readonly platform: string;
  private connected = true;
  private simulateCaptcha: boolean;
  private simulateNetworkFailure: boolean;

  constructor(options?: MockConnectorOptions) {
    this.platform = options?.platform || 'mock_platform';
    this.simulateCaptcha = options?.simulateCaptcha || false;
    this.simulateNetworkFailure = options?.simulateNetworkFailure || false;
  }

  public async connect(_accountId: string, _credentials?: Record<string, unknown>): Promise<void> {
    if (this.simulateNetworkFailure) {
      throw new Error('Connection failed: network timeout');
    }
    this.connected = true;
  }

  public async disconnect(_accountId: string): Promise<void> {
    this.connected = false;
  }

  public async getStatus(_accountId: string): Promise<ConnectionStatus> {
    if (this.simulateCaptcha) {
      return {
        status: 'human_action_required',
        humanActionReason: 'CAPTCHA detected on verification challenge.',
      };
    }

    return {
      status: this.connected ? 'connected' : 'disconnected',
      lastSyncAt: new Date().toISOString(),
    };
  }

  public async syncProfile(accountId: string): Promise<Record<string, unknown>> {
    if (this.simulateCaptcha) {
      throw new HumanActionRequiredError('Login checkpoint: SMS OTP required', 'mfa');
    }

    return {
      id: accountId,
      name: `Mock Account (${this.platform})`,
      followers: 12500,
    };
  }

  public async syncContent(accountId: string): Promise<NormalizedContent[]> {
    if (this.simulateCaptcha) {
      throw new HumanActionRequiredError('Cloudflare challenge detected', 'captcha');
    }

    return [
      {
        externalId: `${accountId}_post_101`,
        platform: this.platform,
        contentType: 'reel',
        title: 'Lead Generation Blueprint 2026',
        text: 'How we generated 500+ qualified leads using WhatsApp automation #growth',
        url: 'https://instagram.com/p/mock101',
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        metrics: {
          views: 15400,
          likes: 840,
          comments: 62,
          shares: 110,
          saves: 95,
          reach: 12000,
          impressions: 18500,
        },
      },
      {
        externalId: `${accountId}_post_102`,
        platform: this.platform,
        contentType: 'post',
        title: 'Skyletic Product Launch',
        text: 'Automate your customer conversation to booked calls.',
        url: 'https://instagram.com/p/mock102',
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        metrics: {
          views: 6200,
          likes: 310,
          comments: 24,
          shares: 35,
          saves: 40,
          reach: 5800,
          impressions: 7200,
        },
      },
    ];
  }

  public async syncComments(accountId: string): Promise<NormalizedComment[]> {
    return [
      {
        externalId: `${accountId}_cmt_1`,
        contentExternalId: `${accountId}_post_101`,
        authorName: 'Sarah Jenkins',
        text: 'How much does this service cost per month? Can I book a demo?',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        externalId: `${accountId}_cmt_2`,
        contentExternalId: `${accountId}_post_101`,
        authorName: 'Alex Rivera',
        text: 'Does this integrate with WhatsApp Business?',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  public async syncMetrics(_accountId: string): Promise<void> {
    // Metrics are updated inline with syncContent in the normalized model
    return Promise.resolve();
  }
}
