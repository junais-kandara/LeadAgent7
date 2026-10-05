import { getConnectorConfig } from './config';

export class HumanActionRequiredError extends Error {
  constructor(public readonly reason: string, public readonly checkpointType: 'captcha' | 'mfa' | 'checkpoint') {
    super(`Human action required: ${reason}`);
    this.name = 'HumanActionRequiredError';
  }
}

export class ConnectorNetworkError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ConnectorNetworkError';
  }
}

export interface MCPToolCallRequest {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolCallResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isHumanActionRequired?: boolean;
  humanActionReason?: string;
}

/**
 * Playwright MCP Client / Service Abstraction
 * Manages JSON-RPC / HTTP calls to the background Playwright service on Render.
 */
export class PlaywrightMCPClient {
  private mcpUrl: string;
  private mcpToken: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(options?: { mcpUrl?: string; mcpToken?: string; maxRetries?: number; timeoutMs?: number }) {
    const config = getConnectorConfig();
    this.mcpUrl = options?.mcpUrl || config.playwrightMcpUrl;
    this.mcpToken = options?.mcpToken || config.playwrightMcpToken;
    this.maxRetries = options?.maxRetries ?? config.maxRetries;
    this.timeoutMs = options?.timeoutMs ?? config.timeoutMs;
  }

  /**
   * Executes a tool against the Playwright MCP worker with retry and checkpoint detection.
   */
  public async executeTool<T = unknown>(request: MCPToolCallRequest): Promise<T> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= this.maxRetries) {
      try {
        return await this.sendRequest<T>(request);
      } catch (err: unknown) {
        lastError = err as Error;

        // If human intervention is needed (MFA / CAPTCHA), NEVER retry. Fail immediately.
        if (err instanceof HumanActionRequiredError) {
          throw err;
        }

        attempt++;
        if (attempt > this.maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 500, 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error(`Tool call failed after ${this.maxRetries} attempts.`);
  }

  private async sendRequest<T>(request: MCPToolCallRequest): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.mcpUrl}/v1/tools/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.mcpToken ? { Authorization: `Bearer ${this.mcpToken}` } : {}),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new ConnectorNetworkError(`MCP server error: ${response.status} ${response.statusText}`, response.status);
      }

      const result: MCPToolCallResponse<T> = await response.json();

      // Detect Human Action Checkpoints
      if (result.isHumanActionRequired) {
        throw new HumanActionRequiredError(
          result.humanActionReason || 'Security verification required',
          'captcha'
        );
      }

      if (!result.success) {
        // Inspect error string for bot challenge signatures
        const errLower = (result.error || '').toLowerCase();
        if (errLower.includes('captcha') || errLower.includes('challenge') || errLower.includes('verify it\'s you') || errLower.includes('2fa')) {
          throw new HumanActionRequiredError(result.error!, 'captcha');
        }

        throw new Error(result.error || 'MCP tool execution returned unsuccessful response');
      }

      return result.data as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Health ping to the worker.
   */
  public async ping(): Promise<{ ok: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const res = await fetch(`${this.mcpUrl}/health`, {
        headers: this.mcpToken ? { Authorization: `Bearer ${this.mcpToken}` } : {},
      });
      return {
        ok: res.ok,
        latencyMs: Date.now() - start,
      };
    } catch {
      return {
        ok: false,
        latencyMs: Date.now() - start,
      };
    }
  }
}
