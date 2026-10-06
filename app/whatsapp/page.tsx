import { createAdminClient } from '@/lib/db/supabase-server';
import {
  MessageSquare,
  AlertCircle,
  Phone,
  UserCheck,
  Send,
  Clock,
  CheckCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

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
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Module 2: WhatsApp & Baileys Bridge
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            WhatsApp Live Inquiries & Conversations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time chat ingestion, phone matching, intent classification, and instant AI responses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Zero-Jitter Indicator */}
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Jitter Instant AI Replies Active</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Bridge: <code className="text-emerald-700 font-mono text-[11px]">Baileys Persistent Socket</code>
          </div>
        </div>
      </div>

      {/* Main Conversation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
        {/* Left: Conversation List */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Conversations ({conversations?.length ?? 0})
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Synced</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                const lead = Array.isArray(conv.leads) ? conv.leads[0] : conv.leads;
                return (
                  <div
                    key={conv.id}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-emerald-50/50 border-l-3 border-emerald-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          {conv.contact_name ? conv.contact_name.slice(0, 2).toUpperCase() : 'WA'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                            {conv.contact_name || `+${conv.phone}`}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">+{conv.phone}</p>
                        </div>
                      </div>

                      {conv.requires_followup && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5 inline" />
                          Follow-up
                        </span>
                      )}
                    </div>

                    {lead && (
                      <div className="mt-2.5 flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          Stage: <strong className="text-slate-700 capitalize">{lead.status}</strong>
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                          Score: {lead.lead_score}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                No active WhatsApp conversations yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Message Thread */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          {activeConv ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {activeConv.contact_name ? activeConv.contact_name.slice(0, 2).toUpperCase() : 'WA'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      {activeConv.contact_name || `+${activeConv.phone}`}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">+{activeConv.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/crm"
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    View in CRM
                  </Link>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F0F2F5]/40">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isInbound = msg.direction === 'inbound';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                            isInbound
                              ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80'
                              : 'bg-[#D9FDD3] text-slate-900 rounded-tr-xs border border-emerald-200/60'
                          }`}
                        >
                          {msg.text}
                          <div
                            className={`flex items-center gap-1 mt-1 text-[9px] ${
                              isInbound ? 'text-slate-400' : 'text-slate-500 justify-end'
                            }`}
                          >
                            <Clock className="w-2.5 h-2.5" />
                            <span>{new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {!isInbound && <CheckCheck className="w-3 h-3 text-emerald-600 inline" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                    <span>No messages exchanged yet in this thread.</span>
                  </div>
                )}
              </div>

              {/* Message Composer (Zero-Jitter instantaneous dispatch) */}
              <div className="p-4 border-t border-slate-100 bg-white">
                <form
                  action={`/api/webhooks/whatsapp`}
                  method="POST"
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    name="replyText"
                    placeholder="Type an instant 1-on-1 response or query..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    title="Instant Reply (Zero-Jitter)"
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    Interactive 1-on-1 replies dispatch immediately (Zero Jitter Delay)
                  </span>
                  <Link href="/campaign-scheduler" className="text-orange-600 hover:underline">
                    Need bulk broadcast? Go to Campaign Scheduler &rarr;
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 p-8">
              <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
              <span>Select a conversation from the left to view message history.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
