import { createAdminClient } from '@/lib/db/supabase-server';
import { AIProvider } from '../types';
import { GroqAIProvider } from '../provider';

export interface CommentBatchResult {
  processed: number;
  leadsCreated: number;
  errors: number;
}

export class CommentAnalyzer {
  constructor(private provider: AIProvider = new GroqAIProvider()) {}

  /**
   * Processes all unanalyzed comments for an organization.
   * Classifies sentiment/intent, scores leads, and automatically generates leads for high-intent comments.
   */
  public async processUnanalyzedComments(organizationId: string): Promise<CommentBatchResult> {
    const supabase = createAdminClient();

    // Fetch unclassified comments
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        author_name,
        text,
        content_id,
        content (
          title,
          platform
        )
      `)
      .eq('organization_id', organizationId)
      .is('sentiment', null)
      .limit(50);

    if (error || !comments) {
      return { processed: 0, leadsCreated: 0, errors: 0 };
    }

    let processed = 0;
    let leadsCreated = 0;
    let errors = 0;

    for (const c of comments) {
      try {
        const contentInfo = Array.isArray(c.content) ? c.content[0] : c.content;

        const analysis = await this.provider.classifyComment({
          commentId: c.id,
          authorName: c.author_name,
          text: c.text,
          postTitle: contentInfo?.title || null,
          postPlatform: contentInfo?.platform || null,
        });

        // 1. Update comment classification in Supabase
        await supabase
          .from('comments')
          .update({
            sentiment: analysis.sentiment,
            intent: analysis.intent,
            lead_score: analysis.leadScore,
            ai_reason: `${analysis.reason} (Model: ${analysis.model})`,
          })
          .eq('id', c.id);

        processed++;

        // 2. High-Intent Lead Creation: If score >= 70, create or update lead
        if (analysis.leadScore >= 70 && c.author_name) {
          const { data: newLead } = await supabase
            .from('leads')
            .insert({
              organization_id: organizationId,
              contact_name: c.author_name,
              source_platform: contentInfo?.platform || 'social',
              source_content_id: c.content_id,
              first_touch_source: `social_comment_${c.id}`,
              latest_touch_source: `social_comment_${c.id}`,
              status: analysis.leadScore >= 90 ? 'qualified' : 'qualifying',
              lead_score: analysis.leadScore,
            })
            .select('id')
            .single();

          if (newLead) {
            leadsCreated++;

            await supabase.from('lead_events').insert({
              organization_id: organizationId,
              lead_id: newLead.id,
              event_type: 'lead_captured_from_social_comment',
              metadata: {
                commentId: c.id,
                commentText: c.text,
                leadScore: analysis.leadScore,
                intent: analysis.intent,
                reason: analysis.reason,
              },
            });
          }
        }
      } catch (err) {
        console.error(`Failed to analyze comment ${c.id}:`, err);
        errors++;
      }
    }

    return { processed, leadsCreated, errors };
  }
}
