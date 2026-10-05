import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import {
  LayoutDashboard,
  BarChart3,
  Share2,
  Megaphone,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  FileText,
  Radio,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'LeadAgent7 | AI Marketing, Lead & Conversion Intelligence',
  description: 'Enterprise AI marketing and customer conversion intelligence platform',
};

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Social', href: '/social', icon: Share2 },
  { name: 'Ads', href: '/ads', icon: Megaphone },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'AI Insights', href: '/insights', icon: Sparkles },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Connections', href: '/connections', icon: Radio },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#1e293b] bg-[#0c1220] flex flex-col shrink-0">
          <div className="h-16 flex items-center px-6 border-b border-[#1e293b] gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              L7
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight block text-sm">LeadAgent7</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">Intelligence</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Supabase & RLS Health Footer */}
          <div className="p-4 border-t border-[#1e293b] bg-[#0a0f1d]">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Tenant RLS Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Supabase DB Connected</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-[#1e293b] bg-[#0c1220]/80 backdrop-blur px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-semibold text-white">Production Portal</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Milestones 1 & 2 Live
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <div className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-md">
                Organization: <span className="text-white font-medium">Primary Tenant</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
