import { createAdminClient } from '../db/supabase-server';
import { SocialConnector, SyncJobOptions } from './types';
import { HumanActionRequiredError } from './mcp-client';

export interface SyncJobSummary {
  jobId: string;
  status: 'completed' | 'failed';
  postsSynced: number;
  commentsSynced: number;
  metricsSynced: number;
  error?: string;
}

/**
 * Connector Sync Orchestrator
 * Integrates connector execution with Supabase sync_jobs, normalized DB tables,
 * and audit_logs. Guarantees idempotent upserts.
 */
export class SyncOrchestrator {
  /**
   * Executes a synchronized ingestion job for a social account.
   */
  public async executeSyncJob(
    connector: SocialConnector,
    options: SyncJobOptions,
    actorUserId?: string
  ): Promise<SyncJobSummary> {
    const supabase = createAdminClient();
    const startTime = new Date();

    // 1. Create running job record in sync_jobs
    const { data: job, error: jobErr } = await supabase
      .from('sync_jobs')
      .insert({
        organization_id: options.organizationId,
        connector: options.connectorName,
        job_type: options.jobType,
        status: 'running',
        started_at: startTime.toISOString(),
        metadata: { socialAccountId: options.socialAccountId },
      })
      .select('id')
      .single();

    if (jobErr || !job) {
      throw new Error(`Failed to initialize sync job: ${jobErr?.message}`);
    }

    const jobId = job.id;
    let postsCount = 0;
    let commentsCount = 0;
    let metricsCount = 0;

    try {
      // 2. Sync profile details
      const profile = await connector.syncProfile(options.socialAccountId);
      if (profile && Object.keys(profile).length > 0) {
        await supabase
          .from('social_accounts')
          .update({
            account_name: (profile.name as string) || undefined,
            status: 'connected',
            last_sync_at: new Date().toISOString(),
            sync_error: null,
          })
          .eq('id', options.socialAccountId)
          .eq('organization_id', options.organizationId);
      }

      // 3. Sync Content and Metrics
      if (options.jobType === 'full_sync' || options.jobType === 'content_only') {
        const contentList = await connector.syncContent(options.socialAccountId);

        for (const item of contentList) {
          // Idempotent upsert into content
          const { data: contentRecord, error: contentErr } = await supabase
            .from('content')
            .upsert(
              {
                organization_id: options.organizationId,
                social_account_id: options.socialAccountId,
                platform: item.platform,
                external_id: item.externalId,
                content_type: item.contentType,
                title: item.title || null,
                text: item.text || null,
                url: item.url || null,
                published_at: item.publishedAt || null,
              },
              { onConflict: 'organization_id, platform, external_id' }
            )
            .select('id')
            .single();

          if (!contentErr && contentRecord) {
            postsCount++;

            // If metrics are attached, insert a new time-series metric entry
            if (item.metrics) {
              await supabase.from('content_metrics').insert({
                organization_id: options.organizationId,
                content_id: contentRecord.id,
                views: item.metrics.views || 0,
                likes: item.metrics.likes || 0,
                comments: item.metrics.comments || 0,
                shares: item.metrics.shares || 0,
                saves: item.metrics.saves || 0,
                reach: item.metrics.reach || 0,
                impressions: item.metrics.impressions || 0,
                captured_at: new Date().toISOString(),
              });
              metricsCount++;
            }
          }
        }
      }

      // 4. Sync Comments
      if (options.jobType === 'full_sync' || options.jobType === 'comments_only') {
        const comments = await connector.syncComments(options.socialAccountId);

        for (const comment of comments) {
          // Find matching content record by external ID
          const { data: matchedContent } = await supabase
            .from('content')
            .select('id')
            .eq('organization_id', options.organizationId)
            .eq('external_id', comment.contentExternalId)
            .single();

          if (matchedContent) {
            await supabase.from('comments').upsert(
              {
                organization_id: options.organizationId,
                content_id: matchedContent.id,
                external_id: comment.externalId,
                author_name: comment.authorName || 'Anonymous',
                text: comment.text,
                published_at: comment.publishedAt || new Date().toISOString(),
              },
              { onConflict: 'organization_id, external_id' }
            );
            commentsCount++;
          }
        }
      }

      // 5. Complete sync job
      const completedAt = new Date().toISOString();
      await supabase
        .from('sync_jobs')
        .update({
          status: 'completed',
          completed_at: completedAt,
          metadata: {
            postsSynced: postsCount,
            commentsSynced: commentsCount,
            metricsSynced: metricsCount,
          },
        })
        .eq('id', jobId);

      // 6. Record audit log
      await supabase.from('audit_logs').insert({
        organization_id: options.organizationId,
        actor_user_id: actorUserId || null,
        action: 'connector.sync.completed',
        resource_type: 'social_account',
        resource_id: options.socialAccountId,
        details: {
          jobId,
          connector: options.connectorName,
          postsSynced: postsCount,
          commentsSynced: commentsCount,
        },
      });

      return {
        jobId,
        status: 'completed',
        postsSynced: postsCount,
        commentsSynced: commentsCount,
        metricsSynced: metricsCount,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const isHumanAction = err instanceof HumanActionRequiredError;

      // Handle Human Action Required state
      if (isHumanAction) {
        await supabase
          .from('social_accounts')
          .update({
            status: 'human_action_required',
            sync_error: errorMessage,
          })
          .eq('id', options.socialAccountId);
      } else {
        await supabase
          .from('social_accounts')
          .update({
            sync_error: errorMessage,
          })
          .eq('id', options.socialAccountId);
      }

      // Update sync_jobs to failed
      await supabase
        .from('sync_jobs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error: errorMessage,
        })
        .eq('id', jobId);

      // Record audit log of failure
      await supabase.from('audit_logs').insert({
        organization_id: options.organizationId,
        actor_user_id: actorUserId || null,
        action: isHumanAction ? 'connector.sync.human_action_required' : 'connector.sync.failed',
        resource_type: 'social_account',
        resource_id: options.socialAccountId,
        details: {
          jobId,
          connector: options.connectorName,
          error: errorMessage,
        },
      });

      return {
        jobId,
        status: 'failed',
        postsSynced: postsCount,
        commentsSynced: commentsCount,
        metricsSynced: metricsCount,
        error: errorMessage,
      };
    }
  }
}
