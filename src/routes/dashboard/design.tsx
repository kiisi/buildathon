import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import LivePreview, { type DesignSettings } from '../../components/dashboard/LivePreview'
import connectToDatabase from '../../lib/db'
import DesignModel from '../../models/Design'
import {
  Sparkles, Upload, User, ImageIcon, Type, LayoutTemplate,
  Check, Shapes, X, Eye, Phone, Monitor, Hash, Loader2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type FullDesign = DesignSettings & {
  profileTitle: string
  profileBio: string
  profileImage: string
  activeTheme: string
  bgColor: string
}

// ── Server functions ──────────────────────────────────────────────────────────

const getDesignFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const d = await DesignModel.findOne({ userId: session.userId }).lean() as any
  return {
    profileTitle: d?.profileTitle ?? '',
    profileBio: d?.profileBio ?? '',
    profileImage: (d?.profileImage ?? '') as string,
    profileLayout: (d?.profileLayout ?? 'classic') as 'classic' | 'hero',
    activeTheme: d?.activeTheme ?? 't1',
    bgColor: d?.bgColor ?? '#ffffff',
    btnShape: (d?.btnShape ?? 'pill') as 'rect' | 'soft' | 'pill',
    btnStyle: (d?.btnStyle ?? 'solid') as 'solid' | 'outline' | 'shadow',
    btnColor: d?.btnColor ?? '#f1f5f9',
    btnFontColor: d?.btnFontColor ?? '#0f172a',
    fontFamily: d?.fontFamily ?? 'Link Sans',
    fontColor: d?.fontColor ?? '#0f172a',
  } as FullDesign
})

const saveDesignFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    profileTitle: z.string(),
    profileBio: z.string(),
    profileImage: z.string(),
    profileLayout: z.enum(['classic', 'hero']),
    activeTheme: z.string(),
    bgColor: z.string(),
    btnShape: z.enum(['rect', 'soft', 'pill']),
    btnStyle: z.enum(['solid', 'outline', 'shadow']),
    btnColor: z.string(),
    btnFontColor: z.string(),
    fontFamily: z.string(),
    fontColor: z.string(),
  }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await DesignModel.findOneAndUpdate(
      { userId: session.userId },
      { $set: { ...data, userId: session.userId } },
      { upsert: true },
    )
    return { ok: true }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/design')({
  loader: async () => getDesignFn(),
  component: DesignPage,
})

const dashboardRoute = getRouteApi('/dashboard')

// ── Static data ───────────────────────────────────────────────────────────────

const presetThemes = [
  { id: 't1', name: 'Air Light', bg: '#ffffff', button: '#f1f5f9', text: '#0f172a' },
  { id: 't2', name: 'Midnight', bg: '#0f172a', button: '#1e293b', text: '#f8fafc' },
  { id: 't3', name: 'Roseate', bg: '#fff1f2', button: '#ffe4e6', text: '#881337' },
  { id: 't4', name: 'Dune', bg: '#fefce8', button: '#fef08a', text: '#713f12' },
  { id: 't5', name: 'Forest', bg: '#f0fdf4', button: '#bbf7d0', text: '#14532d' },
  { id: 't6', name: 'Ocean', bg: '#eff6ff', button: '#bfdbfe', text: '#1e3a8a' },
]

const buttonShapes = [
  { id: 'rect' as const, label: 'Rectangle' },
  { id: 'soft' as const, label: 'Soft' },
  { id: 'pill' as const, label: 'Pill' },
]

const buttonStyles = [
  { id: 'solid' as const, label: 'Solid' },
  { id: 'outline' as const, label: 'Outline' },
  { id: 'shadow' as const, label: 'Shadow' },
]

const fonts = ['Link Sans', 'Inter', 'Outfit', 'Playfair Display', 'Space Grotesk']
const bgColorPresets = ['#ffffff', '#f8fafc', '#f1f5f9', '#0f172a', '#fff1f2', '#eff6ff', '#f0fdf4', '#fefce8', '#1a1a1a']

// ── Component ─────────────────────────────────────────────────────────────────

export function DesignPage() {
  const initial = Route.useLoaderData()
  const { username } = dashboardRoute.useLoaderData()
  const [d, setD] = useState<FullDesign>(initial)
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'background' | 'buttons' | 'typography'>('profile')
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  function set<K extends keyof FullDesign>(key: K, val: FullDesign[K]) {
    setD(prev => ({ ...prev, [key]: val }))
  }

  async function handleImageUpload(file: File) {
    if (!file) return
    setUploadingImage(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('upload_preset', 'linkgrove')
      form.append('cloud_name', 'destinyfelixkiisi')
      form.append('folder', 'linkgrove')
      const res = await fetch('https://api.cloudinary.com/v1_1/destinyfelixkiisi/image/upload', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (data.secure_url) set('profileImage', data.secure_url)
      else throw new Error('Upload failed')
    } catch (err: any) {
      alert(err?.message || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  useEffect(() => {
    if (mobilePreviewOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobilePreviewOpen])

  const saveMutation = useMutation({
    mutationFn: () => saveDesignFn({ data: d }),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) },
    onError: (err: any) => alert(err?.message || 'Failed to save'),
  })

  // Apply theme preset
  function applyTheme(theme: typeof presetThemes[0]) {
    setD(prev => ({
      ...prev,
      activeTheme: theme.id,
      bgColor: theme.bg,
      btnColor: theme.button,
      fontColor: theme.text,
      btnFontColor: theme.text,
    }))
  }

  const designProps: Partial<DesignSettings> = {
    profileLayout: d.profileLayout,
    bgColor: d.bgColor,
    btnShape: d.btnShape,
    btnStyle: d.btnStyle,
    btnColor: d.btnColor,
    btnFontColor: d.btnFontColor,
    fontColor: d.fontColor,
    fontFamily: d.fontFamily,
    profileImage: d.profileImage,
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'theme' as const, label: 'Themes', icon: LayoutTemplate },
    { id: 'background' as const, label: 'Background', icon: ImageIcon },
    { id: 'buttons' as const, label: 'Buttons', icon: Shapes },
    { id: 'typography' as const, label: 'Typography', icon: Type },
  ]

  return (
    <div className="flex h-full w-full bg-[#FAFAFA]">
      {/* ── Editor ── */}
      <div className="flex w-full flex-1 flex-col xl:min-w-[600px] xl:max-w-3xl">

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900">Design Studio</h1>
              <p className="hidden text-[11px] text-gray-500 sm:block">Craft a unique identity for your Linkgrove.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobilePreviewOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 xl:hidden"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-900 px-5 font-sans text-xs font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60"
            >
              {saveMutation.isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[73px] z-10 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="flex overflow-x-auto px-4 sm:px-8">
            <div className="flex gap-1 py-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex whitespace-nowrap cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                    activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={15} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-8 pb-32 sm:px-8">

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="mx-auto flex max-w-2xl flex-col gap-6">
              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-5 text-sm font-bold text-gray-900">Profile Image</h3>
                <div className="flex items-center gap-5">
                  <label className="group relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 hover:border-indigo-400">
                    {uploadingImage ? (
                      <Loader2 size={22} className="animate-spin text-indigo-400" />
                    ) : d.profileImage ? (
                      <img src={d.profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <User size={28} className="text-gray-400 group-hover:text-indigo-400" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Upload size={18} className="text-white" />
                        </div>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="sr-only"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
                    />
                  </label>
                  <div>
                    <label className="cursor-pointer rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800">
                      {uploadingImage ? 'Uploading…' : d.profileImage ? 'Change Image' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        className="sr-only"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
                      />
                    </label>
                    {d.profileImage && (
                      <button
                        onClick={() => set('profileImage', '')}
                        className="ml-2 text-xs font-semibold text-red-400 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                    <p className="mt-1.5 text-[11px] text-gray-400">PNG, JPG, GIF or WEBP · Max 5MB</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-5 text-sm font-bold text-gray-900">Profile Details</h3>

                <div className="mb-5">
                  <label className="mb-2 block text-xs font-bold text-gray-700">Layout</label>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { id: 'classic' as const, label: 'Classic (Center)', avatar: 'center' },
                      { id: 'hero' as const, label: 'Hero (Left)', avatar: 'left' },
                    ]).map(layout => (
                      <button
                        key={layout.id}
                        onClick={() => set('profileLayout', layout.id)}
                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                          d.profileLayout === layout.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`flex w-full flex-col gap-1.5 ${layout.avatar === 'center' ? 'items-center' : 'items-start'}`}>
                          <div className={`h-8 w-8 rounded-full bg-gray-300 ${layout.avatar === 'left' ? 'rounded-lg' : ''}`} />
                          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
                          <div className="h-1 w-16 rounded-full bg-gray-200" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">Title</label>
                    <input
                      type="text"
                      value={d.profileTitle}
                      onChange={e => set('profileTitle', e.target.value)}
                      placeholder="Your name or brand"
                      className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-700">Bio</label>
                    <textarea
                      rows={3}
                      value={d.profileBio}
                      onChange={e => set('profileBio', e.target.value)}
                      placeholder="A short description about you"
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ── Themes Tab ── */}
          {activeTab === 'theme' && (
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-5 text-sm font-bold text-gray-900">Curated Themes</h3>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
                {presetThemes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => applyTheme(theme)}
                    className="group flex cursor-pointer flex-col gap-2 text-left"
                  >
                    <div
                      className={`relative flex aspect-[9/16] w-full flex-col items-center gap-2 overflow-hidden rounded-2xl border-2 p-3 transition-all ${
                        d.activeTheme === theme.id ? 'border-gray-900 ring-4 ring-gray-900/10 scale-[1.02]' : 'border-gray-200 group-hover:border-gray-400'
                      }`}
                      style={{ background: theme.bg }}
                    >
                      <div className="mt-2 h-8 w-8 rounded-full opacity-30" style={{ backgroundColor: theme.text }} />
                      <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: theme.text }} />
                      <div className="mt-2 flex w-full flex-col gap-1.5">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-5 w-full rounded-md opacity-70" style={{ backgroundColor: theme.button }} />
                        ))}
                      </div>
                      {d.activeTheme === theme.id && (
                        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white">
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Background Tab ── */}
          {activeTab === 'background' && (
            <div className="mx-auto max-w-2xl">
              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-5 text-sm font-bold text-gray-900">Background Color</h3>
                <div className="mb-5 grid grid-cols-5 gap-3 sm:grid-cols-9">
                  {bgColorPresets.map(c => (
                    <button
                      key={c}
                      onClick={() => set('bgColor', c)}
                      className={`aspect-square w-full rounded-xl border-2 transition-all ${
                        d.bgColor === c ? 'border-gray-900 ring-4 ring-gray-900/10 scale-110' : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <label className="mb-2 block text-xs font-bold text-gray-700">Custom Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 cursor-pointer">
                    <input type="color" value={d.bgColor} onChange={e => set('bgColor', e.target.value)}
                      className="absolute -inset-2 h-20 w-24 cursor-pointer border-none bg-transparent" />
                  </div>
                  <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4">
                    <Hash size={14} className="text-gray-400" />
                    <span className="font-mono text-sm font-semibold uppercase text-gray-700">{d.bgColor.replace('#', '')}</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ── Buttons Tab ── */}
          {activeTab === 'buttons' && (
            <div className="mx-auto max-w-2xl flex flex-col gap-6">
              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Button Shape</h3>
                <div className="grid grid-cols-3 gap-3">
                  {buttonShapes.map(shape => {
                    const r = shape.id === 'rect' ? '0px' : shape.id === 'soft' ? '10px' : '9999px'
                    return (
                      <button
                        key={shape.id}
                        onClick={() => set('btnShape', shape.id)}
                        className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all ${
                          d.btnShape === shape.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="h-8 w-full bg-gray-800" style={{ borderRadius: r }} />
                        <span className="text-[11px] font-bold text-gray-600">{shape.label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Button Style</h3>
                <div className="grid grid-cols-3 gap-3">
                  {buttonStyles.map(style => {
                    const previewStyle: React.CSSProperties =
                      style.id === 'solid' ? { backgroundColor: '#111', color: '#fff', border: 'none' }
                      : style.id === 'outline' ? { backgroundColor: 'transparent', border: '2px solid #111', color: '#111' }
                      : { backgroundColor: '#fff', border: '2px solid #111', color: '#111', boxShadow: '3px 3px 0 0 #111' }
                    return (
                      <button
                        key={style.id}
                        onClick={() => set('btnStyle', style.id)}
                        className={`flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border-2 p-4 transition-all ${
                          d.btnStyle === style.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex h-9 w-full items-center justify-center rounded-lg text-[11px] font-bold" style={previewStyle}>
                          Link
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{style.label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Button Colors</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {([
                    { label: 'Button Color', key: 'btnColor' as const },
                    { label: 'Text Color', key: 'btnFontColor' as const },
                  ]).map(({ label, key }) => (
                    <div key={key}>
                      <label className="mb-2 block text-xs font-bold text-gray-700">{label}</label>
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 cursor-pointer">
                          <input type="color" value={d[key]} onChange={e => set(key, e.target.value)}
                            className="absolute -inset-2 h-20 w-24 cursor-pointer border-none bg-transparent" />
                        </div>
                        <div className="flex h-11 flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 font-mono text-sm font-semibold uppercase text-gray-700">
                          {d[key]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── Typography Tab ── */}
          {activeTab === 'typography' && (
            <div className="mx-auto max-w-2xl flex flex-col gap-6">
              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Font</h3>
                <select
                  value={d.fontFamily}
                  onChange={e => set('fontFamily', e.target.value)}
                  className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/10 cursor-pointer"
                >
                  {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Text Color</h3>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 cursor-pointer">
                    <input type="color" value={d.fontColor} onChange={e => set('fontColor', e.target.value)}
                      className="absolute -inset-2 h-20 w-28 cursor-pointer border-none bg-transparent" />
                  </div>
                  <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4">
                    <Hash size={14} className="text-gray-400" />
                    <span className="font-mono text-sm font-semibold uppercase text-gray-700">{d.fontColor.replace('#', '')}</span>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
      </div>

      {/* ── Desktop Live Preview ── */}
      <div className="hidden xl:flex w-[380px] shrink-0 flex-col items-center border-l border-gray-100 bg-white px-8 pb-12 overflow-y-auto h-full">
        <div className="mt-8 mb-4 flex w-full items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Live Preview</span>
          <div className="flex gap-1.5">
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer">
              <Monitor size={12} />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white cursor-pointer">
              <Phone size={12} />
            </button>
          </div>
        </div>
        <div className="w-full flex justify-center origin-top scale-[0.88]">
          <LivePreview username={d.profileTitle || username} displayName={d.profileBio} slug={username} design={designProps} />
        </div>
      </div>

      {/* ── Mobile Preview Modal ── */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-100/90 backdrop-blur-xl xl:hidden">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white/50 px-4 py-4">
            <span className="text-sm font-bold text-gray-900">Live Preview</span>
            <button onClick={() => setMobilePreviewOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50">
              <X size={16} />
            </button>
          </div>
          <div className="flex flex-1 justify-center overflow-y-auto pt-8 pb-12">
            <LivePreview username={d.profileTitle || username} displayName={d.profileBio} slug={username} design={designProps} />
          </div>
        </div>
      )}
    </div>
  )
}
