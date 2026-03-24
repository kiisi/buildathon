import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import {
  Link2,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Search,
  BarChart3,
  MousePointerClick,
  Trophy,
  QrCode,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  Plus,
  Zap,
  Globe,
  TrendingUp,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/link-shortener')({
  component: LinkShortenerPage,
})

/* ── Mock data ─────────────────────────────────────── */
type ShortenedLink = {
  id: string
  originalUrl: string
  shortCode: string
  clicks: number
  enabled: boolean
  createdAt: string
}

const initialLinks: ShortenedLink[] = [
  {
    id: '1',
    originalUrl: 'https://www.figma.com/design/my-awesome-project/landing-page-v3',
    shortCode: 'figma-v3',
    clicks: 482,
    enabled: true,
    createdAt: 'Mar 20, 2026',
  },
  {
    id: '2',
    originalUrl: 'https://github.com/devkiisi/linkgrove/pull/42',
    shortCode: 'grove-pr42',
    clicks: 218,
    enabled: true,
    createdAt: 'Mar 18, 2026',
  },
  {
    id: '3',
    originalUrl: 'https://docs.google.com/spreadsheets/d/1aBcDeF/edit#gid=0',
    shortCode: 'q1-metrics',
    clicks: 97,
    enabled: false,
    createdAt: 'Mar 15, 2026',
  },
  {
    id: '4',
    originalUrl: 'https://dev.to/devkiisi/building-linkgrove-from-scratch',
    shortCode: 'blog-grove',
    clicks: 1204,
    enabled: true,
    createdAt: 'Mar 10, 2026',
  },
  {
    id: '5',
    originalUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M',
    shortCode: 'coding-vibes',
    clicks: 356,
    enabled: true,
    createdAt: 'Mar 5, 2026',
  },
]

/* ── Component ─────────────────────────────────────── */
function LinkShortenerPage() {
  const [links, setLinks] = useState(initialLinks)
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [showAlias, setShowAlias] = useState(false)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'clicks'>('newest')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [justShortened, setJustShortened] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const domain = 'lnk.grove'

  /* derived */
  const totalClicks = links.reduce((s, l) => s + l.clicks, 0)
  const topLink = links.length
    ? links.reduce((a, b) => (a.clicks > b.clicks ? a : b))
    : null

  const filtered = links
    .filter(
      (l) =>
        l.originalUrl.toLowerCase().includes(search.toLowerCase()) ||
        l.shortCode.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === 'clicks') return b.clicks - a.clicks
      return 0 // mock: already newest-first
    })

  /* actions */
  function handleShorten() {
    if (!url.trim()) return
    const code = alias.trim() || Math.random().toString(36).slice(2, 8)
    const newLink: ShortenedLink = {
      id: Date.now().toString(),
      originalUrl: url.trim(),
      shortCode: code,
      clicks: 0,
      enabled: true,
      createdAt: 'Just now',
    }
    setLinks((prev) => [newLink, ...prev])
    setJustShortened(newLink.id)
    setTimeout(() => setJustShortened(null), 2000)
    setUrl('')
    setAlias('')
    setShowAlias(false)
  }

  function handleCopy(link: ShortenedLink) {
    navigator.clipboard.writeText(`https://${domain}/${link.shortCode}`)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleToggle(id: string) {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, enabled: !l.enabled } : l)),
    )
  }

  function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  /* ── Render ─────────────────────────────────────── */
  return (
    <div className="flex-1 px-6 pt-6 pb-12 sm:px-10 lg:px-12">
      {/* ─── Header ─── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1069f9] to-[#0b5ad4] shadow-md shadow-[#1069f9]/20">
            <Link2 size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              Link Shortener
            </h1>
            <p className="text-xs text-gray-400">
              {links.length} shortened link{links.length !== 1 && 's'}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Shorten URL form ─── */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          {/* URL row */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Globe
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300"
              />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                placeholder="Paste a long URL here…"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-4 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-[#1069f9]/40 focus:bg-white focus:ring-2 focus:ring-[#1069f9]/10"
              />
            </div>
            <button
              onClick={handleShorten}
              disabled={!url.trim()}
              className="flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1069f9] px-7 font-sans text-sm font-bold text-white shadow-md shadow-[#1069f9]/20 transition-all hover:bg-[#0b5ad4] hover:shadow-lg hover:shadow-[#1069f9]/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto"
            >
              <Zap size={15} strokeWidth={2.5} />
              Shorten
            </button>
          </div>

          {/* Custom alias toggle */}
          {!showAlias ? (
            <button
              onClick={() => setShowAlias(true)}
              className="flex w-fit cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-sans text-xs font-medium text-[#1069f9] transition-colors hover:text-[#0b5ad4]"
            >
              <Plus size={12} />
              Add custom alias
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-semibold text-gray-400">
                {domain}/
              </span>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value.replace(/\s/g, '-'))}
                placeholder="custom-alias"
                className="h-10 flex-1 rounded-lg border border-gray-200 bg-gray-50/60 px-3 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-[#1069f9]/40 focus:bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* ─── Stats row ─── */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Total Links',
            value: links.length,
            icon: <BarChart3 size={16} />,
            color: 'text-[#1069f9]',
            bg: 'bg-[#1069f9]/8',
          },
          {
            label: 'Total Clicks',
            value: totalClicks.toLocaleString(),
            icon: <MousePointerClick size={16} />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/8',
          },
          {
            label: 'Top Performing',
            value: topLink ? topLink.shortCode : '—',
            sub: topLink ? `${topLink.clicks.toLocaleString()} clicks` : undefined,
            icon: <Trophy size={16} />,
            color: 'text-amber-500',
            bg: 'bg-amber-500/8',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group flex items-center gap-3.5 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}
            >
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-400">{stat.label}</p>
              <p className="truncate text-base font-extrabold tracking-tight text-gray-900">
                {stat.value}
              </p>
              {'sub' in stat && stat.sub && (
                <p className="text-[11px] text-gray-400">{stat.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Search + sort ─── */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links…"
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 font-sans text-xs text-gray-700 outline-none transition-all placeholder:text-gray-300 focus:border-[#1069f9]/40 focus:ring-2 focus:ring-[#1069f9]/10"
          />
        </div>
        <button
          onClick={() => setSort((s) => (s === 'newest' ? 'clicks' : 'newest'))}
          className="flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ArrowUpDown size={13} />
          {sort === 'newest' ? 'Newest first' : 'Most clicks'}
        </button>
      </div>

      {/* ─── Links list ─── */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filtered.map((link) => {
            const shortUrl = `${domain}/${link.shortCode}`
            const isCopied = copiedId === link.id
            const isNew = justShortened === link.id

            return (
              <div
                key={link.id}
                className={`group rounded-xl border bg-white p-4 transition-all ${
                  isNew
                    ? 'animate-pulse border-[#1069f9]/30 shadow-md shadow-[#1069f9]/10'
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                } ${!link.enabled ? 'opacity-60' : ''}`}
              >
                {/* Top row: URLs */}
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  {/* Short URL */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1069f9]/8">
                      <Link2 size={13} className="text-[#1069f9]" />
                    </div>
                    <span className="text-sm font-bold text-gray-900">{shortUrl}</span>
                  </div>

                  {/* Original URL */}
                  <div className="flex min-w-0 items-center gap-1.5 sm:ml-auto">
                    <span className="truncate text-xs text-gray-400" title={link.originalUrl}>
                      {link.originalUrl.length > 55
                        ? link.originalUrl.slice(0, 55) + '…'
                        : link.originalUrl}
                    </span>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-gray-300 transition-colors hover:text-[#1069f9]"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* Bottom row: meta + actions */}
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
                  {/* Click count */}
                  <span className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                    <TrendingUp size={11} />
                    {link.clicks.toLocaleString()} click{link.clicks !== 1 && 's'}
                  </span>

                  {/* Date */}
                  <span className="text-[11px] text-gray-300">{link.createdAt}</span>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Copy */}
                  <button
                    onClick={() => handleCopy(link)}
                    className={`flex cursor-pointer items-center gap-1 rounded-lg border-none px-2.5 py-1 text-[11px] font-semibold transition-all ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>

                  {/* QR */}
                  <button className="flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-2.5 py-1 text-[11px] font-semibold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600">
                    <QrCode size={12} />
                    QR
                  </button>

                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(link.id)}
                    className={`flex cursor-pointer items-center gap-1 rounded-lg border-none bg-transparent px-2 py-1 text-[11px] font-semibold transition-all ${
                      link.enabled
                        ? 'text-emerald-500 hover:bg-emerald-50'
                        : 'text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {link.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="flex cursor-pointer items-center rounded-lg border-none bg-transparent px-1.5 py-1 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : links.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1069f9]/10 to-[#1069f9]/5">
              <Link2 size={28} className="text-[#1069f9]" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1069f9] shadow-lg shadow-[#1069f9]/30">
              <Zap size={12} className="text-white" />
            </div>
          </div>
          <h3 className="mb-1.5 text-sm font-bold text-gray-900">
            No shortened links yet
          </h3>
          <p className="mb-5 max-w-[260px] text-center text-xs leading-relaxed text-gray-400">
            Paste any long URL above to create a clean, trackable short link instantly.
          </p>
          <button
            onClick={() => inputRef.current?.focus()}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1069f9] px-5 py-2.5 font-sans text-xs font-bold text-white shadow-md shadow-[#1069f9]/20 transition-all hover:bg-[#0b5ad4] hover:shadow-lg hover:shadow-[#1069f9]/25 active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={2.5} />
            Shorten your first link
          </button>
        </div>
      ) : (
        /* ── No search results ── */
        <div className="flex flex-col items-center justify-center py-14">
          <Search size={28} className="mb-3 text-gray-200" />
          <p className="text-sm font-semibold text-gray-500">No links match your search</p>
          <p className="text-xs text-gray-400">Try a different keyword</p>
        </div>
      )}
    </div>
  )
}
