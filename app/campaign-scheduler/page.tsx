'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  Clock,
  Send,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Sparkles,
} from 'lucide-react';

interface ScheduledCampaign {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'both';
  audience: string;
  recipientsCount: number;
  scheduledTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Paused';
  jitterRange: string;
  progressPercent: number;
}

const INITIAL_CAMPAIGNS: ScheduledCampaign[] = [
  {
    id: 'camp-1',
    name: 'October VIP Real Estate Showcase',
    channel: 'whatsapp',
    audience: 'CSV Import (142 Leads)',
    recipientsCount: 142,
    scheduledTime: 'Today at 02:00 PM',
    status: 'Scheduled',
    jitterRange: '8s – 18s random jitter',
    progressPercent: 0,
  },
  {
    id: 'camp-2',
    name: 'WhatsApp Follow-up: Q4 Consultation Promo',
    channel: 'whatsapp',
    audience: 'CRM Qualifying (38 Leads)',
    recipientsCount: 38,
    scheduledTime: 'Tomorrow at 10:30 AM',
    status: 'Scheduled',
    jitterRange: '10s – 20s random jitter',
    progressPercent: 0,
  },
  {
    id: 'camp-3',
    name: 'Weekly Digest & Market Report',
    channel: 'email',
    audience: 'All Registered Leads (580)',
    recipientsCount: 580,
    scheduledTime: 'Completed (Yesterday)',
    status: 'Completed',
    jitterRange: 'Batch Dispatch (Resend)',
    progressPercent: 100,
  },
];

export default function CampaignSchedulerPage() {
  const [campaigns, setCampaigns] = useState<ScheduledCampaign[]>(INITIAL_CAMPAIGNS);
  const [showModal, setShowModal] = useState(false);

  // New campaign modal form state
  const [campName, setCampName] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'both'>('whatsapp');
  const [audience, setAudience] = useState('CSV Import (142 Leads)');
  const [minJitter, setMinJitter] = useState(8);
  const [maxJitter, setMaxJitter] = useState(18);
  const [scheduleTime, setScheduleTime] = useState('2026-10-06T15:00');
  const [messageTemplate, setMessageTemplate] = useState(
    'Hi {{contact_name}}, this is Junais from LeadAgent7. We noticed your interest in our premium real estate listings. Would you like to schedule a quick 10-minute overview?'
  );

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: ScheduledCampaign = {
      id: `camp-${Date.now()}`,
      name: campName || 'Untitled Scheduled Broadcast',
      channel,
      audience,
      recipientsCount: audience.includes('142') ? 142 : 50,
      scheduledTime: new Date(scheduleTime).toLocaleString(),
      status: 'Scheduled',
      jitterRange: channel === 'whatsapp' || channel === 'both' ? `${minJitter}s – ${maxJitter}s random jitter` : 'Batch API',
      progressPercent: 0,
    };

    setCampaigns([newCamp, ...campaigns]);
    setShowModal(false);
    setCampName('');
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Campaign Scheduler
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Multi-Channel Broadcast & Jitter Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automate scheduled marketing dispatches with anti-ban jitter algorithms specifically guarding WhatsApp queues.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Schedule New Campaign</span>
        </button>
      </div>

      {/* Compliance / Jitter Policy Notice */}
      <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-950">
            Enforced Anti-Ban Protection Active for Broadcast Messages
          </div>
          <p className="text-amber-800 leading-relaxed">
            WhatsApp broadcasts automatically space consecutive deliveries using randomized delays (jitter: 8s–18s) to replicate natural human typing cadences and shield your number from Meta spam bans.
            <strong className="ml-1 text-amber-950 font-semibold">
              Live AI Chat & 1-on-1 replies bypass this queue and remain instantaneous.
            </strong>
          </p>
        </div>
      </div>

      {/* Campaign Queue Table */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Broadcast Queues & Scheduled Timelines
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {campaigns.length} campaigns in queue
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-3">Campaign Name</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Target Audience</th>
                <th className="px-4 py-3">Scheduled For</th>
                <th className="px-4 py-3">Anti-Ban Jitter Policy</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {camp.name}
                  </td>
                  <td className="px-4 py-3.5">
                    {camp.channel === 'whatsapp' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </span>
                    )}
                    {camp.channel === 'email' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-200">
                        <Mail className="w-3 h-3" /> Email
                      </span>
                    )}
                    {camp.channel === 'both' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium text-[11px] border border-purple-200">
                        Omnichannel
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">
                    {camp.audience}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {camp.scheduledTime}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {camp.jitterRange}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {camp.status === 'Scheduled' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                        Scheduled
                      </span>
                    )}
                    {camp.status === 'Completed' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                        Completed
                      </span>
                    )}
                    {camp.status === 'In Progress' && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200 animate-pulse">
                        Sending...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => alert(`Triggering immediate dispatch for ${camp.name}`)}
                      className="px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded transition-colors"
                    >
                      Trigger Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800">
                Schedule Marketing Campaign
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="e.g. November Dubai Marina Investor Outreach"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="whatsapp">WhatsApp Broadcast</option>
                    <option value="email">Email Marketing</option>
                    <option value="both">Both (Multi-Touch)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Target Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="CSV Import (142 Leads)">CSV Import (142 Leads)</option>
                    <option value="CRM Qualifying (38 Leads)">CRM Qualifying (38 Leads)</option>
                    <option value="Uncontacted Inquiries (64 Leads)">Uncontacted Inquiries (64 Leads)</option>
                  </select>
                </div>
              </div>

              {/* Jitter Configuration for WhatsApp */}
              {(channel === 'whatsapp' || channel === 'both') && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                    <span>WhatsApp Anti-Ban Randomized Jitter</span>
                    <span className="font-mono text-amber-700">{minJitter}s – {maxJitter}s delay</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-600 block text-[11px] mb-0.5">Min Delay (Seconds)</span>
                      <input
                        type="number"
                        min="3"
                        max="30"
                        value={minJitter}
                        onChange={(e) => setMinJitter(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-slate-600 block text-[11px] mb-0.5">Max Delay (Seconds)</span>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={maxJitter}
                        onChange={(e) => setMaxJitter(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
