import { createAdminClient } from '../../db/supabase-server';

export interface ConversationSummaryEvidence {
  conversationId: string;
  leadId?: string | null;
  contactName?: string | null;
  phone: string;
  messageCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
  messages: Array<{
    direction: 'inbound' | 'outbound';
    text: string;
    sentAt: string;
  }>;
}

/**
 * Prepares verified evidence packet for AI conversation summary and lead classification.
 * Strictly calculates authoritative data in TypeScript before passing to Groq.
 */
export async function getConversationEvidence(
  organizationId: string,
  conversationId: string
): Promise<ConversationSummaryEvidence | null> {
  const supabase = createAdminClient();

  // Retrieve conversation
  const { data: conv } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('organization_id', organizationId)
    .single();

  if (!conv) return null;

  // Retrieve message history
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('direction, text, sent_at')
    .eq('conversation_id', conversationId)
    .eq('organization_id', organizationId)
    .order('sent_at', { ascending: true })
    .limit(50);

  const cleanMessages = (messages || []).map((m) => ({
    direction: m.direction as 'inbound' | 'outbound',
    text: m.text || '',
    sentAt: m.sent_at,
  }));

  return {
    conversationId: conv.id,
    leadId: conv.lead_id,
    contactName: conv.contact_name,
    phone: conv.phone,
    messageCount: cleanMessages.length,
    firstMessageAt: conv.first_message_at || conv.created_at,
    lastMessageAt: conv.last_message_at || conv.created_at,
    messages: cleanMessages,
  };
}
