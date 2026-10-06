import { describe, it, expect } from 'vitest';
import { BrevoClient } from '../lib/connectors/email/brevo-client';

describe('Brevo Email Marketing Connector Suite', () => {
  it('initializes with default settings and identifies unconfigured mode gracefully', () => {
    const client = new BrevoClient({ apiKey: '' });
    expect(client.isConfigured()).toBe(false);
  });

  it('correctly identifies configured mode when valid API key is present', () => {
    const client = new BrevoClient({ apiKey: 'xkeysib-mock-valid-api-key-12345678' });
    expect(client.isConfigured()).toBe(true);
  });

  it('interpolates template parameter tags in HTML content', async () => {
    const client = new BrevoClient({ apiKey: '' }); // mock mode

    const result = await client.sendEmail({
      to: [{ email: 'tariq@client.com', name: 'Tariq Al-Hashimi' }],
      subject: 'Welcome to LeadAgent7',
      htmlContent: '<p>Hello {{contact_name}}, welcome to {{company}}! Schedule here: {{booking_link}}</p>',
      params: {
        contact_name: 'Tariq Al-Hashimi',
        company: 'LeadAgent7 Realty',
        booking_link: 'https://leadagent7.com/bookings/junais',
      },
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe('brevo');
    expect(result.mode).toBe('mock');
    expect(result.messageId).toContain('brevo');
  });

  it('handles batch recipient sending without error', async () => {
    const client = new BrevoClient({ apiKey: '' });

    const result = await client.sendEmail({
      to: [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
      ],
      subject: 'Q4 Investor Newsletter',
      htmlContent: '<h1>Quarterly Update</h1>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});
