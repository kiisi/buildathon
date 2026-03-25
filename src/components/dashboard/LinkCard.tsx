import {
  GripVertical, Pencil, Share2, Link2,
  Copy, ExternalLink, BarChart3, Trash2, AlertCircle,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

// ── Brand icon map ────────────────────────────────────────────────────────────

const BRAND_ICONS: { pattern: RegExp; icon: React.ReactNode; color: string }[] = [
  {
    pattern: /youtube\.com|youtu\.be/i,
    color: '#ff0000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
      </svg>
    ),
  },
  {
    pattern: /instagram\.com/i,
    color: '#e1306c',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    pattern: /facebook\.com|fb\.com/i,
    color: '#1877f2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
  },
  {
    pattern: /twitter\.com|x\.com/i,
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    pattern: /tiktok\.com/i,
    color: '#010101',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
      </svg>
    ),
  },
  {
    pattern: /whatsapp\.com|wa\.me/i,
    color: '#25d366',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
      </svg>
    ),
  },
  {
    pattern: /linkedin\.com/i,
    color: '#0a66c2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    pattern: /spotify\.com/i,
    color: '#1db954',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
  {
    pattern: /github\.com/i,
    color: '#181717',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    pattern: /twitch\.tv/i,
    color: '#9146ff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    pattern: /t\.me|telegram\.org/i,
    color: '#26a5e4',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  if (!value) return false
  try {
    const url = new URL(value.startsWith('http') ? value : `https://${value}`)
    return url.hostname.includes('.')
  } catch {
    return false
  }
}

function getBrandIcon(url: string): { icon: React.ReactNode; color: string } | null {
  for (const brand of BRAND_ICONS) {
    if (brand.pattern.test(url)) {
      return { icon: brand.icon, color: brand.color }
    }
  }
  return null
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LinkCardProps {
  id: string
  title: string
  url: string
  enabled?: boolean
  clicks?: number
  saving?: boolean
  onChange: (id: string, updates: Partial<{ title: string; url: string; enabled: boolean }>) => void
  onDelete: (id: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LinkCard({
  id, title, url, enabled = false, clicks = 0, saving = false, onChange, onDelete,
}: LinkCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [editUrl, setEditUrl] = useState(url)
  const [urlError, setUrlError] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (isEditingTitle) titleInputRef.current?.focus() }, [isEditingTitle])
  useEffect(() => { if (isEditingUrl) urlInputRef.current?.focus() }, [isEditingUrl])

  // Keep local state in sync if parent updates
  useEffect(() => { setEditTitle(title) }, [title])
  useEffect(() => { setEditUrl(url) }, [url])

  function handleSaveTitle() {
    setIsEditingTitle(false)
    if (editTitle !== title) onChange(id, { title: editTitle })
  }

  function handleSaveUrl() {
    setIsEditingUrl(false)
    const trimmed = editUrl.trim()
    if (!trimmed) {
      setUrlError(false)
      if (trimmed !== url) onChange(id, { url: trimmed })
      return
    }
    if (!isValidUrl(trimmed)) {
      setUrlError(true)
      return
    }
    setUrlError(false)
    if (trimmed !== url) onChange(id, { url: trimmed })
  }

  const brand = getBrandIcon(url)
  const brandIcon = brand ? (
    <span style={{ color: brand.color }}>{brand.icon}</span>
  ) : (
    <Link2 size={16} />
  )

  return (
    <div className={`rounded-2xl border bg-white p-4 transition-shadow ${
      enabled ? 'border-[#1069f9]/30 shadow-sm' : 'border-gray-200'
    }`}>
      <div className="mb-2 flex items-start gap-2">
        {/* Drag handle */}
        <button className="mt-1 shrink-0 cursor-grab border-none bg-transparent p-0 text-gray-300 hover:text-gray-500">
          <GripVertical size={16} />
        </button>

        <div className="flex-1 overflow-hidden">
          {/* Title */}
          <div className="mb-1 flex items-center gap-1.5">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                onBlur={handleSaveTitle}
                className="w-full max-w-sm border-b border-[#1069f9] bg-transparent pb-0.5 text-sm font-bold text-gray-900 outline-none"
              />
            ) : (
              <>
                <span className="truncate text-sm font-bold text-gray-900">{title || 'Title'}</span>
                <Pencil size={12} className="shrink-0 cursor-pointer text-gray-300 hover:text-gray-500" onClick={() => setIsEditingTitle(true)} />
              </>
            )}
          </div>

          {/* URL */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              {isEditingUrl ? (
                <input
                  ref={urlInputRef}
                  type="text"
                  value={editUrl}
                  onChange={(e) => { setEditUrl(e.target.value); setUrlError(false) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl()}
                  onBlur={handleSaveUrl}
                  placeholder="https://example.com"
                  className={`w-full max-w-sm border-b bg-transparent pb-0.5 text-xs text-gray-600 outline-none ${
                    urlError ? 'border-red-400' : 'border-[#1069f9]'
                  }`}
                />
              ) : (
                <>
                  <span
                    className="max-w-[200px] cursor-pointer truncate text-xs text-gray-400 hover:text-gray-600 sm:max-w-xs"
                    onClick={() => setIsEditingUrl(true)}
                  >
                    {url || 'Add URL'}
                  </span>
                  <Pencil size={10} className="shrink-0 cursor-pointer text-gray-300 hover:text-gray-500" onClick={() => setIsEditingUrl(true)} />
                </>
              )}
            </div>
            {urlError && (
              <div className="flex items-center gap-1 text-[11px] text-red-500">
                <AlertCircle size={11} />
                Please enter a valid URL (e.g. https://example.com)
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          {saving && <span className="animate-pulse text-[10px] text-gray-400">saving…</span>}
          <button className="hidden cursor-pointer border-none bg-transparent p-1 text-gray-300 hover:text-gray-500 sm:block">
            <Share2 size={16} />
          </button>
          <button
            onClick={() => onChange(id, { enabled: !enabled })}
            className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${enabled ? 'bg-[#22c55e]' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${enabled ? 'left-[22px]' : 'left-[2px]'}`} />
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-3 flex items-center gap-1">
        {/* Brand / generic icon */}
        <span className="mr-1 flex w-6 shrink-0 items-center justify-center text-gray-400">
          {brandIcon}
        </span>

        <ActionBtn icon={<Copy size={14} />} title="Copy URL" onClick={() => url && navigator.clipboard.writeText(url)} />
        <ActionBtn
          icon={<ExternalLink size={14} />}
          title="Open link"
          onClick={() => {
            if (!url) return
            if (!isValidUrl(url)) { setUrlError(true); return }
            window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
          }}
        />

        <span className="ml-2 flex items-center gap-1 text-xs text-gray-400">
          <BarChart3 size={12} />
          {clicks} clicks
        </span>

        <button
          onClick={() => onDelete(id)}
          className="ml-auto cursor-pointer border-none bg-transparent p-1 text-gray-300 transition-colors hover:text-red-500"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function ActionBtn({ icon, onClick, title }: { icon: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="cursor-pointer rounded-md border-none bg-transparent p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      {icon}
    </button>
  )
}
