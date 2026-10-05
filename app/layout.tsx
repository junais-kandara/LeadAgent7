import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import {
  LayoutDashboard,
  SlidersHorizontal,
  Activity,
  Share2,
  Megaphone,
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  Radio,
  Settings,
  Search,
  Bell,
  HelpCircle,
  MoreVertical,
  ChevronDown,
  Menu,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'LeadAgent7 | AI Marketing, Lead & Conversion Intelligence',
  description: 'Enterprise AI marketing and customer conversion intelligence platform',
};

const reportLinks = [
  { name: 'Realtime', href: '/', icon: Activity },
  { name: 'Social Analytics', href: '/social', icon: Share2 },
  { name: 'Google Ads', href: '/ads', icon: Megaphone },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Leads & CRM', href: '/leads', icon: Users },
  { name: 'Bookings', href: '/bookings', icon: Calendar },
  { name: 'AI Insights', href: '/insights', icon: Sparkles },
];

const generalLinks = [
  { name: 'Connections', href: '/connections', icon: Radio },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-[#f3f6fb] text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-[#e7eef7] flex flex-col shrink-0 min-h-screen">
          {/* Logo Brand Header */}
          <div className="h-18 flex items-center px-6 gap-3 py-5">
            <Menu className="w-5 h-5 text-slate-600 cursor-pointer hover:text-slate-900" />
            <Link href="/" className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-slate-900">
              <span>leadagent7</span>
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-2 space-y-6 overflow-y-auto">
            {/* Main Section */}
            <div className="space-y-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-blue-600 bg-blue-50/80 hover:bg-blue-100/70 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span>Customization</span>
              </Link>
            </div>

            {/* REPORTS */}
            <div>
              <p className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                REPORTS
              </p>
              <div className="space-y-1">
                {reportLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* GENERAL */}
            <div>
              <p className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                GENERAL
              </p>
              <div className="space-y-1">
                {generalLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Bottom Card: My Calendar Widget */}
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-600 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">My Calendar</h4>
                <p className="text-[10px] text-blue-100 font-medium">UPCOMING BOOKINGS</p>
              </div>
            </div>
            <Link
              href="/bookings"
              className="mt-3 block text-center w-full py-1.5 px-3 rounded-xl bg-white text-blue-700 text-[11px] font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              + SCHEDULE BOOKING
            </Link>
          </div>
        </aside>

        {/* Right Main Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="h-18 bg-white border-b border-[#e7eef7] px-8 flex items-center justify-between shrink-0">
            {/* Search Bar */}
            <div className="relative w-80 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Use ⌘+K to Search a keyword..."
                className="w-full bg-[#f3f6fb] border border-transparent rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
            </div>

            {/* Header Right Icons & Profile */}
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 relative transition-colors">
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Profile Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  LA
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-none flex items-center gap-1">
                    <span>Admin</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Team Account</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
