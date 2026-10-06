import { RawMessageData } from '../types';

export const CONVERSATION_PROMPT_VERSION = 'v1.0.0';

export function buildConversationAnalysisPrompt(messages: RawMessageData[]): {
  system: string;
  user: string;
} {
  const system = `You are a conversational CRM lead qualification intelligence engine for LeadAgent7.
Analyze the customer's WhatsApp conversation transcript.
You must classify:
1. intent: purchase, pricing, booking, callback, support, or spam
2. leadScore: integer from 0 to 100 based on buyer engagement and purchase readiness
3. priority: high, medium, or low
4. requiresFollowup: boolean (true if customer is waiting for a response, price quote, or callback)
5. appointmentIntent: boolean (true if customer requested or discussed an appointment/booking/demo)
6. sentiment: positive, neutral, or negative
7. summary: 2-3 sentence executive summary of customer inquiry and current stage
8. recommendedAction: specific next step for the sales representative

OUTPUT RULES:
- Output MUST be valid, raw JSON only without markdown formatting, backticks, or preamble.
- Base your analysis strictly on the transcript evidence.`;

  const transcript = messages
    .map(
      (m) =>
        `[${m.sentAt}] ${m.direction === 'inbound' ? 'Customer' : 'Agent'}: ${m.text}`
    )
    .join('\n');

  const user = `WhatsApp Conversation Transcript:
${transcript || 'No messages provided.'}

Analyze this transcript and return raw JSON matching the schema.`;

  return { system, user };
}
