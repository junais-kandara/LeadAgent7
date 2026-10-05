import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import {
  LayoutGrid,
  Search,
  Bell,
  Clock,
  MessageSquare,
  Building2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'LeadAgent7 | Odoo-Style Enterprise CRM & Marketing Intelligence',
  description: 'Enterprise AI Marketing, Leads, WhatsApp & Conversion Intelligence Platform',
};

const odooTabs = [
  { name: 'Dashboard', href: '/' },
  { name: 'Leads & CRM', href: '/leads' },
  { name: 'WhatsApp Chats', href: '/whatsapp' },
  { name: 'Social Media', href: '/social' },
  { name: 'Google Ads', href: '/ads' },
  { name: 'Bookings Calendar', href: '/bookings' },
  { name: 'AI Insights', href: '/insights' },
  { name: 'Reporting', href: '/analytics' },
  { name: 'Configuration', href: '/connections' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8F9FA] text-slate-800 antialiased flex flex-col font-sans">
        {/* Signature Odoo Top App Bar */}
        <header className="h-12 bg-[#714B67] text-white flex items-center justify-between px-4 shrink-0 shadow-sm z-50 select-none">
          {/* Left: Odoo App Launcher & Main Menu Tabs */}
          <div className="flex items-center gap-4 h-full">
            {/* Odoo Waffle Icon */}
            <button
              title="Odoo Apps"
              className="p-1.5 rounded hover:bg-black/20 text-white/90 hover:text-white transition-colors"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            {/* App Brand Name */}
            <Link
              href="/"
              className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 mr-2"
            >
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-black tracking-wider uppercase text-white">
                LA7
              </span>
              <span>LeadAgent7</span>
            </Link>

            {/* Odoo Horizontal Navigation Tabs */}
            <nav className="hidden lg:flex items-center h-full space-x-0.5">
              {odooTabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className="px-3 h-full flex items-center text-xs font-medium text-white/85 hover:text-white hover:bg-black/15 transition-colors border-b-2 border-transparent hover:border-white/40"
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Odoo Enterprise Utilities & User Profile */}
          <div className="flex items-center gap-3">
            {/* AI Assistant Quick Pill */}
            <Link
              href="/insights"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#017E84] hover:bg-[#006A70] text-white text-[11px] font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Intelligence</span>
            </Link>

            {/* Activities Clock Icon */}
            <button
              title="Activities"
              className="p-1.5 rounded hover:bg-black/20 text-white/90 hover:text-white relative transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1 right-1 ring-1 ring-[#714B67]"></span>
            </button>

            {/* Conversations Bubble */}
            <Link
              href="/whatsapp"
              title="Conversations"
              className="p-1.5 rounded hover:bg-black/20 text-white/90 hover:text-white relative transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1 ring-1 ring-[#714B67]"></span>
            </Link>

            {/* Company / Multi-Tenant Selector */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded hover:bg-black/15 text-xs text-white/90 font-medium cursor-pointer transition-colors">
              <Building2 className="w-3.5 h-3.5 text-white/70" />
              <span>Skyletic HQ</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="w-7 h-7 rounded-full bg-white/20 text-white text-xs font-bold flex items-center justify-center border border-white/30">
                A
              </div>
              <span className="text-xs font-medium text-white/90 hidden xl:inline">Admin User</span>
            </div>
          </div>
        </header>

        {/* Workspace Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </body>
    </html>
  );
}
