'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  Calendar,
  MessageCircle,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';

interface CRMLead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  stage: 'new' | 'qualifying' | 'booking' | 'won';
  score: number;
  value: number;
  source: string;
  tags: string[];
}

const INITIAL_CRM_LEADS: CRMLead[] = [
  {
    id: 'lead-1',
    name: 'Ahmed Al-Mansoor',
    company: 'Al-Mansoor Capital',
    phone: '+971 50 111 2233',
    email: 'ahmed@almansoor.ae',
    stage: 'new',
    score: 85,
    value: 45000,
    source: 'CSV Upload',
    tags: ['VIP', 'Downtown High-Rise'],
  },
  {
    id: 'lead-2',
    name: 'Sarah Jenkins',
    company: 'Jenkins Design Group',
    phone: '+971 55 987 6543',
    email: 'sarah@jenkinsdesign.com',
    stage: 'qualifying',
    score: 92,
    value: 80000,
    source: 'Instagram Ad',
    tags: ['Palm Villa', 'Hot'],
  },
  {
    id: 'lead-3',
    name: 'Mohammed Bilal',
    company: 'Bilal Logistics',
    phone: '+971 52 444 3322',
    email: 'mbilal@logistics.me',
    stage: 'booking',
    score: 78,
    value: 35000,
    source: 'WhatsApp Inbound',
    tags: ['Consultation Oct 8'],
  },
  {
    id: 'lead-4',
    name: 'Elena Rostova',
    company: 'Rostov Trade FZE',
    phone: '+971 58 777 8899',
    email: 'elena@rostovtrade.com',
    stage: 'won',
    score: 95,
    value: 120000,
    source: 'CSV Upload',
    tags: ['Penthouse', 'Won Closed'],
  },
  {
    id: 'lead-5',
    name: 'David Miller',
    company: 'Apex Solutions',
    phone: '+971 54 222 1199',
    email: 'david@apexsol.com',
    stage: 'new',
    score: 64,
    value: 28000,
    source: 'Google Ads',
    tags: ['Marina Two-Bed'],
  },
  {
    id: 'lead-6',
    name: 'Fatima Al-Nuaimi',
    company: 'Nuaimi Holdings',
    phone: '+971 50 888 4411',
    email: 'fatima@nuaimi.ae',
    stage: 'qualifying',
    score: 88,
    value: 95000,
    source: 'CSV Upload',
    tags: ['Investor', 'Oct Batch'],
  },
];

const STAGES = [
  { id: 'new', name: 'NEW INQUIRIES', color: 'border-t-blue-500', badgeBg: 'bg-blue-50 text-blue-700' },
  { id: 'qualifying', name: 'QUALIFYING & WHATSAPP', color: 'border-t-amber-500', badgeBg: 'bg-amber-50 text-amber-700' },
  { id: 'booking', name: 'BOOKING SCHEDULED', color: 'border-t-purple-500', badgeBg: 'bg-purple-50 text-purple-700' },
  { id: 'won', name: 'WON / CONVERTED', color: 'border-t-emerald-500', badgeBg: 'bg-emerald-50 text-emerald-700' },
];

export default function CRMPage() {
  const [leads, setLeads] = useState<CRMLead[]>(INITIAL_CRM_LEADS);
  const [filterScore, setFilterScore] = useState<'all' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const moveStage = (leadId: string, currentStage: CRMLead['stage']) => {
    const stageOrder: CRMLead['stage'][] = ['new', 'qualifying', 'booking', 'won'];
    const nextIdx = stageOrder.indexOf(currentStage) + 1;
    if (nextIdx < stageOrder.length) {
      const nextStage = stageOrder[nextIdx];
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: nextStage } : l))
      );
    }
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery);
    const matchesScore = filterScore === 'high' ? l.score >= 80 : true;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="flex-1 bg-[#F8F9FA] flex flex-col p-6 max-w-7xl w-full mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            Module 3: CRM Pipeline
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Sales Deals & Kanban Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Progress customer relationships from initial contact to confirmed bookings and closed revenue.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/lead-gen"
            className="px-3.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Import CSV Leads</span>
          </Link>

          <button
            onClick={() => {
              const newLead: CRMLead = {
                id: `lead-${Date.now()}`,
                name: 'New Prospective Client',
                company: 'Direct Inquiry',
                phone: '+971 50 000 9988',
                email: 'inquiry@client.com',
                stage: 'new',
                score: 75,
                value: 30000,
                source: 'Direct Portal',
                tags: ['New Lead'],
              };
              setLeads([newLead, ...leads]);
            }}
            className="px-4 py-1.5 rounded-lg bg-[#017E84] hover:bg-[#006A70] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, company, or phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterScore('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterScore === 'all' ? 'bg-[#714B67] text-white font-semibold' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Leads ({leads.length})
          </button>
          <button
            onClick={() => setFilterScore('high')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterScore === 'high' ? 'bg-[#714B67] text-white font-semibold' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            High Score (&ge;80)
          </button>
        </div>
      </div>

      {/* 4-Stage Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 flex-1 items-start">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.id);
          const stageTotalValue = stageLeads.reduce((acc, curr) => acc + curr.value, 0);

          return (
            <div
              key={stage.id}
              className={`bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 flex flex-col gap-3 min-h-[480px] border-t-4 ${stage.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 tracking-wide">
                    {stage.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    ${stageTotalValue.toLocaleString()} total
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${stage.badgeBg}`}>
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-3 flex-1">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all group space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {lead.company}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Score {lead.score}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {lead.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                        {lead.source}
                      </span>
                    </div>

                    {/* Bottom Action: Stage Progression */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 text-[11px]">
                        ${lead.value.toLocaleString()}
                      </span>

                      {lead.stage !== 'won' ? (
                        <button
                          onClick={() => moveStage(lead.id, lead.stage)}
                          title="Advance to next pipeline stage"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2 py-0.5 rounded transition-colors"
                        >
                          <span>Advance</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deal Won</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {stageLeads.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                    No leads in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
