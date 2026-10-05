import { z } from 'zod';

const ConnectorConfigSchema = z.object({
  playwrightMcpUrl: z.string().url().optional().default('http://localhost:8989'),
  playwrightMcpToken: z.string().optional().default(''),
  appBaseUrl: z.string().url().optional().default('http://localhost:3000'),
  encryptionKey: z.string().min(16).default('0123456789abcdef0123456789abcdef'),
  maxRetries: z.number().int().min(0).max(10).default(3),
  timeoutMs: z.number().int().min(1000).max(120000).default(30000),
});

export type ConnectorConfig = z.infer<typeof ConnectorConfigSchema>;

export function getConnectorConfig(): ConnectorConfig {
  // Ensure this is never called on the client side
  if (typeof window !== 'undefined') {
    throw new Error('Connector configuration can only be accessed on the server.');
  }

  return ConnectorConfigSchema.parse({
    playwrightMcpUrl: process.env.PLAYWRIGHT_MCP_URL || 'http://localhost:8989',
    playwrightMcpToken: process.env.PLAYWRIGHT_MCP_TOKEN || '',
    appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
    encryptionKey: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
    maxRetries: Number(process.env.MCP_MAX_RETRIES || 3),
    timeoutMs: Number(process.env.MCP_TIMEOUT_MS || 30000),
  });
}
