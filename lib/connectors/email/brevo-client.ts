/**
 * Brevo (formerly Sendinblue) Email Marketing Connector
 *
 * Implements Brevo v3 Transactional and Campaign SMTP REST API.
 * Provides fallback mock execution when BREVO_API_KEY is not configured.
 */

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoSender {
  name: string;
  email: string;
}

export interface BrevoSendOptions {
  to: BrevoRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: BrevoSender;
  params?: Record<string, string>;
  tags?: string[];
}

export interface BrevoSendResult {
  success: boolean;
  messageId: string;
  provider: 'brevo';
  mode: 'live' | 'mock';
  error?: string;
}

export class BrevoClient {
  private apiKey: string;
  private defaultSender: BrevoSender;

  constructor(options?: { apiKey?: string; defaultSender?: BrevoSender }) {
    this.apiKey = options?.apiKey || process.env.BREVO_API_KEY || '';
    this.defaultSender = options?.defaultSender || {
      name: process.env.BREVO_SENDER_NAME || 'LeadAgent7 Team',
      email: process.env.BREVO_SENDER_EMAIL || 'consultations@leadagent7.com',
    };
  }

  /**
   * Returns true if a live Brevo API Key is configured in environment.
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Sends an email or broadcast batch through Brevo v3 REST API.
   */
  public async sendEmail(options: BrevoSendOptions): Promise<BrevoSendResult> {
    const sender = options.sender || this.defaultSender;

    // Replace parameter placeholders in HTML & text content
    let finalHtml = options.htmlContent;
    if (options.params) {
      for (const [key, val] of Object.entries(options.params)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
        finalHtml = finalHtml.replace(regex, val);
      }
    }

    // Live execution mode when API key is configured
    if (this.isConfigured()) {
      try {
        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'api-key': this.apiKey,
          },
          body: JSON.stringify({
            sender,
            to: options.to,
            subject: options.subject,
            htmlContent: finalHtml,
            textContent: options.textContent || finalHtml.replace(/<[^>]*>?/gm, ''),
            params: options.params || {},
            tags: options.tags || ['leadagent7_marketing'],
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.message || `Brevo returned HTTP ${res.status}`);
        }

        const data = await res.json();
        return {
          success: true,
          messageId: data.messageId || `brevo_${Date.now()}`,
          provider: 'brevo',
          mode: 'live',
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          messageId: '',
          provider: 'brevo',
          mode: 'live',
          error: message,
        };
      }
    }

    // Resilient simulated mode when BREVO_API_KEY is not yet populated
    const mockMessageId = `<brevo_sim_${Date.now()}_${Math.random().toString(36).substring(7)}@smtp-relay.brevo.com>`;
    return {
      success: true,
      messageId: mockMessageId,
      provider: 'brevo',
      mode: 'mock',
    };
  }
}
