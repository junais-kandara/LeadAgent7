import { z } from 'zod';

export const CommentClassificationSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  intent: z.enum([
    'purchase',
    'pricing',
    'booking',
    'availability',
    'support',
    'spam',
    'general',
  ]),
  leadScore: z.number().int().min(0).max(100),
  requiresFollowup: z.boolean(),
  priority: z.enum(['high', 'medium', 'low']),
  reason: z.string().min(5),
});

export type CommentClassificationOutput = z.infer<typeof CommentClassificationSchema>;

export const ConversationAnalysisSchema = z.object({
  intent: z.enum(['purchase', 'pricing', 'booking', 'callback', 'support', 'spam']),
  leadScore: z.number().int().min(0).max(100),
  priority: z.enum(['high', 'medium', 'low']),
  requiresFollowup: z.boolean(),
  appointmentIntent: z.boolean(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  summary: z.string().min(10),
  recommendedAction: z.string().min(5),
});

export type ConversationAnalysisOutput = z.infer<typeof ConversationAnalysisSchema>;

export const RecommendationSchema = z.object({
  title: z.string().min(3),
  action: z.string().min(5),
  priority: z.enum(['high', 'medium', 'low']),
  expectedImpact: z.string().min(5),
});

export const InsightGenerationSchema = z.object({
  summary: z.string().min(15),
  keyFindings: z.array(z.string().min(5)).min(1),
  recommendations: z.array(RecommendationSchema).min(1),
});

export type InsightGenerationOutput = z.infer<typeof InsightGenerationSchema>;
