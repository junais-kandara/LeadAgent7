import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';
import { createAdminClient } from '../lib/db/supabase-server';
import { GroqAIProvider } from '../lib/ai/provider';
import { CommentAnalyzer } from '../lib/ai/analyzers/comment-analyzer';
import { InsightGenerator } from '../lib/ai/analyzers/insight-generator';
import {
  CommentClassificationSchema,
  ConversationAnalysisSchema,
  InsightGenerationSchema,
} from '../lib/ai/schemas';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

describe('Milestone 4: Groq AI Intelligence Engine Suite', () => {
  const supabase = createAdminClient();
  const provider = new GroqAIProvider();

  let testOrgId: string;

  beforeAll(async () => {
    // Setup test organization
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: 'AI Intelligence Test Org',
        slug: `ai-test-${Date.now()}`,
        timezone: 'UTC',
      })
      .select('id')
      .single();

    testOrgId = org!.id;
  });

  afterAll(async () => {
    if (testOrgId) {
      await supabase.from('organizations').delete().eq('id', testOrgId);
    }
  });

  describe('Zod Schema Validation', () => {
    it('validates structured comment classification payloads', () => {
      const valid = {
        sentiment: 'positive',
        intent: 'pricing',
        leadScore: 85,
        requiresFollowup: true,
        priority: 'high',
        reason: 'Customer inquired about pricing and services.',
      };

      const parsed = CommentClassificationSchema.parse(valid);
      expect(parsed.leadScore).toBe(85);
      expect(parsed.intent).toBe('pricing');
    });

    it('rejects invalid lead scores outside 0-100 range', () => {
      const invalid = {
        sentiment: 'positive',
        intent: 'pricing',
        leadScore: 120, // Invalid!
        requiresFollowup: true,
        priority: 'high',
        reason: 'Out of bounds test.',
      };

      expect(() => CommentClassificationSchema.parse(invalid)).toThrow();
    });

    it('validates conversation analysis and insight generation schemas', () => {
      const validInsight = {
        summary: 'Weekly performance was strong with 45 leads captured.',
        keyFindings: ['Conversion rate reached 28%', 'WhatsApp velocity increased'],
        recommendations: [
          {
            title: 'Scale Video Ads',
            action: 'Produce 3 new reels on high-intent themes.',
            priority: 'high',
            expectedImpact: 'Increase lead capture by 20%',
          },
        ],
      };

      const parsed = InsightGenerationSchema.parse(validInsight);
      expect(parsed.recommendations.length).toBe(1);
    });
  });

  describe('Comment Analysis & Lead Capture', () => {
    it('accurately classifies pricing inquiries with high lead score', async () => {
      const analysis = await provider.classifyComment({
        commentId: 'cmt-test-1',
        authorName: 'Fatima Al-Zahra',
        text: 'How much does your full service package cost per month?',
        postTitle: 'Enterprise Automation Case Study',
        postPlatform: 'instagram',
      });

      expect(analysis.intent).toBe('pricing');
      expect(analysis.leadScore).toBeGreaterThanOrEqual(70);
      expect(analysis.requiresFollowup).toBe(true);
      expect(analysis.promptVersion).toBe('v1.0.0');
    });

    it('processes unclassified comments in Supabase and creates qualified leads', async () => {
      // 1. Insert test content and comment
      const { data: content } = await supabase
        .from('content')
        .insert({
          organization_id: testOrgId,
          platform: 'instagram',
          external_id: `cnt_${Date.now()}`,
          content_type: 'reel',
          title: 'Growth Marketing Secrets',
        })
        .select('id')
        .single();

      const { data: comment } = await supabase
        .from('comments')
        .insert({
          organization_id: testOrgId,
          content_id: content!.id,
          external_id: `cmt_${Date.now()}`,
          author_name: 'Zaid Al-Harbi',
          text: 'Can I book a demo call with your sales team this week?',
        })
        .select('id')
        .single();

      const analyzer = new CommentAnalyzer(provider);
      const res = await analyzer.processUnanalyzedComments(testOrgId);

      expect(res.processed).toBeGreaterThanOrEqual(1);
      expect(res.leadsCreated).toBeGreaterThanOrEqual(1);

      // Verify comment was classified in DB
      const { data: updatedComment } = await supabase
        .from('comments')
        .select('sentiment, intent, lead_score')
        .eq('id', comment!.id)
        .single();

      expect(updatedComment?.intent).toBe('booking');
      expect(updatedComment?.lead_score).toBeGreaterThanOrEqual(80);

      // Verify lead was created in DB
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('organization_id', testOrgId)
        .eq('contact_name', 'Zaid Al-Harbi')
        .single();

      expect(lead).toBeDefined();
      expect(['qualified', 'qualifying']).toContain(lead?.status);
    });
  });

  describe('Evidence-Backed Insight Generation', () => {
    it('compiles authoritative metrics and persists evidence-backed insight into Supabase', async () => {
      const generator = new InsightGenerator(provider);
      const insight = await generator.generateReport(testOrgId, 'daily');

      expect(insight.insightType).toBe('daily');
      expect(insight.summary).toBeDefined();
      expect(insight.recommendations.length).toBeGreaterThan(0);
      expect(insight.evidence).toBeDefined();
      expect(insight.evidence.metrics).toBeDefined();

      // Verify saved in Supabase ai_insights table
      const { data: savedInsight } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('organization_id', testOrgId)
        .eq('insight_type', 'daily')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      expect(savedInsight).toBeDefined();
      expect(savedInsight?.summary).toBe(insight.summary);
      expect(savedInsight?.prompt_version).toBe('v1.0.0');
    });
  });
});
