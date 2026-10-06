/**
 * WhatsApp Baileys Bridge Types & Contracts
 */

export type WhatsAppMessageDirection = 'inbound' | 'outbound';
export type WhatsAppMessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'sticker';

export interface BaileysMessageData {
  messageId: string;
  conversationId: string; // JID e.g. 971501234567@s.whatsapp.net
  senderPhone: string;
  senderName?: string;
  direction: WhatsAppMessageDirection;
  messageType: WhatsAppMessageType;
  text?: string;
  timestamp: string; // ISO string
}

export interface BaileysConversationData {
  conversationId: string;
  contactName?: string;
  phone: string;
  unreadCount?: number;
  lastMessageTimestamp?: string;
}

export type BaileysEventType =
  | 'messages.upsert'
  | 'conversations.update'
  | 'connection.update';

export interface BaileysWebhookPayload {
  event: BaileysEventType;
  organizationId?: string; // Optional if derived from webhook URL or header
  data: {
    messages?: BaileysMessageData[];
    conversations?: BaileysConversationData[];
    connectionStatus?: 'open' | 'connecting' | 'close';
  };
}

export interface WhatsAppBridgeHealth {
  healthy: boolean;
  bridgeUrl: string;
  connectionState: 'open' | 'connecting' | 'close' | 'unknown';
  latencyMs: number;
  phoneNumber?: string;
  error?: string;
}

export interface WhatsAppBridgeAdapter {
  checkHealth(): Promise<WhatsAppBridgeHealth>;
  handleInboundWebhook(
    payload: BaileysWebhookPayload,
    authToken?: string
  ): Promise<{ processed: number; success: boolean }>;
  sendMessage(
    organizationId: string,
    conversationId: string,
    text: string
  ): Promise<{ success: boolean; messageId: string }>;
}

export interface BroadcastRecipient {
  phone: string;
  contactName?: string;
  leadId?: string;
  isOptedOut?: boolean;
  customVariables?: Record<string, string>;
}

export interface BroadcastOptions {
  organizationId: string;
  templateText: string;
  recipients: BroadcastRecipient[];
  /**
   * Minimum jitter delay in milliseconds between broadcast messages.
   * Default: 8,000ms (8 seconds) to prevent WhatsApp anti-spam bans.
   */
  minJitterMs?: number;
  /**
   * Maximum jitter delay in milliseconds between broadcast messages.
   * Default: 18,000ms (18 seconds).
   */
  maxJitterMs?: number;
  /**
   * Optional custom delay function (useful for tests or custom schedulers).
   */
  sleepFn?: (ms: number) => Promise<void>;
  /**
   * Progress callback invoked after each recipient attempt.
   */
  onProgress?: (progress: BroadcastProgress) => void | Promise<void>;
  /**
   * AbortSignal to stop an ongoing broadcast queue.
   */
  signal?: AbortSignal;
}

export interface BroadcastProgress {
  currentIndex: number;
  totalRecipients: number;
  recipientPhone: string;
  status: 'sent' | 'skipped_optout' | 'failed';
  messageId?: string;
  jitterDelayMsApplied: number;
  error?: string;
}

export interface BroadcastJobResult {
  total: number;
  sentCount: number;
  skippedCount: number;
  failedCount: number;
  durationMs: number;
  averageJitterMs: number;
}

