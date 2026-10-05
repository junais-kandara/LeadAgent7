import { createAdminClient } from '@/lib/db/supabase-server';
import { Radio, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const supabase = createAdminClient();
  const { data: accounts } = await supabase.from('social_accounts').select('*');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Channel & Account Connections</h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage Instagram, Facebook, YouTube, Google Ads, and WhatsApp Baileys bridge integrations.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card: Instagram */}
          <div className="p-5 rounded-xl bg-slate-900 border border-[#1e293b] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Instagram</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Ready</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Connect Instagram Professional / Creator account for Reels and comments.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Playwright MCP / Graph API</span>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs">Connect</button>
            </div>
          </div>

          {/* Card: WhatsApp */}
          <div className="p-5 rounded-xl bg-slate-900 border border-[#1e293b] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">WhatsApp (Baileys)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Next Up</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Secure backend adapter connecting your Baileys bridge for chat sync.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">Milestone 3</span>
              <button className="px-3 py-1 bg-slate-800 text-slate-400 rounded font-medium text-xs cursor-not-allowed">Adapter</button>
            </div>
          </div>

          {/* Card: Google Ads */}
          <div className="p-5 rounded-xl bg-slate-900 border border-[#1e293b] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">Google Ads</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">Configured</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Official Google Ads API/OAuth integration for campaign spend and CPL.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500">OAuth 2.0</span>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs">Connect</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
