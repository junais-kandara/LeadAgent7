import { PlaywrightMCPClient } from './mcp-client';
import { createAdminClient } from '../db/supabase-server';
import { MCPHealthStatus } from './types';

export class ConnectorHealthService {
  private mcpClient: PlaywrightMCPClient;

  constructor(mcpClient?: PlaywrightMCPClient) {
    this.mcpClient = mcpClient || new PlaywrightMCPClient();
  }

  /**
   * Evaluates end-to-end health of the connector subsystem.
   */
  public async checkHealth(): Promise<MCPHealthStatus> {
    const ping = await this.mcpClient.ping();
    let dbReachable = false;

    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from('sync_jobs').select('id').limit(1);
      dbReachable = !error;
    } catch {
      dbReachable = false;
    }

    const healthy = ping.ok && dbReachable;

    return {
      healthy,
      mcpServerReachable: ping.ok,
      workerReachable: ping.ok,
      latencyMs: ping.latencyMs,
      version: '1.0.0',
      error: !ping.ok ? 'Playwright MCP worker unreachable' : undefined,
    };
  }
}
