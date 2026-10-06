import { createAdminClient } from '@/lib/db/supabase-server';
import { AIProvider } from '../types';
import { GroqAIProvider } from '../provider';
import { getConversationEvidence } from '@/lib/connectors/whatsapp/jobs';

export class ConversationAnalyzer {
  constructor(private provider: AIProvider = new GroqAIProvider()) {}

  /**
   * Analyzes a specific WhatsApp conversation thread and updates lead scoring.
   */
  public async analyzeThread(organizationId: string, conversationId: string) {
    const evidence = await getConversationEvidence(organizationId, conversationId);
    if (!evidence || evidence.messages.length === 0) {
      return null;
    }

    const analysis = await this.provider.analyzeConversation(
      conversationId,
      evidence.messages
    );

    const supabase = createAdminClient();

    // 1. Update conversation status & followup
    await supabase
      .from('whatsapp_conversations')
      .update({
        requires_followup: analysis.requiresFollowup,
      })
      .eq('id', conversationId)
      .eq('organization_id', organizationId);

    // 2. If lead is linked, update lead status & score
    if (evidence.leadId) {
      await supabase
        .from('leads')
        .update({
          lead_score: analysis.leadScore,
          status:
            analysis.leadScore >= 90
              ? 'qualified'
              : analysis.appointmentIntent
              ? 'booking_scheduled'
              : 'qualifying',
        })
        .eq('id', evidence.leadId)
        .eq('organization_id', organizationId);

      // Record lead intelligence event
      await supabase.from('lead_events').insert({
        organization_id: organizationId,
        lead_id: evidence.leadId,
        event_type: 'ai_conversation_analyzed',
        metadata: {
          leadScore: analysis.leadScore,
          intent: analysis.intent,
          summary: analysis.summary,
          recommendedAction: analysis.recommendedAction,
          model: analysis.model,
        },
      });
    }

    return analysis;
  }
}
