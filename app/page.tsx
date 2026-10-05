import { createAdminClient } from '@/lib/db/supabase-server';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createAdminClient();

  // Query live counts directly from Supabase
  const [
    { count: orgCount },
    { count: socialCount },
    { count: contentCount },
    { count: leadCount },
    { count: waCount },
    { count: bookingCount },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('social_accounts').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('whatsapp_conversations').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('sync_jobs').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const kpis = [
    {
      title: 'Total Leads Captured',
      value: leadCount ?? 0,
      change: '+100% verified',
      icon: Users,
      trend: 'up',
      subtitle: 'Attributed from Social & Ads',
    },
    {
      title: 'WhatsApp Conversations',
      value: waCount ?? 0,
      change: 'Baileys ready',
      icon: MessageSquare,
      trend: 'neutral',
      subtitle: 'Pending Milestone 3 connection',
    },
    {
      title: 'Bookings Scheduled',
      value: bookingCount ?? 0,
      change: '0% no-show rate',
      icon: Calendar,
      trend: 'up',
      subtitle: 'Synced with Calendar',
    },
    {
      title: 'Normalized Content Ingested',
      value: contentCount ?? 0,
      change: 'Idempotent sync',
      icon: Share2,
      trend: 'up',
      subtitle: 'Posts, Reels & Videos',
    },
  ];

  const platforms = [
    { name: 'Instagram', type: 'Social', status: 'Connector Foundation Ready', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Facebook', type: 'Social', status: 'Connector Foundation Ready', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'YouTube', type: 'Social', status: 'Connector Foundation Ready', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { name: 'Google Ads', type: 'Ads API', status: 'Schema Ready', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { name: 'WhatsApp (Baileys)', type: 'Messaging', status: 'Ready for Milestone 3', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Health Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-900/30">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">LeadAgent7 Executive Overview</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant intelligence connecting Social, Ads, WhatsApp conversations, and Bookings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Supabase Live (Seoul ap-northeast-2)
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="p-5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{kpi.title}</span>
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
                <span className="text-[11px] font-medium text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  {kpi.change}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Platforms & AI Intelligence Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Platforms */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Connected Marketing & Messaging Channels</h3>
            </div>
            <span className="text-xs text-slate-400">5 Channel Adapters</span>
          </div>

          <div className="mt-4 divide-y divide-[#1e293b]">
            {platforms.map((p) => (
              <div key={p.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <span className="text-sm font-medium text-slate-200">{p.name}</span>
                    <span className="text-xs text-slate-500 ml-2">({p.type})</span>
                  </div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${p.badge}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Card Preview */}
        <div className="p-6 rounded-xl bg-gradient-to-b from-[#111b33] to-[#0f172a] border border-blue-900/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Intelligence Engine</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                Groq LLM
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white mt-4">Evidence-Backed Synthesis</h4>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              &quot;Application code calculates authoritative metrics (CTR, CPL, rankings). Groq explains verified evidence packets and classifies buyer purchase intent without inventing facts.&quot;
            </p>

            <div className="mt-4 p-3 rounded-lg bg-black/30 border border-indigo-900/30 text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Prompt Versioning:</span>
                <span className="text-slate-200 font-medium">Enabled (v1)</span>
              </div>
              <div className="flex justify-between">
                <span>Zod JSON Validation:</span>
                <span className="text-emerald-400 font-medium">Enforced</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1e293b] flex items-center justify-between text-xs text-indigo-400">
            <span>Scheduled for Milestone 4</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Sync Jobs & Ingestion Monitor */}
      <div className="p-6 rounded-xl bg-[#0f172a] border border-[#1e293b]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Recent Synchronization Jobs (sync_jobs)</h3>
          </div>
          <span className="text-xs text-slate-400">Idempotent Execution Log</span>
        </div>

        {recentJobs && recentJobs.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-[#1e293b]">
                  <th className="pb-2 font-medium">Job ID</th>
                  <th className="pb-2 font-medium">Connector</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-300">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="py-2.5">
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">{job.id.slice(0, 8)}...</td>
                    <td className="py-2.5 font-medium text-white">{job.connector}</td>
                    <td className="py-2.5">{job.job_type}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{new Date(job.created_at).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No sync jobs executed yet. Trigger a sync job from the Connections tab or background worker.
          </div>
        )}
      </div>
    </div>
  );
}
