import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Percent,
  Wallet,
  Calendar,
  ChevronDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Instagram,
  Twitter,
  Youtube,
  Link2,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/insights')({
  component: InsightsPage,
})

/* ── Mock Data ─────────────────────────────────────── */
const stats = [
  { label: 'Total Views', value: '45,231', trend: '+12.5%', isPositive: true, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Total Clicks', value: '18,402', trend: '+8.2%', isPositive: true, icon: MousePointerClick, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Avg. CTR', value: '40.6%', trend: '-2.1%', isPositive: false, icon: Percent, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Revenue', value: '$1,294.50', trend: '+24.8%', isPositive: true, icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

// 30 days of mock traffic data
const chartData = Array.from({ length: 30 }).map((_, i) => {
  const base = 500 + Math.sin(i / 3) * 200
  return {
    day: i + 1,
    views: Math.floor(base + Math.random() * 150),
    clicks: Math.floor((base + Math.random() * 100) * 0.4),
  }
})
const maxViews = Math.max(...chartData.map((d) => d.views))

const deviceStats = [
  { label: 'Mobile', value: 68, icon: Smartphone, color: 'bg-blue-500' },
  { label: 'Desktop', value: 28, icon: Monitor, color: 'bg-emerald-500' },
  { label: 'Tablet', value: 4, icon: Tablet, color: 'bg-amber-500' },
]

const referrerStats = [
  { label: 'Instagram', value: 12450, icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-50' },
  { label: 'Twitter / X', value: 8320, icon: Twitter, color: 'text-slate-800', bg: 'bg-slate-100' },
  { label: 'YouTube', value: 5120, icon: Youtube, color: 'text-red-500', bg: 'bg-red-50' },
  { label: 'Direct', value: 3410, icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
]

const topLinks = [
  { title: 'My Portfolio', url: 'linkgrove.ee/devkiisi/portfolio', clicks: 4230, ctr: '48%' },
  { title: 'Latest YouTube Video', url: 'youtube.com/watch?v=123', clicks: 3105, ctr: '35%' },
  { title: 'Newsletter Signup', url: 'newsletter.devkiisi.com', clicks: 1890, ctr: '22%' },
  { title: 'Figma UI Kit', url: 'figma.com/community/file/123', clicks: 1240, ctr: '15%' },
]

/* ── Components ────────────────────────────────────── */

function AreaChart() {
  const padding = { top: 20, right: 20, bottom: 30, left: 40 }
  const height = 240
  const width = 800
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const xStep = chartW / (chartData.length - 1)
  const yRatio = chartH / (maxViews * 1.1) // 10% headroom

  const pointsViews = chartData.map((d, i) => `${padding.left + i * xStep},${padding.top + chartH - d.views * yRatio}`).join(' ')
  const areaViews = `${padding.left},${padding.top + chartH} ${pointsViews} ${padding.left + chartW},${padding.top + chartH}`

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Traffic Overview</h3>
          <p className="text-[11px] text-gray-400">Views and clicks over the last 30 days</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1069f9]"></div>
            <span className="text-[11px] font-medium text-gray-500">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <span className="text-[11px] font-medium text-gray-500">Clicks</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[240px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-aspect-ratio-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1069f9" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1069f9" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartH * ratio
            return (
              <g key={ratio}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-gray-400 font-sans">
                  {Math.round(maxViews * 1.1 * (1 - ratio))}
                </text>
              </g>
            )
          })}

          {/* Area & Line */}
          <polygon points={areaViews} fill="url(#viewGradient)" />
          <polyline points={pointsViews} fill="none" stroke="#1069f9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* X Axis Labels */}
        <div className="absolute bottom-0 left-[40px] right-[20px] flex justify-between text-[10px] text-gray-400 font-sans">
          <span>Day 1</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span>Day 30</span>
        </div>
      </div>
    </div>
  )
}

export function InsightsPage() {
  const [timeRange, setTimeRange] = useState('Last 30 days')

  return (
    <div className="flex-1 px-6 py-6 sm:px-10 lg:px-12 bg-gray-50/30">
      {/* ─── Header ─── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md shadow-blue-500/20">
            <BarChart3 size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Insights</h1>
            <p className="text-xs text-gray-400">Understand your audience and performance</p>
          </div>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50">
          <Calendar size={13} className="text-gray-400" />
          {timeRange}
          <ChevronDown size={13} className="text-gray-400 ml-1" />
        </button>
      </div>

      {/* ─── KPI Stats Row ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg} ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${s.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {s.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {s.trend}
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* ─── Main Chart ─── */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <AreaChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ─── Devices ─── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 mb-5">Device Breakdown</h3>
          
          {/* Custom Donut Chart visualization */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="20" />
                {/* Mobile (68%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray={`${68 * 2.51} 251`} strokeDashoffset="0" />
                {/* Desktop (28%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray={`${28 * 2.51} 251`} strokeDashoffset={`-${68 * 2.51}`} />
                {/* Tablet (4%) */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray={`${4 * 2.51} 251`} strokeDashoffset={`-${96 * 2.51}`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-400 font-medium">Total</span>
                <span className="text-sm font-extrabold">100%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {deviceStats.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                  <item.icon size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Top Referrers ─── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 mb-5">Top Referrers</h3>
          <div className="flex flex-col gap-4">
            {referrerStats.map((item, i) => {
              const maxVal = referrerStats[0].value
              const percentage = (item.value / maxVal) * 100

              return (
                <div key={i} className="flex items-center gap-4">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-900">{item.label}</span>
                      <span className="text-xs font-bold text-gray-700">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${item.label === 'Instagram' ? 'from-pink-400 to-rose-500' : item.label === 'Twitter / X' ? 'from-slate-600 to-slate-800' : item.label === 'YouTube' ? 'from-red-400 to-red-600' : 'from-blue-400 to-blue-600'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Top Links Table ─── */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-gray-100 p-5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Top Performing Links</h3>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Link Title</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Clicks</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topLinks.map((link, i) => (
                <tr key={i} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-100">
                        <Link2 size={13} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{link.title}</p>
                        <p className="text-[10px] text-gray-400">{link.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-sans text-xs font-bold text-gray-700">
                    {link.clicks.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      {link.ctr}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
