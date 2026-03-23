import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  QrCode,
  Download,
  Copy,
  Check,
  Palette,
  Type,
  Globe,
  Trash2,
  Image,
  Square,
  Circle,
  RectangleHorizontal,
  Sparkles,
  Layers,
  RotateCcw,
  Share2,
  Link2,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/qr-code')({
  component: QrCodePage,
})

/* ── Types ─────────────────────────────────────────── */
type QrShape = 'square' | 'rounded' | 'dots'
type QrFrame = 'none' | 'simple' | 'branded'

type QrConfig = {
  url: string
  fgColor: string
  bgColor: string
  shape: QrShape
  frame: QrFrame
  label: string
  size: number
}

type SavedQr = {
  id: string
  config: QrConfig
  createdAt: string
}

const defaultConfig: QrConfig = {
  url: '',
  fgColor: '#1a1a1a',
  bgColor: '#ffffff',
  shape: 'rounded',
  frame: 'simple',
  label: '',
  size: 256,
}

const presetColors = [
  { fg: '#1a1a1a', bg: '#ffffff', name: 'Classic' },
  { fg: '#1069f9', bg: '#f0f6ff', name: 'Ocean' },
  { fg: '#7c3aed', bg: '#f5f3ff', name: 'Purple' },
  { fg: '#059669', bg: '#ecfdf5', name: 'Forest' },
  { fg: '#dc2626', bg: '#fef2f2', name: 'Cherry' },
  { fg: '#ea580c', bg: '#fff7ed', name: 'Sunset' },
  { fg: '#ffffff', bg: '#1a1a1a', name: 'Inverted' },
  { fg: '#f59e0b', bg: '#1a1a1a', name: 'Gold' },
]

const mockSavedQrs: SavedQr[] = [
  {
    id: '1',
    config: {
      url: 'https://linkgrove.ee/devkiisi',
      fgColor: '#1069f9',
      bgColor: '#f0f6ff',
      shape: 'rounded',
      frame: 'branded',
      label: 'My LinkGrove',
      size: 256,
    },
    createdAt: 'Mar 22, 2026',
  },
  {
    id: '2',
    config: {
      url: 'https://github.com/devkiisi',
      fgColor: '#1a1a1a',
      bgColor: '#ffffff',
      shape: 'square',
      frame: 'simple',
      label: 'GitHub Profile',
      size: 256,
    },
    createdAt: 'Mar 18, 2026',
  },
  {
    id: '3',
    config: {
      url: 'https://open.spotify.com/playlist/coding-vibes',
      fgColor: '#059669',
      bgColor: '#ecfdf5',
      shape: 'dots',
      frame: 'none',
      label: 'Coding Playlist',
      size: 256,
    },
    createdAt: 'Mar 12, 2026',
  },
]

/* ── QR Code Canvas Renderer ──────────────────────── */
// Simple QR-like pattern generator (visual mock — generates a realistic-looking QR pattern)
function drawQrToCanvas(
  canvas: HTMLCanvasElement,
  config: QrConfig,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { fgColor, bgColor, shape, frame, label, size } = config
  const totalSize = frame === 'none' ? size : size + 60
  canvas.width = totalSize * 2
  canvas.height = (frame === 'branded' && label ? totalSize + 36 : totalSize) * 2
  canvas.style.width = `${totalSize}px`
  canvas.style.height = `${frame === 'branded' && label ? totalSize + 36 : totalSize}px`
  ctx.scale(2, 2)

  // Background
  if (frame !== 'none') {
    ctx.fillStyle = bgColor
    ctx.beginPath()
    ctx.roundRect(0, 0, totalSize, canvas.height / 2, 16)
    ctx.fill()
  }

  const offset = frame === 'none' ? 0 : 30
  const cellSize = size / 25

  // QR background
  ctx.fillStyle = bgColor
  if (shape === 'rounded') {
    ctx.beginPath()
    ctx.roundRect(offset, offset, size, size, 12)
    ctx.fill()
  } else {
    ctx.fillRect(offset, offset, size, size)
  }

  // Generate deterministic pattern from URL
  const seed = config.url || 'linkgrove'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }

  // Draw QR modules
  ctx.fillStyle = fgColor
  const grid = 25
  const moduleSize = cellSize * 0.85
  const moduleOffset = (cellSize - moduleSize) / 2

  // Finder patterns (top-left, top-right, bottom-left)
  function drawFinder(x: number, y: number) {
    const s = cellSize
    // Outer
    ctx.fillStyle = fgColor
    if (shape === 'rounded') {
      ctx.beginPath()
      ctx.roundRect(offset + x * s, offset + y * s, 7 * s, 7 * s, 4)
      ctx.fill()
    } else if (shape === 'dots') {
      ctx.beginPath()
      ctx.roundRect(offset + x * s, offset + y * s, 7 * s, 7 * s, 14)
      ctx.fill()
    } else {
      ctx.fillRect(offset + x * s, offset + y * s, 7 * s, 7 * s)
    }
    // Inner white
    ctx.fillStyle = bgColor
    if (shape === 'dots') {
      ctx.beginPath()
      ctx.roundRect(offset + (x + 1) * s, offset + (y + 1) * s, 5 * s, 5 * s, 10)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.roundRect(offset + (x + 1) * s, offset + (y + 1) * s, 5 * s, 5 * s, shape === 'rounded' ? 2 : 0)
      ctx.fill()
    }
    // Inner dark
    ctx.fillStyle = fgColor
    if (shape === 'dots') {
      ctx.beginPath()
      ctx.roundRect(offset + (x + 2) * s, offset + (y + 2) * s, 3 * s, 3 * s, 6)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.roundRect(offset + (x + 2) * s, offset + (y + 2) * s, 3 * s, 3 * s, shape === 'rounded' ? 2 : 0)
      ctx.fill()
    }
  }

  drawFinder(0, 0)
  drawFinder(grid - 7, 0)
  drawFinder(0, grid - 7)

  // Data modules (pseudo-random from hash)
  ctx.fillStyle = fgColor
  for (let row = 0; row < grid; row++) {
    for (let col = 0; col < grid; col++) {
      // Skip finder pattern areas
      if (
        (row < 8 && col < 8) ||
        (row < 8 && col >= grid - 8) ||
        (row >= grid - 8 && col < 8)
      )
        continue
      // Skip timing patterns
      if (row === 6 || col === 6) {
        if ((row + col) % 2 === 0) {
          const x = offset + col * cellSize + moduleOffset
          const y = offset + row * cellSize + moduleOffset
          if (shape === 'dots') {
            ctx.beginPath()
            ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, 0, Math.PI * 2)
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.roundRect(x, y, moduleSize, moduleSize, shape === 'rounded' ? 2 : 0)
            ctx.fill()
          }
        }
        continue
      }

      // Pseudo-random data
      const val = ((hash * (row * grid + col + 1) * 31) >>> 0) % 100
      if (val < 45) {
        const x = offset + col * cellSize + moduleOffset
        const y = offset + row * cellSize + moduleOffset
        if (shape === 'dots') {
          ctx.beginPath()
          ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.roundRect(x, y, moduleSize, moduleSize, shape === 'rounded' ? 2 : 0)
          ctx.fill()
        }
      }
    }
  }

  // Frame label
  if (frame === 'branded' && label) {
    ctx.fillStyle = fgColor
    ctx.font = 'bold 13px "Plus Jakarta Sans", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, totalSize / 2, totalSize + 14)
  }
}

/* ── Main Component ────────────────────────────────── */
function QrCodePage() {
  const [config, setConfig] = useState<QrConfig>({ ...defaultConfig })
  const [savedQrs, setSavedQrs] = useState<SavedQr[]>(mockSavedQrs)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  const hasUrl = config.url.trim().length > 0

  // Render QR on config change
  useEffect(() => {
    if (canvasRef.current) {
      drawQrToCanvas(canvasRef.current, {
        ...config,
        url: config.url || 'https://linkgrove.ee',
      })
    }
  }, [config])

  // Render saved QR thumbnails
  useEffect(() => {
    savedQrs.forEach((qr) => {
      const canvas = previewCanvasRefs.current.get(qr.id)
      if (canvas) {
        drawQrToCanvas(canvas, { ...qr.config, size: 80, frame: 'none' })
      }
    })
  }, [savedQrs, activeTab])

  const setPreviewRef = useCallback((id: string) => (el: HTMLCanvasElement | null) => {
    if (el) {
      previewCanvasRefs.current.set(id, el)
      const qr = savedQrs.find((q) => q.id === id)
      if (qr) drawQrToCanvas(el, { ...qr.config, size: 80, frame: 'none' })
    } else {
      previewCanvasRefs.current.delete(id)
    }
  }, [savedQrs])

  function update(partial: Partial<QrConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }))
  }

  function handleDownload() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `qr-${config.label || 'code'}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  function handleCopy() {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    })
  }

  function handleSave() {
    const newQr: SavedQr = {
      id: Date.now().toString(),
      config: { ...config },
      createdAt: 'Just now',
    }
    setSavedQrs((prev) => [newQr, ...prev])
    setActiveTab('saved')
  }

  function handleDeleteSaved(id: string) {
    setSavedQrs((prev) => prev.filter((q) => q.id !== id))
  }

  function handleLoadSaved(qr: SavedQr) {
    setConfig({ ...qr.config })
    setActiveTab('create')
  }

  function handleReset() {
    setConfig({ ...defaultConfig })
  }

  /* ── Render ───────────────────────────────────────── */
  return (
    <div className="flex-1 px-6 py-6 sm:px-10 lg:px-12">
      {/* ─── Header ─── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
            <QrCode size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              QR Code Generator
            </h1>
            <p className="text-xs text-gray-400">
              Create beautiful, customizable QR codes
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
          {([
            { key: 'create' as const, label: 'Create', icon: <Sparkles size={13} /> },
            { key: 'saved' as const, label: `Saved (${savedQrs.length})`, icon: <Layers size={13} /> },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-md border-none px-3.5 py-1.5 font-sans text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="flex flex-col gap-6 xl:flex-row">
          {/* ─── Left: Controls ─── */}
          <div className="flex flex-1 flex-col gap-4">
            {/* URL Input */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Globe size={13} className="text-gray-400" />
                Destination URL
              </label>
              <input
                type="url"
                value={config.url}
                onChange={(e) => update({ url: e.target.value })}
                placeholder="https://your-link-here.com"
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-violet-400/40 focus:bg-white focus:ring-2 focus:ring-violet-500/10"
              />

              <div className="mt-3">
                <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Type size={13} className="text-gray-400" />
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={config.label}
                  onChange={(e) => update({ label: e.target.value })}
                  placeholder="e.g. My Portfolio"
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/60 px-3 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-violet-400/40 focus:bg-white"
                />
              </div>
            </div>

            {/* Color Presets */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <label className="mb-3 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Palette size={13} className="text-gray-400" />
                Color Theme
              </label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {presetColors.map((preset) => {
                  const isActive =
                    config.fgColor === preset.fg && config.bgColor === preset.bg
                  return (
                    <button
                      key={preset.name}
                      onClick={() => update({ fgColor: preset.fg, bgColor: preset.bg })}
                      className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${
                        isActive
                          ? 'border-violet-400 bg-violet-50/50 shadow-sm'
                          : 'border-gray-100 bg-transparent hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-lg shadow-sm">
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: preset.bg }}
                        />
                        <div
                          className="absolute inset-[6px] rounded"
                          style={{ backgroundColor: preset.fg }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">
                        {preset.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Custom color pickers */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-gray-400">FG</label>
                  <div className="relative">
                    <input
                      type="color"
                      value={config.fgColor}
                      onChange={(e) => update({ fgColor: e.target.value })}
                      className="h-7 w-7 cursor-pointer rounded-md border border-gray-200 p-0.5"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">{config.fgColor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-gray-400">BG</label>
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => update({ bgColor: e.target.value })}
                    className="h-7 w-7 cursor-pointer rounded-md border border-gray-200 p-0.5"
                  />
                  <span className="text-[11px] font-mono text-gray-400">{config.bgColor}</span>
                </div>
              </div>
            </div>

            {/* Shape & Frame */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-4">
                <label className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Image size={13} className="text-gray-400" />
                  Module Shape
                </label>
                <div className="flex gap-2">
                  {([
                    { key: 'square' as const, label: 'Square', icon: <Square size={16} /> },
                    { key: 'rounded' as const, label: 'Rounded', icon: <RectangleHorizontal size={16} /> },
                    { key: 'dots' as const, label: 'Dots', icon: <Circle size={16} /> },
                  ]).map((s) => (
                    <button
                      key={s.key}
                      onClick={() => update({ shape: s.key })}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-2.5 font-sans text-xs font-semibold transition-all ${
                        config.shape === s.key
                          ? 'border-violet-400 bg-violet-50/50 text-violet-700 shadow-sm'
                          : 'border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Layers size={13} className="text-gray-400" />
                  Frame Style
                </label>
                <div className="flex gap-2">
                  {([
                    { key: 'none' as const, label: 'None' },
                    { key: 'simple' as const, label: 'Simple' },
                    { key: 'branded' as const, label: 'Branded' },
                  ]).map((f) => (
                    <button
                      key={f.key}
                      onClick={() => update({ frame: f.key })}
                      className={`flex-1 cursor-pointer rounded-xl border px-3 py-2.5 font-sans text-xs font-semibold transition-all ${
                        config.frame === f.key
                          ? 'border-violet-400 bg-violet-50/50 text-violet-700 shadow-sm'
                          : 'border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right: Preview ─── */}
          <div className="xl:w-[340px]">
            <div className="sticky top-6 flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-6">
              <p className="mb-4 text-xs font-bold text-gray-700">Live Preview</p>

              {/* Canvas preview */}
              <div className="mb-5 flex items-center justify-center rounded-xl bg-gray-50/80 p-6">
                <canvas ref={canvasRef} className="block" />
              </div>

              {/* URL display */}
              {hasUrl && (
                <div className="mb-4 flex w-full items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <Link2 size={12} className="shrink-0 text-gray-300" />
                  <span className="truncate text-[11px] text-gray-400">{config.url}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex w-full flex-col gap-2">
                <button
                  onClick={handleDownload}
                  className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-sans text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
                >
                  <Download size={15} />
                  Download PNG
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border font-sans text-xs font-semibold transition-all ${
                      copied
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                        : 'border-gray-200 bg-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  <button
                    onClick={handleSave}
                    className="flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-transparent font-sans text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    <Layers size={13} />
                    Save
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-transparent text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── Saved QR Codes Tab ─── */
        <>
          {savedQrs.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedQrs.map((qr) => (
                <div
                  key={qr.id}
                  className="group flex cursor-pointer flex-col rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
                  onClick={() => handleLoadSaved(qr)}
                >
                  {/* Preview */}
                  <div
                    className="mb-3 flex items-center justify-center rounded-xl p-4"
                    style={{ backgroundColor: qr.config.bgColor + '33' }}
                  >
                    <canvas
                      ref={setPreviewRef(qr.id)}
                      className="block"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {qr.config.label || 'Untitled QR'}
                      </p>
                      <p
                        className="mt-0.5 truncate text-xs text-gray-400"
                        title={qr.config.url}
                      >
                        {qr.config.url}
                      </p>
                      <p className="mt-1.5 text-[11px] text-gray-300">{qr.createdAt}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigator.clipboard.writeText(qr.config.url)
                        }}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
                      >
                        <Share2 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSaved(qr.id)
                        }}
                        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty saved state */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5">
                  <QrCode size={28} className="text-violet-500" />
                </div>
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-gray-900">
                No saved QR codes
              </h3>
              <p className="mb-5 max-w-[260px] text-center text-xs leading-relaxed text-gray-400">
                Create and save QR codes to access them quickly later.
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-2.5 font-sans text-xs font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:shadow-lg active:scale-[0.98]"
              >
                <Sparkles size={14} />
                Create your first QR
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
