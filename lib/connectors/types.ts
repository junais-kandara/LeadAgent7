/**
 * Core Connector Interfaces & Types for LeadAgent7 / Skyletic
 * 
 * Rules:
 * 1. Connectors sit behind modular interfaces.
 * 2. Browser automation (Playwright) is an interchangeable acquisition method, not core business logic.
 * 3. All ingested data is returned in normalized structures.
 * 4. Human-action checkpoints (CAPTCHA/MFA) transition to 'human_action_required'.
 */

export type ConnectionState =
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'human_action_required'
  | 'syncing';

export interface ConnectionStatus {
  status: ConnectionState;
  lastSyncAt?: string | null;
  error?: string | null;
  humanActionReason?: string | null;
  details?: Record<string, unknown>;
}

export interface BrowserSessionConfig {
  accountId: string;
  organizationId: string;
  proxyUrl?: string;
  userAgent?: string;
  storageState?: Record<string, unknown>;
}

export interface BrowserSession {
  sessionId: string;
  accountId: string;
  organizationId: string;
  status: 'idle' | 'active' | 'suspended' | 'closed';
  createdAt: Date;
  lastActivityAt: Date;
}

export interface NormalizedMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  reach?: number;
  impressions?: number;
}

export interface NormalizedContent {
  externalId: string;
  platform: 'instagram' | 'facebook' | 'youtube' | string;
  contentType: 'post' | 'reel' | 'video' | 'story' | string;
  title?: string | null;
  text?: string | null;
  url?: string | null;
  publishedAt?: string | null;
  metrics?: NormalizedMetrics;
}

export interface NormalizedComment {
  externalId: string;
  contentExternalId: string;
  authorName?: string | null;
  text: string;
  publishedAt?: string | null;
}

export interface SocialConnector {
  readonly platform: string;

  connect(accountId: string, credentials?: Record<string, unknown>): Promise<void>;
  disconnect(accountId: string): Promise<void>;
  getStatus(accountId: string): Promise<ConnectionStatus>;
  syncProfile(accountId: string): Promise<Record<string, unknown>>;
  syncContent(accountId: string): Promise<NormalizedContent[]>;
  syncComments(accountId: string, contentId?: string): Promise<NormalizedComment[]>;
  syncMetrics(accountId: string): Promise<void>;
}

export interface MCPHealthStatus {
  healthy: boolean;
  mcpServerReachable: boolean;
  workerReachable: boolean;
  latencyMs?: number;
  version?: string;
  error?: string;
}

export interface SyncJobOptions {
  organizationId: string;
  socialAccountId: string;
  connectorName: string;
  jobType: 'full_sync' | 'content_only' | 'metrics_only' | 'comments_only';
}
