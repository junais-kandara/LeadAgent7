import { BaileysAdapter } from './baileys-adapter';
import {
  BroadcastJobResult,
  BroadcastOptions,
  BroadcastProgress,
  BroadcastRecipient,
} from './types';
import { createAdminClient } from '../../db/supabase-server';

/**
 * Calculates a cryptographically un-patterned random jitter delay between minMs and maxMs.
 * Used exclusively for bulk / broadcast outreach to prevent WhatsApp anti-spam bans.
 */
export function calculateRandomJitter(minMs = 8000, maxMs = 18000): number {
  const min = Math.min(minMs, maxMs);
  const max = Math.max(minMs, maxMs);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Replaces template variables in the message body.
 * Supports {{contact_name}}, {{name}}, {{phone}}, and custom variables.
 */
export function interpolateTemplate(
  template: string,
  recipient: BroadcastRecipient
): string {
  let result = template;
  const name = recipient.contactName || 'there';
  result = result.replace(/\{\{\s*contact_name\s*\}\}/gi, name);
  result = result.replace(/\{\{\s*name\s*\}\}/gi, name);
  result = result.replace(/\{\{\s*phone\s*\}\}/gi, recipient.phone);

  if (recipient.customVariables) {
    for (const [key, val] of Object.entries(recipient.customVariables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
      result = result.replace(regex, val);
    }
  }

  return result;
}

export class WhatsAppBroadcastDispatcher {
  private adapter: BaileysAdapter;

  constructor(adapter?: BaileysAdapter) {
    this.adapter = adapter || new BaileysAdapter();
  }

  /**
   * Executes a bulk broadcast with enforced randomized jitter delay between sends.
   *
   * IMPORTANT INVARIANT:
   * Randomized Jitter is ONLY applied to broadcast queues. Interactive AI chats
   * and 1-on-1 customer replies bypass this dispatcher and send immediately.
   */
  public async dispatchBroadcast(options: BroadcastOptions): Promise<BroadcastJobResult> {
    const {
      organizationId,
      templateText,
      recipients,
      minJitterMs = 8000,
      maxJitterMs = 18000,
      sleepFn = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
      onProgress,
      signal,
    } = options;

    const startTime = Date.now();
    let sentCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let totalJitterAppliedMs = 0;
    let jitterSamplesCount = 0;

    const supabase = createAdminClient();

    for (let i = 0; i < recipients.length; i++) {
      if (signal?.aborted) {
        break;
      }

      const recipient = recipients[i];

      // Check opt-out status
      if (recipient.isOptedOut) {
        skippedCount++;
        if (onProgress) {
          await onProgress({
            currentIndex: i + 1,
            totalRecipients: recipients.length,
            recipientPhone: recipient.phone,
            status: 'skipped_optout',
            jitterDelayMsApplied: 0,
          });
        }
        continue;
      }

      const personalizedText = interpolateTemplate(templateText, recipient);
      let appliedJitterMs = 0;

      try {
        // Ensure conversation exists or create one
        const cleanPhone = recipient.phone.replace(/[^\d+]/g, '');
        const jid = `${cleanPhone.replace('+', '')}@s.whatsapp.net`;

        let conversationId: string;
        const { data: existingConv } = await supabase
          .from('whatsapp_conversations')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('external_id', jid)
          .single();

        if (existingConv) {
          conversationId = existingConv.id;
        } else {
          const { data: newConv } = await supabase
            .from('whatsapp_conversations')
            .insert({
              organization_id: organizationId,
              external_id: jid,
              phone: cleanPhone,
              contact_name: recipient.contactName || null,
              lead_id: recipient.leadId || null,
              status: 'active',
              unread_count: 0,
              requires_followup: false,
            })
            .select('id')
            .single();

          if (!newConv) {
            throw new Error('Failed to create or retrieve conversation record');
          }
          conversationId = newConv.id;
        }

        // Send the message via Baileys bridge
        const sendResult = await this.adapter.sendMessage(
          organizationId,
          conversationId,
          personalizedText
        );

        if (sendResult.success) {
          sentCount++;
        } else {
          failedCount++;
        }

        // Apply randomized jitter delay only if more recipients remain in the broadcast queue
        const isLastRecipient = i === recipients.length - 1;
        if (!isLastRecipient && !signal?.aborted) {
          appliedJitterMs = calculateRandomJitter(minJitterMs, maxJitterMs);
          totalJitterAppliedMs += appliedJitterMs;
          jitterSamplesCount++;

          // Pause execution with the randomized jitter
          await sleepFn(appliedJitterMs);
        }

        if (onProgress) {
          await onProgress({
            currentIndex: i + 1,
            totalRecipients: recipients.length,
            recipientPhone: recipient.phone,
            status: sendResult.success ? 'sent' : 'failed',
            messageId: sendResult.messageId,
            jitterDelayMsApplied: appliedJitterMs,
          });
        }
      } catch (err: unknown) {
        failedCount++;
        const errMsg = err instanceof Error ? err.message : String(err);
        if (onProgress) {
          await onProgress({
            currentIndex: i + 1,
            totalRecipients: recipients.length,
            recipientPhone: recipient.phone,
            status: 'failed',
            jitterDelayMsApplied: 0,
            error: errMsg,
          });
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const averageJitterMs =
      jitterSamplesCount > 0 ? Math.round(totalJitterAppliedMs / jitterSamplesCount) : 0;

    return {
      total: recipients.length,
      sentCount,
      skippedCount,
      failedCount,
      durationMs,
      averageJitterMs,
    };
  }
}
