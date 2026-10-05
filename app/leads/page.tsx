import { createAdminClient } from '@/lib/db/supabase-server';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const supabase = createAdminClient();
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <h2 className="text-xl font-bold text-white tracking-tight">Leads & Source Attribution</h2>
        <p className="text-xs text-slate-400 mt-1">
          Lead scores, source attribution (Content $\to$ WhatsApp $\to$ Booking), and status management.
        </p>

        {leads && leads.length > 0 ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-[#1e293b]">
                  <th className="pb-3 font-medium">Contact Name</th>
                  <th className="pb-3 font-medium">Platform</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-300">
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="py-3 font-medium text-white">{lead.contact_name}</td>
                    <td className="py-3">{lead.source_platform || 'direct'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">{lead.lead_score}</td>
                    <td className="py-3 text-slate-400">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 p-8 border border-dashed border-[#1e293b] rounded-xl text-center">
            <p className="text-sm text-slate-300 font-medium">No leads captured yet</p>
            <p className="text-xs text-slate-500 mt-1">Leads will automatically populate as social comments and WhatsApp chats are classified.</p>
          </div>
        )}
      </div>
    </div>
  );
}
