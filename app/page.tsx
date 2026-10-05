import { Fragment } from 'react';
import { createAdminClient } from '@/lib/db/supabase-server';
import {
  ArrowUpDown,
  Filter,
  Calendar,
  MoreHorizontal,
  Download,
  Activity,
  PartyPopper,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createAdminClient();

  // Query real counts from Supabase
  const [
    { count: leadCount },
    { count: waCount },
    { count: bookingCount },
    { count: contentCount },
    { data: realLeads },
  ] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('whatsapp_conversations').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const totalLeads = leadCount ?? 0;
  const totalBookings = bookingCount ?? 0;
  const totalChats = waCount ?? 0;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview,</h1>
          <p className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mt-1">
            DECEMBER 02 - 08 (9:00AM) • VERIFIED METRICS
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e7eef7] text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort By</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e7eef7] text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter By</span>
          </button>
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#e7eef7] text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>December, 2026</span>
          </button>
        </div>
      </div>

      {/* TOP ROW: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Main Trend Area Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#e7eef7] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-400 block">Overall Sales & Pipeline</span>
                  <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-2xl font-black text-slate-900 tracking-tight">
                      $ 40,256.92
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 flex items-center">
                      ↗ 20.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Current Week
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-200"></span> Last Week
                </span>
              </div>
            </div>

            {/* Bezier Area Chart with Tooltip */}
            <div className="relative mt-8 h-48 w-full">
              {/* Y Axis Guide Lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300 pointer-events-none">
                <div className="border-b border-dashed border-slate-100 pb-1">100k</div>
                <div className="border-b border-dashed border-slate-100 pb-1">75k</div>
                <div className="border-b border-dashed border-slate-100 pb-1">50k</div>
                <div className="border-b border-dashed border-slate-100 pb-1">25k</div>
                <div className="border-b border-slate-100 pb-1">0</div>
              </div>

              {/* Chart SVG */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Prior Week Dashed Line */}
                <path
                  d="M 0,140 Q 80,120 150,135 T 300,110 T 420,120 T 500,125"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Current Week Filled Area */}
                <path
                  d="M 0,130 Q 70,125 120,80 T 240,85 T 330,20 T 420,110 T 500,105 L 500,180 L 0,180 Z"
                  fill="url(#areaGradient)"
                />

                {/* Current Week Solid Line */}
                <path
                  d="M 0,130 Q 70,125 120,80 T 240,85 T 330,20 T 420,110 T 500,105"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                />

                {/* Data point dot on DEC 6 peak */}
                <circle cx="330" cy="20" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
                <line x1="330" y1="20" x2="330" y2="180" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>

              {/* Active Tooltip Badge matching screenshot */}
              <div className="absolute top-0 left-[62%] -translate-x-1/2 -translate-y-2 bg-slate-900 text-white rounded-xl px-3 py-1.5 shadow-xl text-center pointer-events-none">
                <span className="text-[11px] font-bold block leading-tight">$74,892.00</span>
                <span className="text-[9px] text-slate-400 block leading-tight">December 6</span>
              </div>
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-3 border-t border-slate-100">
            <span>DEC 2</span>
            <span>DEC 3</span>
            <span>DEC 4</span>
            <span>DEC 5</span>
            <span className="text-slate-900 font-bold">DEC 6</span>
            <span>DEC 7</span>
            <span>DEC 8</span>
          </div>
        </div>

        {/* Card 2: Source of Purchases / Lead Ingestion Channels (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e7eef7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Source of Purchases</h3>
            <span className="text-xs text-slate-400">Attribution</span>
          </div>

          {/* Donut Chart with Centered Metric */}
          <div className="flex justify-center my-4 relative">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle cx="60" cy="60" r="48" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Social Media segment (48%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeDasharray="144 301"
                  strokeLinecap="round"
                />
                {/* Direct Search segment (33%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeDasharray="99 301"
                  strokeDashoffset="-150"
                  strokeLinecap="round"
                />
                {/* Others segment (19%) */}
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="12"
                  strokeDasharray="57 301"
                  strokeDashoffset="-255"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900 leading-none">100%</span>
                <span className="text-[10px] text-rose-500 font-bold mt-0.5">-18.7%</span>
                <span className="mt-1 px-1.5 py-0.5 rounded bg-rose-50 text-[8px] font-bold text-rose-600 uppercase tracking-wider">
                  ★ POOR SALES
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600 font-medium">Social Media</span>
              </div>
              <span className="font-bold text-slate-900">48%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="text-slate-600 font-medium">Direct Search</span>
              </div>
              <span className="font-bold text-slate-900">33%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-600 font-medium">Others</span>
              </div>
              <span className="font-bold text-slate-900">19%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Visitors / Traffic Reach & Celebration Badge (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-[#e7eef7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Visitors</h3>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Chart with Peak Tooltip */}
          <div className="relative my-4 h-40 flex items-end justify-between px-2 pt-8">
            {/* Guide ticks */}
            <div className="absolute top-0 left-0 text-[9px] text-slate-300">100k</div>
            <div className="absolute top-8 left-0 text-[9px] text-slate-300">75k</div>
            <div className="absolute top-16 left-0 text-[9px] text-slate-300">50k</div>
            <div className="absolute top-24 left-0 text-[9px] text-slate-300">25k</div>

            {/* Bars */}
            {[20, 35, 45, 60, 75, 55, 90, 40, 30, 25, 20].map((h, i) => {
              const isPeak = i === 6; // Active highlighted bar (85.7k)
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 relative">
                  {isPeak && (
                    <div className="absolute -top-7 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      85.7k
                    </div>
                  )}
                  <div
                    style={{ height: `${h}%` }}
                    className={`w-2.5 rounded-t-full transition-all ${
                      isPeak ? 'bg-blue-600' : 'bg-blue-100 hover:bg-blue-200'
                    }`}
                  ></div>
                  <span className="text-[9px] text-slate-400 mt-1">{i + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Record Alert Footer Card */}
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Congratualtions..,</p>
              <p className="text-[10px] text-slate-500 font-medium">You&apos;ve just hit a new record.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 4: Horizontal Bar Chart (Country / Channels) (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e7eef7] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">72 Countries <span className="text-xs text-slate-400 font-normal">(71083 Sales)</span></h3>
            </div>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
              <span>Last 7 days</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Horizontal Ranked Bars */}
          <div className="space-y-3 mt-4 text-xs">
            {[
              { name: 'India', val: 1200, pct: '57%', color: 'bg-blue-600' },
              { name: 'United States', val: 1790, pct: '85%', color: 'bg-blue-600' },
              { name: 'China', val: 490, pct: '24%', color: 'bg-blue-600' },
              { name: 'Indonesia', val: 1489, pct: '70%', color: 'bg-orange-500' },
              { name: 'Russia', val: 1105, pct: '52%', color: 'bg-blue-600' },
              { name: 'Bangladesh', val: 689, pct: '33%', color: 'bg-blue-600' },
              { name: 'Canada', val: 689, pct: '33%', color: 'bg-blue-600' },
              { name: 'Australia', val: 420, pct: '20%', color: 'bg-blue-600' },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-24 text-[11px] font-medium text-slate-600 truncate text-right">{item.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div style={{ width: item.pct }} className={`h-full rounded-full ${item.color}`}></div>
                </div>
                <span className="w-10 text-[11px] font-bold text-slate-900 text-left">{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 5: Heatmap Matrix (Sales per week / Hourly Traffic) (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e7eef7] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Sales per week</h3>
            <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800">
              <span>Last 7 days</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="my-2">
            <div className="grid grid-cols-8 gap-1.5 text-center text-[10px]">
              {/* Header Days */}
              <div className="text-slate-300"></div>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <div key={d} className="font-bold text-slate-400 text-[9px] py-1">{d}</div>
              ))}

              {/* Time Rows */}
              {[
                { time: '12pm', shades: [0, 2, 0, 0, 0, 1, 1] },
                { time: '1pm', shades: [0, 3, 0, 1, 0, 0, 1] },
                { time: '2pm', shades: [0, 0, 3, 1, 2, 0, 1] },
                { time: '3pm', shades: [0, 1, 2, 3, 2, 1, 1] },
                { time: '4pm', shades: [0, 1, 2, 2, 3, 0, 1] },
                { time: '5pm', shades: [0, 2, 3, 1, 1, 0, 1] },
                { time: '6pm', shades: [0, 0, 1, 2, 0, 1, 0] },
                { time: '7pm', shades: [0, 0, 0, 1, 3, 0, 0] },
              ].map((row) => (
                <Fragment key={row.time}>
                  <div className="text-slate-400 font-medium text-[9px] flex items-center justify-end pr-1">
                    {row.time}
                  </div>
                  {row.shades.map((shade, idx) => {
                    const bgColors = [
                      'bg-slate-100', // 0
                      'bg-blue-100', // 1
                      'bg-blue-400', // 2
                      'bg-blue-600', // 3
                    ];
                    return (
                      <div
                        key={idx}
                        className={`h-5 rounded-md ${bgColors[shade]} transition-transform hover:scale-110`}
                      ></div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-slate-100"></span> 0 - 300</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-100"></span> 300 - 600</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-400"></span> 600 - 900</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-600"></span> 900 - 1200</span>
          </div>
        </div>

        {/* Card 6: Sales History / Recent Leads & CRM Activity Feed (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e7eef7] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Sales History</h3>
              <button className="text-slate-400 hover:text-slate-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* List Grouped by RECENT & YESTERDAY */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  RECENT
                </span>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        A
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Alphie Turner</p>
                        <p className="text-[10px] text-slate-400">Australia • Instagram</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">$39.92</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                        B
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Bella Poarch</p>
                        <p className="text-[10px] text-slate-400">United States • Google Ads</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">$199.99</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  YESTERDAY
                </span>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        C
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Cindrella</p>
                        <p className="text-[10px] text-slate-400">India • WhatsApp</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">$30.00</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        D
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">David Johnson</p>
                        <p className="text-[10px] text-slate-400">United States • YouTube</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">$49.99</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                        P
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Peter Parker</p>
                        <p className="text-[10px] text-slate-400">United States • Direct</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">$49.99</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Download Action Footer */}
          <div className="pt-3 border-t border-slate-100 mt-4 text-center">
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
