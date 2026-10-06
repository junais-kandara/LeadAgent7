'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Moon,
  Sparkles,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const APP_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/whatsapp': 'WhatsApp',
  '/crm': 'CRM Pipeline',
  '/lead-gen': 'Lead Gen (CSV Import)',
  '/campaign-scheduler': 'Campaign Scheduler',
  '/email-marketing': 'Email Marketing',
  '/bookings': 'Calendar & Bookings',
  '/insights': 'AI Insights',
  '/settings': 'Settings',
  '/leads': 'CRM Pipeline',
};

export default function AppHeader() {
  const pathname = usePathname();

  // Do not render any header on the login page or the launcher home page
  if (pathname === '/login' || pathname === '/') {
    return null;
  }

  const currentAppTitle = APP_TITLES[pathname] || 'Workspace';

  return (
    <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-4 shrink-0 shadow-sm z-50 select-none">
      {/* Left: App Launcher Waffle Button & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Waffle Button -> Back to App Launcher */}
        <Link
          href="/"
          title="Back to Apps Launcher"
          className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition-colors flex items-center justify-center group"
        >
          <LayoutGrid className="w-5 h-5 text-white/90 group-hover:scale-105 transition-transform" />
        </Link>

        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="font-bold text-sm tracking-tight text-white hover:text-white/80 transition-colors"
          >
            LeadAgent<span className="text-cyan-300">7</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/50" />
          <span className="font-semibold text-white/95 bg-white/10 px-2 py-0.5 rounded text-[11px]">
            {currentAppTitle}
          </span>
        </div>

        {/* Quick App Switcher Tabs */}
        <nav className="hidden xl:flex items-center space-x-1 ml-4 border-l border-white/20 pl-4">
          <Link
            href="/dashboard"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              pathname === '/dashboard' ? 'bg-white/20 font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/whatsapp"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              pathname === '/whatsapp' ? 'bg-white/20 font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            WhatsApp
          </Link>
          <Link
            href="/crm"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              pathname === '/crm' ? 'bg-white/20 font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            CRM
          </Link>
          <Link
            href="/lead-gen"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              pathname === '/lead-gen' ? 'bg-white/20 font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Lead Gen
          </Link>
          <Link
            href="/campaign-scheduler"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              pathname === '/campaign-scheduler' ? 'bg-white/20 font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Campaign Scheduler
          </Link>
          <Link
            href="/email-marketing"
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              pathname === '/email-marketing' ? 'bg-white/20 font-semibold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Email Marketing
          </Link>
        </nav>
      </div>

      {/* Right: Actions, Moon Toggle & User Avatar */}
      <div className="flex items-center gap-3">
        <Link
          href="/insights"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded bg-[#017E84] hover:bg-[#006A70] text-white text-[11px] font-semibold transition-colors shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>AI Insights</span>
        </Link>

        {/* Dark Mode Icon */}
        <button
          title="Toggle Dark Mode"
          className="p-1.5 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition-colors"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* User Pill JK */}
        <Link
          href="/login"
          title="Junais Kandara (Click to switch user)"
          className="flex items-center gap-1.5 pl-2 border-l border-white/20 group"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center transition-colors">
            JK
          </div>
          <span className="hidden md:inline text-xs font-medium text-white/90">
            Junais
          </span>
          <LogOut className="w-3 h-3 text-white/60 group-hover:text-white ml-0.5" />
        </Link>
      </div>
    </header>
  );
}
