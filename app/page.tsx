'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageCircle,
  Users2,
  UploadCloud,
  CalendarClock,
  Mail,
  Calendar,
  Sparkles,
  Settings,
  Moon,
  LogOut,
} from 'lucide-react';

interface AppModule {
  id: string;
  moduleNumber: number;
  name: string;
  description: string;
  href: string;
  icon: React.ElementType;
  badgeBg: string;
  iconColor: string;
  isPrimary: boolean;
}

const APP_MODULES: AppModule[] = [
  {
    id: 'dashboard',
    moduleNumber: 1,
    name: 'Dashboard',
    description: 'Executive overview, real-time analytics & conversion metrics',
    href: '/dashboard',
    icon: LayoutDashboard,
    badgeBg: 'bg-blue-50 group-hover:bg-blue-100',
    iconColor: 'text-blue-600',
    isPrimary: true,
  },
  {
    id: 'crm',
    moduleNumber: 3,
    name: 'CRM',
    description: 'Interactive Odoo Kanban pipeline & customer deals',
    href: '/crm',
    icon: Users2,
    badgeBg: 'bg-emerald-50 group-hover:bg-emerald-100',
    iconColor: 'text-emerald-600',
    isPrimary: true,
  },
  {
    id: 'whatsapp',
    moduleNumber: 2,
    name: 'WhatsApp',
    description: 'Omnichannel chats, Baileys bridge & instant AI responses',
    href: '/whatsapp',
    icon: MessageCircle,
    badgeBg: 'bg-green-50 group-hover:bg-green-100',
    iconColor: 'text-green-600',
    isPrimary: true,
  },
  {
    id: 'lead-gen',
    moduleNumber: 4,
    name: 'Lead Gen',
    description: 'Upload customer CSV, column mapping & automated lead creation',
    href: '/lead-gen',
    icon: UploadCloud,
    badgeBg: 'bg-amber-50 group-hover:bg-amber-100',
    iconColor: 'text-amber-600',
    isPrimary: true,
  },
  {
    id: 'campaign-scheduler',
    moduleNumber: 5,
    name: 'Campaign Scheduler',
    description: 'Broadcast timelines, scheduled dispatch & anti-ban jitter control',
    href: '/campaign-scheduler',
    icon: CalendarClock,
    badgeBg: 'bg-orange-50 group-hover:bg-orange-100',
    iconColor: 'text-orange-600',
    isPrimary: true,
  },
  {
    id: 'email-marketing',
    moduleNumber: 6,
    name: 'Email Marketing',
    description: 'Branded email campaigns, Groq AI copywriter & tracking',
    href: '/email-marketing',
    icon: Mail,
    badgeBg: 'bg-indigo-50 group-hover:bg-indigo-100',
    iconColor: 'text-indigo-600',
    isPrimary: true,
  },
  {
    id: 'calendar',
    moduleNumber: 0,
    name: 'Calendar',
    description: 'Appointment scheduling & Cal.com synced bookings',
    href: '/bookings',
    icon: Calendar,
    badgeBg: 'bg-rose-50 group-hover:bg-rose-100',
    iconColor: 'text-rose-600',
    isPrimary: false,
  },
  {
    id: 'insights',
    moduleNumber: 0,
    name: 'AI Insights',
    description: 'Groq LLM evidence synthesis & verified recommendations',
    href: '/insights',
    icon: Sparkles,
    badgeBg: 'bg-purple-50 group-hover:bg-purple-100',
    iconColor: 'text-purple-600',
    isPrimary: false,
  },
  {
    id: 'settings',
    moduleNumber: 0,
    name: 'Settings',
    description: 'Organization settings, RLS configuration & API secrets',
    href: '/settings',
    icon: Settings,
    badgeBg: 'bg-slate-100 group-hover:bg-slate-200',
    iconColor: 'text-slate-600',
    isPrimary: false,
  },
];

export default function AppLauncherPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col p-6 sm:p-10 select-none">
      {/* Top Header: Matching exact image ("Good morning, Junais", Moon icon, "JK" avatar) */}
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto pb-10">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Good morning, Junais
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Moon Icon */}
          <button
            title="Toggle Theme"
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <Moon className="w-4 h-4 text-slate-500" />
          </button>

          {/* User Initials Avatar "JK" */}
          <Link
            href="/login"
            title="Junais Kandara • Click to sign out"
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 shadow-2xs text-slate-700 font-bold text-xs flex items-center justify-center group-hover:ring-2 group-hover:ring-[#714B67] transition-all">
              JK
            </div>
          </Link>
        </div>
      </header>

      {/* Main Apps Grid matching user screenshot */}
      <main className="max-w-6xl w-full mx-auto flex-1 flex flex-col">
        {/* Primary 6 Modules Section */}
        <div className="mb-4">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-4 px-1">
            Core Modules
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {APP_MODULES.filter((m) => m.isPrimary).map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center gap-3 aspect-square group text-center cursor-pointer relative"
                >
                  {/* Module Badge Number */}
                  <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-slate-300 group-hover:text-slate-500">
                    M{module.moduleNumber}
                  </span>

                  {/* Soft Pastel Icon Container */}
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${module.badgeBg}`}
                  >
                    <Icon className={`w-6 h-6 ${module.iconColor}`} />
                  </div>

                  {/* Module Title */}
                  <div className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {module.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Secondary System Tools */}
        <div className="mt-8">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-4 px-1">
            System & Tools
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {APP_MODULES.filter((m) => !m.isPrimary).map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col items-center justify-center gap-3 aspect-square group text-center cursor-pointer"
                >
                  <div
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 ${module.badgeBg}`}
                  >
                    <Icon className={`w-6 h-6 ${module.iconColor}`} />
                  </div>

                  <div className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                    {module.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <footer className="mt-auto pt-16 pb-6 text-center text-xs text-slate-400">
          LeadAgent7 Enterprise Edition • Multi-tenant RLS • Connected to Supabase
        </footer>
      </main>
    </div>
  );
}
