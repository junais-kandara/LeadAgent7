import { createAdminClient } from '@/lib/db/supabase-server';
import {
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  BrainCircuit,
  Layers,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const supabase = createAdminClient();

  // Query real AI insights from Supabase
  const { data: insights } = await supabase
    .from('ai_insights')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const latestInsight = insights?.[0];

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] bg-[#F8F9FA] p-6 space-y-6 max-w-[1500px] mx-auto">
      {/* Control Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-teal-50 text-[#017E84]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              AI Marketing & Conversion Intelligence
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-[#017E84] border border-teal-200">
              Groq Engine Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative calculations in SQL/TypeScript. Groq synthesizes verified evidence into executive explanations and recommended actions.
          </p>
        </div>

        {/* Generate Action Form */}
        <form action="/api/ai/generate-insights" method="POST">
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#017E84] hover:bg-[#00666B] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Generate Daily Insight</span>
          </button>
        </form>
      </div>

      {/* Main Insights Content */}
      {latestInsight ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Executive Summary & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                  <BrainCircuit className="w-4 h-4 text-[#714B67]" />
                  <span>Executive Synthesis ({latestInsight.insight_type} Report)</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {new Date(latestInsight.period_start).toLocaleDateString()} — {new Date(latestInsight.period_end).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {latestInsight.summary}
              </p>

              {/* Verified Metadata Ribbon */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zod Schema Validated</span>
                </span>
                <span>Model: <strong className="text-slate-800 font-semibold">{latestInsight.model}</strong></span>
                <span>Prompt: <strong className="text-slate-800 font-semibold">{latestInsight.prompt_version}</strong></span>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
                <Target className="w-4 h-4 text-[#017E84]" />
                <span>Recommended Business Actions</span>
              </div>

              <div className="space-y-3">
                {Array.isArray(latestInsight.recommendations) &&
                  latestInsight.recommendations.map((rec: Record<string, unknown>, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-[#714B67] transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {String(rec.title || `Action ${idx + 1}`)}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          rec.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {String(rec.priority || 'medium')} Priority
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {String(rec.action || '')}
                      </p>
                      {rec.expectedImpact ? (
                        <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Expected Impact: {String(rec.expectedImpact)}</span>
                        </div>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Col: Verified Evidence Packet Inspection */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Verified Metric Evidence Packet</span>
              </div>

              <div className="space-y-3 text-xs">
                {latestInsight.evidence && typeof latestInsight.evidence === 'object' ? (
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Period Duration:</span>
                      <span className="font-bold text-slate-800 uppercase">{latestInsight.insight_type}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Total Leads Captured:</span>
                      <span className="font-bold text-slate-800">
                        {((latestInsight.evidence as any)?.metrics?.totalLeads) ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">WhatsApp Active Chats:</span>
                      <span className="font-bold text-slate-800">
                        {((latestInsight.evidence as any)?.metrics?.whatsappConversations) ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Confirmed Bookings:</span>
                      <span className="font-bold text-slate-800">
                        {((latestInsight.evidence as any)?.metrics?.bookings) ?? 0}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Conversion Rate:</span>
                      <span className="font-bold text-[#017E84]">
                        {((latestInsight.evidence as any)?.metrics?.conversionRatePct) ?? 0}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs">No evidence packet data attached.</p>
                )}
              </div>
            </div>

            {/* Historical Insight Archive */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                Recent Intelligence Runs
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {insights.map((ins) => (
                  <div key={ins.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 capitalize">{ins.insight_type} Report</span>
                      <span className="text-[10px] text-slate-400 block">{new Date(ins.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                      {ins.model.slice(0, 15)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
          <Sparkles className="w-12 h-12 text-[#017E84] mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No AI Insights Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Click below to compile authoritative metrics across your connected marketing channels and generate your first evidence-backed report.
          </p>
          <form action="/api/ai/generate-insights" method="POST" className="inline-block">
            <button
              type="submit"
              className="px-5 py-2.5 rounded bg-[#017E84] hover:bg-[#00666B] text-white text-xs font-bold shadow-xs inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate First Daily Insight</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
