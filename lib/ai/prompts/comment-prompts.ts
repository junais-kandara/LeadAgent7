import { RawCommentData } from '../types';

export const COMMENT_PROMPT_VERSION = 'v1.0.0';

export function buildCommentAnalysisPrompt(comment: RawCommentData): {
  system: string;
  user: string;
} {
  const system = `You are an expert CRM lead qualification and buyer intent analysis system for LeadAgent7.
Analyze the user's social media comment.
You must classify:
1. sentiment: positive, neutral, or negative
2. intent: purchase, pricing, booking, availability, support, spam, or general
3. leadScore: integer from 0 to 100 representing commercial purchase likelihood
4. requiresFollowup: true if the commenter asked a question or expressed buying intent
5. priority: high, medium, or low
6. reason: a concise explanation of your scoring and classification

OUTPUT RULES:
- Output MUST be valid, raw JSON only without markdown formatting, backticks, or preamble.
- Do not invent facts.`;

  const user = `Comment Information:
- Platform: ${comment.postPlatform || 'Social'}
- Post Title: ${comment.postTitle || 'General Content'}
- Author: ${comment.authorName || 'User'}
- Comment Text: "${comment.text}"

Analyze this comment and return raw JSON matching the schema.`;

  return { system, user };
}
