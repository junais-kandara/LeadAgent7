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
