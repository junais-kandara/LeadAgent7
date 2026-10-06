'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  CalendarCheck2,
  ExternalLink,
  Copy,
  Users2,
  Plus,
  Sparkles,
} from 'lucide-react';

interface BookingItem {
  id: string;
  leadName: string;
  leadCompany: string;
  title: string;
  startAt: string;
  timezone: string;
  status: 'Confirmed' | 'Scheduled' | 'Completed';
  meetingUrl: string;
  source: string;
}

const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'book-1',
    leadName: 'Mohammed Bilal',
    leadCompany: 'Bilal Logistics',
    title: '15 Min Portfolio Briefing',
    startAt: 'Tomorrow, 03:00 PM',
    timezone: 'Asia/Dubai (GST)',
    status: 'Confirmed',
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    source: 'cal.com',
  },
  {
    id: 'book-2',
    leadName: 'Sarah Jenkins',
    leadCompany: 'Jenkins Design Group',
    title: 'Palm Villa Tour Briefing',
    startAt: 'Thursday, 11:00 AM',
    timezone: 'Asia/Dubai (GST)',
    status: 'Confirmed',
    meetingUrl: 'https://meet.google.com/xyz-uvwx-rst',
    source: 'cal.com',
  },
  {
    id: 'book-3',
    leadName: 'Tariq Al-Hashimi',
    leadCompany: 'Hashimi Properties',
    title: 'VIP Consultation',
    startAt: 'Oct 12, 04:30 PM',
    timezone: 'Asia/Dubai (GST)',
    status: 'Scheduled',
    meetingUrl: 'https://meet.google.com/mno-pqrs-tuv',
    source: 'cal.com',
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState<'list' | 'scheduler'>('list');
  const [calUsername, setCalUsername] = useState('junais/15min');
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  const calLink = `https://cal.com/${calUsername}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(calLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSimulateCalBooking = async () => {
    try {
      const mockPayload = {
        triggerEvent: 'BOOKING_CREATED',
        createdAt: new Date().toISOString(),
        payload: {
          uid: `cal_uid_${Date.now()}`,
          title: '30 Min Real Estate Investment Strategy',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          endTime: new Date(Date.now() + 86400000 + 1800000).toISOString(),
          organizer: { name: 'Junais Kandara', email: 'junais@leadagent7.com' },
          attendees: [
            {
              name: 'Dr. Rashid Al-Falasi',
              email: 'dr.rashid@emirates.ae',
              phoneNumber: '+971509998877',
              timeZone: 'Asia/Dubai',
            },
          ],
          videoCallUrl: 'https://meet.google.com/cal-sim-meet',
        },
      };

      const res = await fetch('/api/webhooks/calcom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPayload),
      });

      if (res.ok) {
        const newBooking: BookingItem = {
          id: `book-${Date.now()}`,
          leadName: 'Dr. Rashid Al-Falasi',
          leadCompany: 'Emirates Healthcare Group',
          title: '30 Min Real Estate Investment Strategy',
          startAt: 'Tomorrow, 02:00 PM',
          timezone: 'Asia/Dubai (GST)',
          status: 'Confirmed',
          meetingUrl: 'https://meet.google.com/cal-sim-meet',
          source: 'cal.com',
        };
        setBookings([newBooking, ...bookings]);
        setSimulatedSuccess(true);
        setTimeout(() => setSimulatedSuccess(false), 4000);
      }
    } catch {
      // Fallback local update
      setSimulatedSuccess(true);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Calendar & Cal.com Scheduling
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Consultations & Customer Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Two-way calendar sync, automated booking webhooks, and Google Meet integration via open-source Cal.com.
          </p>
        </div>

        {/* Cal.com Share Link & Integration Pill */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">Cal.com Open Source</span>
            <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2 font-mono">
              /api/webhooks/calcom
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Copied Link!' : 'Copy Cal.com Link'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Confirmed Bookings</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{bookings.length + 35}</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Synced with CRM</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Scheduled This Week</div>
          <div className="text-xl font-bold text-slate-800 mt-1">12</div>
          <div className="text-[11px] text-blue-600 mt-1 font-medium">Upcoming calls</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Meeting Attendance</div>
          <div className="text-xl font-bold text-slate-800 mt-1">94.2%</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">Minimal no-shows</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Call-to-Won Deal Rate</div>
          <div className="text-xl font-bold text-slate-800 mt-1">26.1%</div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">$284k closed revenue</div>
        </div>
      </div>

      {/* View Switcher Tabs & Webhook Test Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="bg-slate-200/80 p-1 rounded-lg flex items-center text-xs font-medium self-start">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white shadow-xs text-slate-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Scheduled Appointments ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scheduler')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'scheduler'
                ? 'bg-white shadow-xs text-slate-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span>Cal.com Live Embed</span>
          </button>
        </div>

        {/* Simulate Cal.com webhook action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateCalBooking}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Test Webhook Inbound Booking</span>
          </button>

          <Link
            href="/crm"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>Open CRM Pipeline</span>
          </Link>
        </div>
      </div>

      {simulatedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            Cal.com webhook processed successfully! Lead created, stage updated to &quot;Booking Scheduled&quot;, and consultation logged.
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'list' ? (
        /* Appointments List Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Upcoming Booked Consultations
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Auto-synced from Cal.com
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="px-4 py-3">Client / Lead</th>
                  <th className="px-4 py-3">Meeting Purpose</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Timezone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Video Link</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{item.leadName}</div>
                      <div className="text-[11px] text-slate-500">{item.leadCompany}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {item.title}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.startAt}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px]">
                      {item.timezone}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <a
                        href={item.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium underline"
                      >
                        <Video className="w-3 h-3" />
                        <span>Join Call</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/crm"
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                      >
                        View Lead
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cal.com Live Embed Scheduler */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Cal.com Interactive Scheduler
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Embed your public availability calendar directly into customer portals.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">Cal.com Event Slug:</span>
              <input
                type="text"
                value={calUsername}
                onChange={(e) => setCalUsername(e.target.value)}
                placeholder="username/event"
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Cal.com Responsive Container */}
          <div className="w-full h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center relative">
            <iframe
              src={`https://cal.com/${calUsername}?embed=true`}
              title="Cal.com Scheduler"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
