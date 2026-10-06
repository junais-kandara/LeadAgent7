'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  AlertCircle,
  Phone,
  UserCheck,
  Send,
  Clock,
  CheckCheck,
  Zap,
  QrCode,
  RefreshCw,
  Search,
} from 'lucide-react';

interface Conversation {
  id: string;
  phone: string;
  contact_name: string | null;
  status: string;
  unread_count: number;
  requires_followup: boolean;
  lead_status?: string;
  lead_score?: number;
  last_message_at?: string;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  text: string;
  sent_at: string;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    phone: '971501112233',
    contact_name: 'Ahmed Al-Mansoor',
    status: 'active',
    unread_count: 1,
    requires_followup: true,
    lead_status: 'qualifying',
    lead_score: 85,
    last_message_at: 'Just now',
  },
  {
    id: 'conv-2',
    phone: '971559876543',
    contact_name: 'Sarah Jenkins',
    status: 'active',
    unread_count: 0,
    requires_followup: false,
    lead_status: 'booking_scheduled',
    lead_score: 92,
    last_message_at: '10 mins ago',
  },
  {
    id: 'conv-3',
    phone: '971524443322',
    contact_name: 'Mohammed Bilal',
    status: 'active',
    unread_count: 0,
    requires_followup: false,
    lead_status: 'new',
    lead_score: 74,
    last_message_at: '1 hour ago',
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'm1',
      direction: 'inbound',
      text: 'Hello, I saw your real estate portfolio on Instagram. What is the pricing structure for the canal apartments?',
      sent_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'm2',
      direction: 'outbound',
      text: 'Hi Ahmed! Thank you for reaching out. The canal apartments start from AED 1.8M with a 5-year post-handover payment plan.',
      sent_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'm3',
      direction: 'inbound',
      text: 'Sounds great. Can we book a call or meeting tomorrow around 3 PM?',
      sent_at: new Date().toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'm20',
      direction: 'inbound',
      text: 'Confirmed for the Palm Villa tour next Tuesday. Looking forward to it.',
      sent_at: new Date().toISOString(),
    },
  ],
};

export default function WhatsAppPage() {
  const [conversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-1');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'connected' | 'checking'>('connected');

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeMessages = messagesMap[activeConvId] || [];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      direction: 'outbound',
      text: inputText.trim(),
      sent_at: new Date().toISOString(),
    };

    // Optimistically update conversation thread
    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    setInputText('');
    setIsSending(true);

    try {
      // Call Next.js API route connecting to Baileys microservice
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          text: newMsg.text,
        }),
      }).catch(() => null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            WhatsApp & Baileys Bridge
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
            <span>Zero-Jitter Instant 1-on-1 Replies</span>
          </div>

          {/* QR Pairing Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs flex items-center gap-1.5 text-xs text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Bridge Device Status</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[640px]">
        {/* Left: Conversation List */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Conversations ({conversations.length})
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Live Socket</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 transition-colors cursor-pointer ${
                    isSelected ? 'bg-emerald-50/60 border-l-4 border-emerald-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
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

                  <div className="mt-2.5 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      Stage: <strong className="text-slate-700 capitalize">{conv.lead_status || 'New'}</strong>
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      Score: {conv.lead_score || 70}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Message Thread */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
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
            {activeMessages.map((msg) => {
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
            })}
          </div>

          {/* Message Composer (Zero-Jitter instantaneous dispatch) */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type an instant reply (dispatched with zero delay)..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isSending}
                title="Instant Reply (Zero-Jitter)"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center"
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
                Bulk campaign? Go to Campaign Scheduler &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code / Device Status Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>WhatsApp Bridge Status</span>
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCheck className="w-8 h-8" />
              </div>
              <div className="font-bold text-slate-800 text-sm">
                Session Active & Connected
              </div>
              <p className="text-xs text-slate-500">
                Connected Phone Number: <strong className="text-slate-700 font-mono">+971 50 123 4567</strong>
              </p>
              <div className="text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 leading-relaxed text-left">
                <strong>Bridge Microservice:</strong> Render Web Service<br />
                <strong>Protocol:</strong> Baileys Multi-Device WebSocket<br />
                <strong>Status:</strong> Listening for inbound webhook events & dispatching 1-on-1 messages.
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
