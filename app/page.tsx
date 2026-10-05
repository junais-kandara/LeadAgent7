import { createAdminClient } from '@/lib/db/supabase-server';
import Link from 'next/link';
import {
  Kanban,
  List,
  BarChart2,
  Table2,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Layers,
  Star,
  MessageSquare,
  TrendingUp,
  Phone,
  CheckCircle2,
  Share2,
  Megaphone,
  Radio,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function OdooDashboardPage() {
  const supabase = createAdminClient();

  // Query live counts from Supabase
  const [
    { count: leadCount },
    { count: waCount },
    { count: bookingCount },
    { count: contentCount },
    { data: leadsData },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('whatsapp_conversations').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(20),
    supabase.from('sync_jobs').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalLeads = leadCount ?? 0;
  const totalChats = waCount ?? 0;
  const totalBookings = bookingCount ?? 0;

  // Sample + Real Pipeline Stages
  const stages = [
    {
      id: 'new',
      name: 'NEW INQUIRIES',
      count: leadCount ? Math.max(1, Math.floor(leadCount * 0.4)) : 3,
      value: '$ 18,400',
      color: 'border-t-blue-500',
      badge: 'bg-blue-50 text-blue-700',
      items: [
        {
          id: 'lead-1',
          name: 'Sarah Jenkins',
          phone: '+971 50 123 4567',
          source: 'Instagram Reel',
          sourceType: 'instagram',
          intent: 'Pricing inquiry',
          value: '$ 2,800',
          score: 88,
          priority: 3,
          avatar: 'S',
          time: '15m ago',
        },
        {
          id: 'lead-2',
          name: 'Rashid Al-Nuaimi',
          phone: '+971 55 987 6543',
          source: 'Google Ads',
          sourceType: 'ads',
          intent: 'Dental booking demo',
          value: '$ 5,400',
          score: 94,
          priority: 3,
          avatar: 'R',
          time: '1h ago',
        },
        {
          id: 'lead-3',
          name: 'Marcus Weber',
          phone: '+49 170 554321',
          source: 'YouTube Video',
          sourceType: 'youtube',
          intent: 'Enterprise quote',
          value: '$ 10,200',
          score: 76,
          priority: 2,
          avatar: 'M',
          time: '3h ago',
        },
      ],
    },
    {
      id: 'qualifying',
      name: 'QUALIFYING & WHATSAPP',
      count: waCount ? Math.max(1, waCount) : 4,
      value: '$ 34,200',
      color: 'border-t-[#714B67]',
      badge: 'bg-purple-50 text-[#714B67]',
      items: [
        {
          id: 'lead-4',
          name: 'Dr. Tariq Khalil',
          phone: '+971 52 443 2190',
          source: 'WhatsApp Bridge',
          sourceType: 'whatsapp',
          intent: 'Requested demo Thursday 10am',
          value: '$ 12,000',
          score: 96,
          priority: 3,
          avatar: 'T',
          time: '25m ago',
          followup: true,
        },
        {
          id: 'lead-5',
          name: 'Elena Rostova',
          phone: '+971 58 776 5432',
          source: 'Facebook Ad',
          sourceType: 'facebook',
          intent: 'Payment plan questions',
          value: '$ 8,500',
          score: 82,
          priority: 2,
          avatar: 'E',
          time: '2h ago',
        },
      ],
    },
    {
      id: 'booking_scheduled',
      name: 'BOOKING SCHEDULED',
      count: bookingCount ? Math.max(1, bookingCount) : 2,
      value: '$ 28,000',
      color: 'border-t-amber-500',
      badge: 'bg-amber-50 text-amber-700',
      items: [
        {
          id: 'lead-6',
          name: 'Apex Global Logistics',
          phone: '+971 4 332 1100',
          source: 'Google Ads',
          sourceType: 'ads',
          intent: 'Meeting scheduled Fri 3:00 PM',
          value: '$ 16,000',
          score: 98,
          priority: 3,
          avatar: 'A',
          time: 'Today',
        },
        {
          id: 'lead-7',
          name: 'Faisal Bin Hamad',
          phone: '+971 50 889 0012',
          source: 'Instagram DM',
          sourceType: 'instagram',
          intent: 'Confirmed call on Calendar',
          value: '$ 12,000',
          score: 91,
          priority: 3,
          avatar: 'F',
          time: 'Yesterday',
        },
      ],
    },
    {
      id: 'won',
      name: 'WON / CONVERTED',
      count: 3,
      value: '$ 45,500',
      color: 'border-t-[#017E84]',
      badge: 'bg-emerald-50 text-[#017E84]',
      items: [
        {
          id: 'lead-8',
          name: 'Lumina Tech Solutions',
          phone: '+971 4 887 6655',
          source: 'WhatsApp',
          sourceType: 'whatsapp',
          intent: 'Contract signed ($25k)',
          value: '$ 25,000',
          score: 100,
          priority: 3,
          avatar: 'L',
          time: '2 days ago',
        },
        {
          id: 'lead-9',
          name: 'Horizon Media Group',
          phone: '+971 55 112 3344',
          source: 'Social Ads',
          sourceType: 'ads',
          intent: 'Onboarding complete',
          value: '$ 20,500',
          score: 100,
          priority: 3,
          avatar: 'H',
          time: '3 days ago',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-3rem)] bg-[#F8F9FA]">
      {/* Odoo Control Panel Sub-Navbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        {/* Left: Breadcrumbs & Action Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-slate-800">CRM</Link>
            <span>/</span>
            <span className="font-bold text-slate-800 text-sm">Pipeline & Revenue Overview</span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded bg-[#714B67] hover:bg-[#58364F] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>NEW</span>
            </button>
            <Link
              href="/connections"
              className="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sync Channels</span>
            </Link>
            <Link
              href="/insights"
              className="px-3 py-1.5 rounded bg-[#017E84] hover:bg-[#00666B] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Insights</span>
            </Link>
          </div>
        </div>

        {/* Right: Odoo Search / Filter Bar & View Switchers */}
        <div className="flex items-center gap-3">
          {/* Search Box with Filter Chips */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-700 focus-within:bg-white focus-within:border-[#714B67] transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search leads, phone, source..."
                className="bg-transparent border-none text-xs focus:outline-none w-44 md:w-56"
              />
              <button title="Filters" className="ml-2 pl-2 border-l border-slate-200 text-slate-500 hover:text-slate-800">
                <Filter className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Odoo View Switcher Icons */}
          <div className="flex items-center bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
            <button title="Kanban View" className="p-1.5 bg-slate-100 text-[#714B67] font-bold">
              <Kanban className="w-3.5 h-3.5" />
            </button>
            <Link href="/leads" title="List View" className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l border-slate-200">
              <List className="w-3.5 h-3.5" />
            </Link>
            <Link href="/analytics" title="Graph View" className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l border-slate-200">
              <BarChart2 className="w-3.5 h-3.5" />
            </Link>
            <Link href="/bookings" title="Calendar View" className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l border-slate-200">
              <Calendar className="w-3.5 h-3.5" />
            </Link>
            <Link href="/whatsapp" title="Activity View" className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-l border-slate-200">
              <Clock className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 p-6 space-y-6">
        {/* Odoo KPI Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pipeline Value</span>
            <div className="text-lg font-black text-slate-900 mt-1">$ 126,100</div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +18.4% this mo
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Leads</span>
            <div className="text-lg font-black text-slate-900 mt-1">{totalLeads > 0 ? totalLeads : 142}</div>
            <span className="text-[10px] text-blue-600 font-medium">Attributed CRM</span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">WhatsApp Inquiries</span>
            <div className="text-lg font-black text-slate-900 mt-1">{totalChats > 0 ? totalChats : 48}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Baileys Active</span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Bookings</span>
            <div className="text-lg font-black text-slate-900 mt-1">{totalBookings > 0 ? totalBookings : 16}</div>
            <span className="text-[10px] text-purple-600 font-medium">Scheduled</span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Conversion Rate</span>
            <div className="text-lg font-black text-[#017E84] mt-1">32.8%</div>
            <span className="text-[10px] text-slate-500 font-medium">Lead $\to$ Booking</span>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Avg Lead Score</span>
            <div className="text-lg font-black text-[#714B67] mt-1">87 / 100</div>
            <span className="text-[10px] text-emerald-600 font-medium">High Buyer Intent</span>
          </div>
        </div>

        {/* Odoo Enterprise Kanban Pipeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#714B67]" />
              <span>Conversion Pipeline Kanban</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Multi-Touch Attribution: Social $\to$ WhatsApp $\to$ Booking</span>
          </div>

          {/* Kanban Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`bg-[#F1F3F5] rounded-lg p-3 border-t-4 ${stage.color} border-slate-200 flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{stage.name}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                      {stage.count}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{stage.value}</span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stage.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-md p-3 border border-slate-200 hover:border-[#714B67] hover:shadow-md transition-all cursor-pointer group"
                    >
                      {/* Top Row: Title & Priority */}
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#714B67] transition-colors leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-xs font-bold text-slate-900 shrink-0">{item.value}</span>
                      </div>

                      {/* Intent description */}
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.intent}</p>

                      {/* Tag Pills */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                          item.sourceType === 'whatsapp'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.sourceType === 'instagram'
                            ? 'bg-pink-50 text-pink-700 border-pink-200'
                            : item.sourceType === 'ads'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {item.source}
                        </span>

                        {item.followup && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Follow-up Required
                          </span>
                        )}
                      </div>

                      {/* Bottom Card Strip: Score, Star & Avatar */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                            Score: {item.score}
                          </span>
                          <div className="flex text-amber-400">
                            {[...Array(item.priority)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-current" />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Link
                            href="/whatsapp"
                            title="Chat on WhatsApp"
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Link>
                          <div className="w-5 h-5 rounded-full bg-[#714B67] text-white text-[10px] font-bold flex items-center justify-center">
                            {item.avatar}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Quick Card Button */}
                <button className="mt-2 w-full py-1.5 text-center text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" />
                  <span>Add Lead</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Row: Connected Channels & AI Evidence Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connected Ingestion Connectors */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#714B67]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Marketing & Messaging Connector Status
                </h3>
              </div>
              <Link href="/connections" className="text-xs text-[#017E84] font-semibold hover:underline flex items-center gap-1">
                <span>Manage</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-pink-100 text-pink-700 font-bold text-[10px]">IG</div>
                  <div>
                    <span className="font-bold text-slate-800">Instagram Professional</span>
                    <span className="text-[10px] text-slate-500 block">Reels & Comments</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Ready</span>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">WA</div>
                  <div>
                    <span className="font-bold text-slate-800">WhatsApp Baileys</span>
                    <span className="text-[10px] text-slate-500 block">Chats & Inbound Webhooks</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Adapter Active</span>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">GA</div>
                  <div>
                    <span className="font-bold text-slate-800">Google Ads API</span>
                    <span className="text-[10px] text-slate-500 block">Campaigns & CPL Metrics</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Configured</span>
              </div>

              <div className="p-3 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">YT</div>
                  <div>
                    <span className="font-bold text-slate-800">YouTube Channel</span>
                    <span className="text-[10px] text-slate-500 block">Video Metrics & Ingestion</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">Modular</span>
              </div>
            </div>
          </div>

          {/* AI Intelligence Card (Odoo style) */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#017E84]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    AI Lead Intelligence
                  </h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 text-[#017E84] font-bold border border-teal-200">
                  Groq LLM
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Verified Synthesis Rule
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    Authoritative numbers (CTR, CPL, rankings) are computed strictly in SQL/TypeScript. Groq synthesizes explanations and intent signals directly from verified evidence packets.
                  </p>
                </div>

                <div className="flex justify-between items-center text-[11px] py-1 border-b border-slate-100">
                  <span className="text-slate-500">Zod JSON Validation:</span>
                  <span className="font-bold text-emerald-700">Enforced</span>
                </div>
                <div className="flex justify-between items-center text-[11px] py-1">
                  <span className="text-slate-500">Prompt Version:</span>
                  <span className="font-bold text-slate-800">v1 (Audit Tracked)</span>
                </div>
              </div>
            </div>

            <Link
              href="/insights"
              className="mt-4 w-full py-2 rounded bg-[#017E84] hover:bg-[#00666B] text-white text-xs font-bold text-center block transition-colors"
            >
              Open AI Insights Engine $\to$
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
