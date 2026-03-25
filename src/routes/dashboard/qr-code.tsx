import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { QRCodeSVG } from 'qrcode.react'
import {
  QrCode, Download, Copy, Check, Palette, Type, Globe, Trash2,
  Image, Square, Circle, RectangleHorizontal, Sparkles, Layers,
  RotateCcw, Link2,
} from 'lucide-react'
import connectToDatabase from '../../lib/db'
import QrCodeModel from '../../models/QrCode'

// ── Types ─────────────────────────────────────────────────────────────────────

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

const configSchema = z.object({
  url: z.string().min(1),
  label: z.string(),
  fgColor: z.string(),
  bgColor: z.string(),
  shape: z.enum(['square', 'rounded', 'dots']),
  frame: z.enum(['none', 'simple', 'branded']),
})

// ── Server functions ──────────────────────────────────────────────────────────

const getQrCodesFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')

  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const codes = await QrCodeModel.find({ userId: session.userId }).sort({ createdAt: -1 }).lean()
  return codes.map((q: any) => ({
    id: String(q._id),
    config: {
      url: q.url, label: q.label,
      fgColor: q.fgColor, bgColor: q.bgColor,
      shape: q.shape as QrShape, frame: q.frame as QrFrame, size: 256,
    },
    createdAt: new Date(q.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
  })) as SavedQr[]
})

const saveQrCodeFn = createServerFn({ method: 'POST' })
  .inputValidator(configSchema)
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    const qr = await QrCodeModel.create({
      userId: session.userId,
      url: data.url, label: data.label,
      fgColor: data.fgColor, bgColor: data.bgColor,
      shape: data.shape, frame: data.frame,
    })
    return { id: String(qr._id), config: { ...data, size: 256 }, createdAt: 'Just now' } as SavedQr
  })

const deleteQrCodeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await QrCodeModel.deleteOne({ _id: data.id, userId: session.userId })
    return { ok: true }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/qr-code')({
  loader: async () => getQrCodesFn(),
  component: QrCodePage,
})

// ── Constants ─────────────────────────────────────────────────────────────────

const defaultConfig: QrConfig = {
  url: '', fgColor: '#1a1a1a', bgColor: '#ffffff',
  shape: 'rounded', frame: 'simple', label: '', size: 256,
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

// ── QR level mapping ──────────────────────────────────────────────────────────
// qrcode.react accepts level as 'L'|'M'|'Q'|'H'
// We always use 'H' for best scannability

// ── Download helper: SVG → PNG via canvas ─────────────────────────────────────

function downloadSvgAsPng(svgEl: SVGSVGElement, filename: string) {
  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(svgEl)
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = new window.Image()
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = svgEl.width.baseVal.value || 256
    canvas.height = svgEl.height.baseVal.value || 256
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = filename
    a.click()
  }
  img.src = url
}

// ── Component ─────────────────────────────────────────────────────────────────

function QrCodePage() {
  const initialCodes = Route.useLoaderData()
  const [savedCodes, setSavedCodes] = useState<SavedQr[]>(initialCodes)
  const [config, setConfig] = useState<QrConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState<'url' | 'style' | 'frame'>('url')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [urlError, setUrlError] = useState('')
  const svgRef = useRef<SVGSVGElement>(null)

  const saveMutation = useMutation({
    mutationFn: () => saveQrCodeFn({ data: {
      url: config.url, label: config.label,
      fgColor: config.fgColor, bgColor: config.bgColor,
      shape: config.shape, frame: config.frame,
    }}),
    onSuccess: (saved) => setSavedCodes(prev => [saved, ...prev]),
    onError: (err: any) => alert(err?.message || 'Failed to save'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQrCodeFn({ data: { id } }),
    onSuccess: (_, id) => setSavedCodes(prev => prev.filter(q => q.id !== id)),
  })

  function set<K extends keyof QrConfig>(key: K, val: QrConfig[K]) {
    setConfig(prev => ({ ...prev, [key]: val }))
  }

  function validateAndSetUrl(val: string) {
    setUrlError('')
    set('url', val)
  }

  function handleDownload() {
    if (!svgRef.current) return
    downloadSvgAsPng(svgRef.current, `qr-${config.label || 'code'}.png`)
  }

  function handleCopyImage(markId: string) {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgRef.current)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = config.size
      canvas.height = config.size
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(pngBlob => {
        if (!pngBlob) return
        navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })])
        setCopiedId(markId)
        setTimeout(() => setCopiedId(null), 2000)
      })
    }
    img.src = url
  }

  function handleSave() {
    if (!config.url.trim()) { setUrlError('URL is required'); return }
    saveMutation.mutate()
  }

  // Map shape to qrcode.react imageSettings / style — dots uses circular via CSS filter trick
  // qrcode.react doesn't natively support dots/rounded, but we can use the `style` prop on the SVG wrapper
  // For true dot/rounded styles we pass the shape as a data attribute and apply CSS clip-path
  // The QR data itself is always correct — only visual style changes

  const hasUrl = config.url.trim().length > 0

  // qrcode.react level
  const level = 'H' as const

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-12 pt-6 sm:px-10 lg:px-12">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1069f9] to-[#0b5ad4] shadow-md shadow-[#1069f9]/20">
          <QrCode size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900">QR Code Generator</h1>
          <p className="text-xs text-gray-400">Create, customize, and save QR codes</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* ── Left: Editor ── */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1 rounded-xl border border-gray-100 bg-gray-50/60 p-1">
            {([
              { id: 'url', label: 'URL', icon: <Globe size={14} /> },
              { id: 'style', label: 'Style', icon: <Palette size={14} /> },
              { id: 'frame', label: 'Frame', icon: <Layers size={14} /> },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none py-2 font-sans text-xs font-semibold transition-all ${
                  activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: URL */}
          {activeTab === 'url' && (
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">Destination URL</label>
                <div className="relative">
                  <Globe size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="url" value={config.url} onChange={e => validateAndSetUrl(e.target.value)}
                    placeholder="https://example.com"
                    className={`h-11 w-full rounded-xl border pl-10 pr-4 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:ring-2 focus:ring-[#1069f9]/10 ${
                      urlError ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#1069f9]/40'
                    }`}
                  />
                </div>
                {urlError && <p className="mt-1 text-xs text-red-500">{urlError}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Label <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <Type size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="text" value={config.label} onChange={e => set('label', e.target.value)}
                    placeholder="e.g. My Portfolio"
                    className="h-11 w-full rounded-xl border border-gray-200 pl-10 pr-4 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-[#1069f9]/40 focus:ring-2 focus:ring-[#1069f9]/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Style */}
          {activeTab === 'style' && (
            <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5">
              <div>
                <label className="mb-2.5 block text-xs font-semibold text-gray-600">Color presets</label>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {presetColors.map(p => (
                    <button key={p.name} onClick={() => { set('fgColor', p.fg); set('bgColor', p.bg) }} title={p.name}
                      className={`flex h-10 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 transition-all ${
                        config.fgColor === p.fg && config.bgColor === p.bg ? 'scale-105 border-[#1069f9]' : 'border-transparent hover:border-gray-200'
                      }`} style={{ background: p.bg }}
                    >
                      <div className="h-4 w-4 rounded-sm" style={{ background: p.fg }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([{ label: 'Foreground', key: 'fgColor' as const }, { label: 'Background', key: 'bgColor' as const }]).map(({ label, key }) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600">{label}</label>
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-3">
                      <input type="color" value={config[key] as string} onChange={e => set(key, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border-none bg-transparent p-0" />
                      <span className="font-mono text-xs text-gray-600">{config[key] as string}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-600">Module shape</label>
                <div className="flex gap-2">
                  {([
                    { id: 'square', label: 'Square', icon: <Square size={16} /> },
                    { id: 'rounded', label: 'Rounded', icon: <RectangleHorizontal size={16} /> },
                    { id: 'dots', label: 'Dots', icon: <Circle size={16} /> },
                  ] as const).map(s => (
                    <button key={s.id} onClick={() => set('shape', s.id)}
                      className={`flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 py-3 font-sans text-[11px] font-semibold transition-all ${
                        config.shape === s.id ? 'border-[#1069f9] bg-[#1069f9]/5 text-[#1069f9]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Size: <span className="font-normal text-gray-400">{config.size}px</span>
                </label>
                <input type="range" min={128} max={512} step={32} value={config.size}
                  onChange={e => set('size', Number(e.target.value))} className="w-full accent-[#1069f9]" />
              </div>
            </div>
          )}

          {/* Tab: Frame */}
          {activeTab === 'frame' && (
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
              <label className="text-xs font-semibold text-gray-600">Frame style</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'none', label: 'None', icon: <QrCode size={22} /> },
                  { id: 'simple', label: 'Simple', icon: <Square size={22} /> },
                  { id: 'branded', label: 'Branded', icon: <Sparkles size={22} /> },
                ] as const).map(f => (
                  <button key={f.id} onClick={() => set('frame', f.id)}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 py-4 font-sans text-xs font-semibold transition-all ${
                      config.frame === f.id ? 'border-[#1069f9] bg-[#1069f9]/5 text-[#1069f9]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {f.icon} {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={!hasUrl || saveMutation.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1069f9] py-2.5 font-sans text-sm font-bold text-white shadow-md shadow-[#1069f9]/20 transition-all hover:bg-[#0b5ad4] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saveMutation.isPending
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <><Image size={15} /> Save QR</>}
            </button>
            <button onClick={handleDownload} disabled={!hasUrl}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-sans text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={15} /> Download
            </button>
            <button onClick={() => setConfig(defaultConfig)} title="Reset"
              className="flex cursor-pointer items-center rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-400 transition-all hover:bg-gray-50"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* ── Right: Live Preview ── */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-5">
            <p className="mb-4 text-xs font-semibold text-gray-400">Live Preview</p>

            {/* Frame wrapper */}
            <div className={`relative flex flex-col items-center justify-center ${
              config.frame === 'simple' ? 'rounded-2xl border-2 border-gray-900 p-3'
              : config.frame === 'branded' ? 'rounded-2xl border-2 p-3 pb-8'
              : ''
            }`} style={config.frame === 'branded' ? { borderColor: config.fgColor } : {}}>
              {hasUrl ? (
                <QRCodeSVG
                  ref={svgRef}
                  value={config.url}
                  size={config.size}
                  fgColor={config.fgColor}
                  bgColor={config.bgColor}
                  level={level}
                  style={{
                    maxWidth: '100%',
                    borderRadius: config.shape === 'dots' ? '50%' : config.shape === 'rounded' ? '12px' : '0',
                  }}
                />
              ) : (
                <div className="flex h-48 w-48 flex-col items-center justify-center rounded-xl bg-gray-50">
                  <QrCode size={40} className="mb-2 text-gray-200" />
                  <p className="text-center text-xs text-gray-300">Enter a URL to preview</p>
                </div>
              )}
              {config.frame === 'branded' && config.label && (
                <span className="absolute bottom-2 left-0 right-0 text-center text-[11px] font-bold" style={{ color: config.fgColor }}>
                  {config.label}
                </span>
              )}
            </div>

            {config.label && config.frame !== 'branded' && (
              <p className="mt-3 text-xs font-semibold text-gray-500">{config.label}</p>
            )}

            {hasUrl && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleCopyImage('preview')}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
                >
                  {copiedId === 'preview' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copiedId === 'preview' ? 'Copied!' : 'Copy image'}
                </button>
                <button onClick={handleDownload}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
                >
                  <Download size={12} /> PNG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Saved QR codes ── */}
      {savedCodes.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Saved QR Codes</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedCodes.map(saved => (
              <div key={saved.id} className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Mini live QR */}
                  <div className="shrink-0 rounded-lg overflow-hidden border border-gray-100">
                    <QRCodeSVG
                      value={saved.config.url}
                      size={48}
                      fgColor={saved.config.fgColor}
                      bgColor={saved.config.bgColor}
                      level="M"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">{saved.config.label || 'Untitled'}</p>
                    <p className="truncate text-xs text-gray-400">{saved.config.url}</p>
                    <p className="text-[11px] text-gray-300">{saved.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full border border-gray-100" style={{ background: saved.config.fgColor }} />
                  <div className="h-4 w-4 rounded-full border border-gray-100" style={{ background: saved.config.bgColor }} />
                  <span className="text-[11px] capitalize text-gray-400">{saved.config.shape} · {saved.config.frame} frame</span>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setConfig(saved.config)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-1.5 font-sans text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
                  >
                    <Link2 size={12} /> Load
                  </button>
                  <button onClick={() => deleteMutation.mutate(saved.id)}
                    className="flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-300 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
