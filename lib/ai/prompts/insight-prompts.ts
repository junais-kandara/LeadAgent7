import { MetricEvidencePacket } from '../types';

export const INSIGHT_PROMPT_VERSION = 'v1.0.0';

export function buildInsightGenerationPrompt(evidence: MetricEvidencePacket): {
  system: string;
  user: string;
} {
  const system = `You are the LeadAgent7 AI Executive Marketing & Conversion Intelligence Advisor.
You will be provided with an authoritative, verified metric evidence packet compiled from database calculations.
Your task is to synthesize the qualitative explanation of:
1. WHAT happened during this reporting period?
2. WHY did it happen based on the evidence?
3. WHAT NEXT ACTIONS should the marketing and sales leadership execute?

STRICT RULES:
- The numbers provided are authoritative. Do NOT recalculate or invent different numbers.
- Base all insights strictly on the provided evidence packet.
- Output MUST be valid, raw JSON matching the required schema without markdown formatting or preamble.`;

  const user = `Reporting Period: ${evidence.period.toUpperCase()} (${evidence.startDate} to ${evidence.endDate})
Verified Metrics Packet:
- Total Leads Captured: ${evidence.metrics.totalLeads}
- Qualified Leads: ${evidence.metrics.qualifiedLeads}
- WhatsApp Active Threads: ${evidence.metrics.whatsappConversations}
- Confirmed Bookings: ${evidence.metrics.bookings}
- Funnel Conversion Rate: ${evidence.metrics.conversionRatePct}%
${evidence.metrics.adSpend ? `- Total Ad Spend: $${evidence.metrics.adSpend}` : ''}
${evidence.metrics.cpl ? `- Cost Per Lead (CPL): $${evidence.metrics.cpl}` : ''}
${evidence.metrics.topChannel ? `- Top Acquiring Channel: ${evidence.metrics.topChannel}` : ''}
${evidence.metrics.topContentTitle ? `- Best Performing Content: "${evidence.metrics.topContentTitle}"` : ''}

${
  evidence.priorPeriodComparison
    ? `Prior Period Comparison:
- Lead Growth: ${evidence.priorPeriodComparison.leadGrowthPct ?? 0}%
- Booking Growth: ${evidence.priorPeriodComparison.bookingGrowthPct ?? 0}%`
    : ''
}

Analyze this evidence and provide executive summary, keyFindings (array), and recommendations (array with title, action, priority, expectedImpact).`;

  return { system, user };
}
