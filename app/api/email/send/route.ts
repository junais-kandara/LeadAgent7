import { NextRequest, NextResponse } from 'next/server';
import { BrevoClient, BrevoRecipient } from '@/lib/connectors/email/brevo-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, htmlContent, params } = body;

    if (!to || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or htmlContent.' },
        { status: 400 }
      );
    }

    const recipients: BrevoRecipient[] = Array.isArray(to)
      ? to.map((r: any) => (typeof r === 'string' ? { email: r } : r))
      : [{ email: to }];

    const client = new BrevoClient();
    const result = await client.sendEmail({
      to: recipients,
      subject,
      htmlContent,
      params,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch via Brevo.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      recipientsCount: recipients.length,
      provider: result.provider,
      mode: result.mode,
      sentAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
