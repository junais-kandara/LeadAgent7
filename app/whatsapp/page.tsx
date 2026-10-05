export default function WhatsAppPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">WhatsApp Baileys Conversations</h2>
            <p className="text-xs text-slate-400 mt-1">
              Live customer conversation threads, unread indicators, appointment intent, and follow-up flags.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Milestone 3 Pending
          </span>
        </div>
        <div className="mt-8 p-8 border border-dashed border-[#1e293b] rounded-xl text-center">
          <p className="text-sm text-slate-300 font-medium">Ready for Baileys Bridge Integration</p>
          <p className="text-xs text-slate-500 mt-1">Proceed to Milestone 3 to connect your Baileys bridge adapter and start streaming conversations.</p>
        </div>
      </div>
    </div>
  );
}
