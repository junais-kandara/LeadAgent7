'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  Users2,
  BarChart3,
  RefreshCw,
  Copy,
} from 'lucide-react';

export default function EmailMarketingPage() {
  const [subject, setSubject] = useState('Exclusive Invitation: Prime Real Estate Opportunities in Downtown');
  const [previewText, setPreviewText] = useState('Preview high-yield units before public launch...');
  const [audience, setAudience] = useState('CSV Import (142 Leads)');
  const [templateBody, setTemplateBody] = useState(
    `Dear {{contact_name}},\n\nFollowing up on our recent market overview, we are thrilled to present our hand-picked selection of luxury residential properties reserved for VIP investors.\n\nKey Highlights:\n• Guaranteed 8.2% Rental Yields\n• Flexible 5-Year Payment Plans\n• Prime Water Canal & Downtown Views\n\nWould you be open for a private 15-minute briefing this week?\n\nSchedule your time directly on my calendar:\n{{booking_link}}\n\nWarm regards,\nJunais Kandara\nLeadAgent7 Portfolio Director`
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleGenerateAICopy = async () => {
    setIsGeneratingAI(true);
    // Simulating Groq Llama 3.3 fast generation
    setTimeout(() => {
      setSubject('Private Consultation: Off-Market Investment Portfolios for {{company}}');
      setTemplateBody(
        `Hi {{contact_name}},\n\nI hope this email finds you well at {{company}}.\n\nWe have just released an off-market catalog of luxury properties featuring high capital appreciation and guaranteed rental yield structures.\n\nGiven your interest in prime real estate developments, I wanted to share this portfolio before it opens to the broader market next month.\n\nFeel free to book a convenient 10-minute slot on my schedule here:\n{{booking_link}}\n\nBest regards,\nJunais Kandara\nLeadAgent7 Team`
      );
      setIsGeneratingAI(false);
    }, 700);
  };

  const handleSendCampaign = () => {
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
    }, 4000);
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Email Marketing
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Email Campaign Studio & AI Copywriter
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft high-converting email sequences, generate copy with Groq AI, and broadcast to uploaded CSV leads.
          </p>
        </div>

        {/* Email Engine Status Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-700">Resend API Connected</span>
            <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">3,000/mo Free Tier</span>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Delivered Emails</div>
          <div className="text-xl font-bold text-slate-800 mt-1">1,842</div>
          <div className="text-[11px] text-emerald-600 mt-1">99.4% inbox rate</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Average Open Rate</div>
          <div className="text-xl font-bold text-slate-800 mt-1">42.8%</div>
          <div className="text-[11px] text-emerald-600 mt-1">+12% vs industry avg</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Click-to-Booking Rate</div>
          <div className="text-xl font-bold text-slate-800 mt-1">18.5%</div>
          <div className="text-[11px] text-indigo-600 mt-1">34 consultations booked</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Unsubscribe Rate</div>
          <div className="text-xl font-bold text-slate-800 mt-1">0.3%</div>
          <div className="text-[11px] text-slate-400 mt-1">Within optimal limits</div>
        </div>
      </div>

      {/* Main Campaign Composer Canvas */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Email Settings & AI Assistant (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Campaign Composer
            </h3>

            {/* Groq AI Button */}
            <button
              onClick={handleGenerateAICopy}
              disabled={isGeneratingAI}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{isGeneratingAI ? 'Drafting with Groq...' : 'Generate Copy with Groq AI'}</span>
            </button>
          </div>

          {/* Target Audience */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Select Audience Segment
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="CSV Import (142 Leads)">CSV Upload Leads (142 contacts)</option>
              <option value="CRM Qualifying Leads (38 Leads)">CRM Qualifying Leads (38 contacts)</option>
              <option value="VIP High Score Investors (Score 70+)">VIP High Score Investors (Score 70+)</option>
              <option value="All Leads (580 Leads)">All Leads (580 contacts)</option>
            </select>
          </div>

          {/* Subject Line */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Preview Text */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Inbox Preview Snippet
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Email Body */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Email Content (Supports Dynamic Placeholders)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                Tags: {'{{contact_name}}'}, {'{{company}}'}, {'{{booking_link}}'}
              </span>
            </div>
            <textarea
              rows={9}
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          {/* Dispatch Bar */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => alert('Test email sent to junais.kandara@leadagent7.com')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Send Test to My Inbox
            </button>

            <button
              onClick={handleSendCampaign}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Campaign Now</span>
            </button>
          </div>

          {sendSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Campaign dispatched successfully via Resend to {audience}!</span>
            </div>
          )}
        </div>

        {/* Right Preview Card (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Live Recipient Preview</span>
            </h3>
            <span className="text-[11px] text-slate-400">Desktop Client</span>
          </div>

          {/* Mock Email Client Container */}
          <div className="flex-1 border border-slate-200 rounded-xl bg-slate-50/50 p-4 flex flex-col text-xs shadow-inner">
            {/* Mock Email Header */}
            <div className="border-b border-slate-200 pb-3 mb-3 space-y-1">
              <div className="text-slate-500 text-[11px]">
                <strong className="text-slate-700">From:</strong> Junais Kandara &lt;consultations@leadagent7.com&gt;
              </div>
              <div className="text-slate-500 text-[11px]">
                <strong className="text-slate-700">To:</strong> Ahmed Al-Mansoor &lt;ahmed@client.com&gt;
              </div>
              <div className="font-bold text-slate-900 pt-1">
                {subject.replace(/\{\{\s*company\s*\}\}/gi, 'Al-Mansoor Investments')}
              </div>
            </div>

            {/* Email Body Preview with substituted placeholders */}
            <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-line text-slate-800 leading-relaxed text-[11px]">
              {templateBody
                .replace(/\{\{\s*contact_name\s*\}\}/gi, 'Ahmed Al-Mansoor')
                .replace(/\{\{\s*company\s*\}\}/gi, 'Al-Mansoor Investments')
                .replace(/\{\{\s*booking_link\s*\}\}/gi, 'https://leadagent7.com/bookings/junais')}
            </div>

            {/* Unsubscribe footer */}
            <div className="pt-3 text-[10px] text-slate-400 text-center">
              You received this email as a registered client of LeadAgent7. Click here to unsubscribe.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
