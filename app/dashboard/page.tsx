'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users2,
  MessageCircle,
  Calendar,
  TrendingUp,
  Mail,
  UploadCloud,
  CalendarClock,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Module 1: Executive Dashboard
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Intelligence Overview & Platform Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline analytics, cross-channel attribution, and quick module launchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/insights"
            className="px-3.5 py-1.5 bg-[#017E84] hover:bg-[#006A70] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Groq Insights</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Leads</div>
          <div className="text-xl font-bold text-slate-800 mt-1">482</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> +18.4%
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">WhatsApp Chats</div>
          <div className="text-xl font-bold text-slate-800 mt-1">128</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> 92% reply rate
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">CSV Ingested</div>
          <div className="text-xl font-bold text-slate-800 mt-1">142</div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Oct Batch #4</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Booked Calls</div>
          <div className="text-xl font-bold text-slate-800 mt-1">46</div>
          <div className="text-[11px] text-blue-600 mt-1 font-medium">Cal.com sync</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Emails Sent</div>
          <div className="text-xl font-bold text-slate-800 mt-1">1,842</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">42.8% open rate</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Closed Won</div>
          <div className="text-xl font-bold text-slate-800 mt-1">$284,000</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">12 closed deals</div>
        </div>
      </div>

      {/* Quick Launchers to Other 5 Modules */}
      <div className="mt-8">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
          Quick Access Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/whatsapp"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">WhatsApp</div>
              <div className="text-[11px] text-slate-500">Live chat & Baileys</div>
            </div>
          </Link>

          <Link
            href="/crm"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700">CRM Pipeline</div>
              <div className="text-[11px] text-slate-500">Kanban stages & deals</div>
            </div>
          </Link>

          <Link
            href="/lead-gen"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Lead Gen</div>
              <div className="text-[11px] text-slate-500">CSV upload & ingest</div>
            </div>
          </Link>

          <Link
            href="/campaign-scheduler"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-orange-700">Scheduler</div>
              <div className="text-[11px] text-slate-500">Anti-ban jitter queues</div>
            </div>
          </Link>

          <Link
            href="/email-marketing"
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Email Marketing</div>
              <div className="text-[11px] text-slate-500">AI sequences & Resend</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Attribution Table & Recent Stream */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
            Marketing Channel Performance & ROI
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="px-3 py-2.5">Source Platform</th>
                  <th className="px-3 py-2.5">Leads Captured</th>
                  <th className="px-3 py-2.5">WhatsApp Engaged</th>
                  <th className="px-3 py-2.5">Bookings</th>
                  <th className="px-3 py-2.5">Conv. Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-3 py-3 font-semibold text-slate-800">CSV Customer Ingestion</td>
                  <td className="px-3 py-3 text-slate-600">142</td>
                  <td className="px-3 py-3 text-slate-600">94</td>
                  <td className="px-3 py-3 text-slate-600">18</td>
                  <td className="px-3 py-3 font-semibold text-emerald-600">12.7%</td>
                </tr>
                <tr>
                  <td className="px-3 py-3 font-semibold text-slate-800">Instagram Ad Campaigns</td>
                  <td className="px-3 py-3 text-slate-600">184</td>
                  <td className="px-3 py-3 text-slate-600">112</td>
                  <td className="px-3 py-3 text-slate-600">16</td>
                  <td className="px-3 py-3 font-semibold text-emerald-600">8.7%</td>
                </tr>
                <tr>
                  <td className="px-3 py-3 font-semibold text-slate-800">Google Ads Search</td>
                  <td className="px-3 py-3 text-slate-600">92</td>
                  <td className="px-3 py-3 text-slate-600">68</td>
                  <td className="px-3 py-3 text-slate-600">9</td>
                  <td className="px-3 py-3 font-semibold text-emerald-600">9.8%</td>
                </tr>
                <tr>
                  <td className="px-3 py-3 font-semibold text-slate-800">Direct WhatsApp Referral</td>
                  <td className="px-3 py-3 text-slate-600">64</td>
                  <td className="px-3 py-3 text-slate-600">64</td>
                  <td className="px-3 py-3 text-slate-600">12</td>
                  <td className="px-3 py-3 font-semibold text-emerald-600">18.7%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Stream */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">
            Live Conversion Activity
          </h3>
          <div className="space-y-3.5 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <div>
                <div className="font-semibold text-slate-800">Booking Confirmed: Tariq Al-Hashimi</div>
                <div className="text-slate-500 text-[11px]">Via WhatsApp Outreach • 12 mins ago</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
              <div>
                <div className="font-semibold text-slate-800">CSV Imported: 142 Contacts</div>
                <div className="text-slate-500 text-[11px]">Mapped to Oct 2026 Promo List • 35 mins ago</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
              <div>
                <div className="font-semibold text-slate-800">Email Broadcast Delivered</div>
                <div className="text-slate-500 text-[11px]">580 recipients via Resend API • 2 hrs ago</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
              <div>
                <div className="font-semibold text-slate-800">Deal Won: $85,000 Commission</div>
                <div className="text-slate-500 text-[11px]">Moved to Won by Junais Kandara • 4 hrs ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
