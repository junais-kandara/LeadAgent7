import { createAdminClient } from '@/lib/db/supabase-server';
import {
  MessageSquare,
  AlertCircle,
  Phone,
  UserCheck,
  Send,
  Clock,
  CheckCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WhatsAppPage() {
  const supabase = createAdminClient();

  // Retrieve all conversations with associated lead information
  const { data: conversations } = await supabase
    .from('whatsapp_conversations')
    .select(`
      *,
      leads (
        id,
        contact_name,
        status,
        lead_score
      )
    `)
    .order('last_message_at', { ascending: false });

  // Retrieve the latest conversation's messages for preview
  const activeConv = conversations?.[0];
  let messages: Array<{
    id: string;
    direction: string;
    text: string | null;
    sent_at: string;
  }> = [];

  if (activeConv) {
    const { data: msgs } = await supabase
      .from('whatsapp_messages')
      .select('id, direction, text, sent_at')
      .eq('conversation_id', activeConv.id)
      .order('sent_at', { ascending: true })
      .limit(50);

    messages = msgs || [];
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">WhatsApp Baileys Bridge</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Adapter Active & Verified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time chat ingestion, automatic lead matching, unread indicators, and appointment intent detection.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Webhook: <code className="text-blue-400 font-mono text-[11px]">/api/webhooks/whatsapp</code>
        </div>
      </div>

      {/* Main Conversation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
        {/* Left: Conversation List */}
        <div className="rounded-xl bg-[#0f172a] border border-[#1e293b] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1e293b] flex justify-between items-center bg-[#0d1424]">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Conversations ({conversations?.length ?? 0})
            </span>
            <span className="text-[10px] text-slate-500">Live Sync</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1e293b]">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                const lead = Array.isArray(conv.leads) ? conv.leads[0] : conv.leads;
                return (
                  <div
                    key={conv.id}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-950/30 border-l-2 border-blue-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center justify-center font-bold text-xs">
                          {conv.contact_name ? conv.contact_name.slice(0, 2).toUpperCase() : 'WA'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-[140px]">
                            {conv.contact_name || `+${conv.phone}`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">+{conv.phone}</p>
                        </div>
                      </div>

                      {conv.requires_followup && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5 inline" />
                          Follow-up
                        </span>
                      )}
                    </div>

                    {lead && (
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-400" />
                          Lead: <strong className="text-slate-200 capitalize">{lead.status}</strong>
                        </span>
                        <span className="text-emerald-400 font-bold">Score: {lead.lead_score}</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                No WhatsApp conversations yet.
                <p className="text-[11px] text-slate-600 mt-1">Inbound messages from Baileys bridge will appear here in real time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Message History Thread */}
        <div className="lg:col-span-2 rounded-xl bg-[#0f172a] border border-[#1e293b] flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-[#1e293b] bg-[#0d1424] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    {activeConv.contact_name ? activeConv.contact_name.slice(0, 2).toUpperCase() : 'WA'}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{activeConv.contact_name || `+${activeConv.phone}`}</h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Phone: +{activeConv.phone}</span>
                      <span>•</span>
                      <span>Bridge ID: {activeConv.external_id.slice(0, 16)}...</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">
                    Lead Status: <strong className="text-white capitalize">{activeConv.leads?.status || 'Active'}</strong>
                  </span>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#090d16]">
                {messages.length > 0 ? (
                  messages.map((m) => {
                    const isInbound = m.direction === 'inbound';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isInbound
                              ? 'bg-[#182234] text-slate-100 rounded-tl-sm border border-slate-700/60'
                              : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                          }`}
                        >
                          <p>{m.text}</p>
                          <div
                            className={`flex items-center gap-1 text-[9px] mt-1.5 justify-end ${
                              isInbound ? 'text-slate-400' : 'text-blue-200'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isInbound && <CheckCheck className="w-3 h-3 ml-0.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No message history recorded for this conversation thread.
                  </div>
                )}
              </div>

              {/* Outbound Quick Reply Bar */}
              <div className="p-4 border-t border-[#1e293b] bg-[#0d1424] flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type an outbound message via Baileys bridge..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors">
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
              <Phone className="w-10 h-10 text-slate-700 mb-3" />
              Select a WhatsApp conversation to preview message transcripts and lead history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
