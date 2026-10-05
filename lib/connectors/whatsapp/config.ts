import { z } from 'zod';

const WhatsAppConfigSchema = z.object({
  bridgeUrl: z.string().url().default('http://localhost:3001'),
  bridgeToken: z.string().default(''),
});

export type WhatsAppConfig = z.infer<typeof WhatsAppConfigSchema>;

export function getWhatsAppConfig(): WhatsAppConfig {
  if (typeof window !== 'undefined') {
    throw new Error('WhatsApp bridge configuration is strictly server-side.');
  }

  return WhatsAppConfigSchema.parse({
    bridgeUrl: process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:3001',
    bridgeToken: process.env.WHATSAPP_BRIDGE_TOKEN || '',
  });
}
