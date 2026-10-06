/**
 * AI Provider Contracts & Data Transfer Objects
 * 
 * Rules:
 * 1. Metrics come from authoritative application calculation, never LLM.
 * 2. AI receives verified evidence packets only.
 * 3. Never invent facts or hallucinate statistics.
 * 4. All structured AI outputs are validated using Zod.
 * 5. Store AI evidence, model, and prompt version with all outputs.
 */

export interface RawCommentData {
  commentId: string;
  authorName?: string | null;
  text: string;
  postTitle?: string | null;
  postPlatform?: string | null;
}

export interface RawMessageData {
  direction: 'inbound' | 'outbound';
  text: string;
  sentAt: string;
}

export interface CommentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: 'purchase' | 'pricing' | 'booking' | 'availability' | 'support' | 'spam' | 'general';
  leadScore: number; // 0 to 100
  requiresFollowup: boolean;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  model: string;
  promptVersion: string;
}

export interface ConversationAnalysisResult {
  intent: 'purchase' | 'pricing' | 'booking' | 'callback' | 'support' | 'spam';
  leadScore: number; // 0 to 100
  priority: 'high' | 'medium' | 'low';
  requiresFollowup: boolean;
  appointmentIntent: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  recommendedAction: string;
  model: string;
  promptVersion: string;
}

export interface MetricEvidencePacket {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  metrics: {
    totalLeads: number;
    qualifiedLeads: number;
    whatsappConversations: number;
    bookings: number;
    conversionRatePct: number;
    adSpend?: number;
    cpl?: number;
    topChannel?: string;
    topContentTitle?: string;
  };
  priorPeriodComparison?: {
    leadGrowthPct?: number;
    bookingGrowthPct?: number;
  };
}

export interface AIInsightRecommendation {
  title: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

export interface AIInsightResult {
  insightType: 'daily' | 'weekly' | 'monthly';
  summary: string;
  keyFindings: string[];
  recommendations: AIInsightRecommendation[];
  evidence: MetricEvidencePacket;
  model: string;
  promptVersion: string;
}

export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;

  classifyComment(comment: RawCommentData): Promise<CommentAnalysisResult>;
  analyzeConversation(
    conversationId: string,
    messages: RawMessageData[]
  ): Promise<ConversationAnalysisResult>;
  generateInsight(
    evidence: MetricEvidencePacket,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<AIInsightResult>;
}
