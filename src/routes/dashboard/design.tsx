import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import LivePreview from '../../components/dashboard/LivePreview'
import {
  Sparkles, Upload, User, Palette, ImageIcon, Type, LayoutTemplate,
  Check, Shapes, X, Eye, Phone, Monitor, ChevronRight, Settings2, Hash,
  AlignLeft, AlignCenter
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/design')({
  component: DesignPage,
})

/* ── Mock Data ─────────────────────────────────────── */
const presetThemes = [
  { id: 't1', name: 'Air Light', bg: '#ffffff', button: '#f1f5f9', text: '#0f172a', accent: '#3b82f6' },
  { id: 't2', name: 'Midnight', bg: '#0f172a', button: '#1e293b', text: '#f8fafc', accent: '#8b5cf6' },
  { id: 't3', name: 'Glass', bg: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', button: 'rgba(255,255,255,0.5)', text: '#1e293b', accent: '#ec4899', isGradient: true },
  { id: 't4', name: 'Cyber', bg: '#000000', button: '#111111', text: '#10b981', accent: '#10b981', outline: true },
  { id: 't5', name: 'Roseate', bg: '#fff1f2', button: '#ffe4e6', text: '#881337', accent: '#e11d48' },
  { id: 't6', name: 'Dune', bg: '#fefce8', button: '#fef08a', text: '#713f12', accent: '#ca8a04' },
]

const buttonShapes = [
  { id: 'rect', label: 'Rectangle', radius: 'rounded-none' },
  { id: 'soft', label: 'Soft', radius: 'rounded-lg' },
  { id: 'pill', label: 'Pill', radius: 'rounded-full' },
]

const buttonStyles = [
  { id: 'solid', label: 'Solid', class: 'bg-gray-900 border-transparent text-white' },
  { id: 'outline', label: 'Outline', class: 'bg-transparent border-2 border-gray-900 text-gray-900' },
  { id: 'shadow', label: 'Shadow', class: 'bg-white border-2 border-gray-900 text-gray-900 shadow-[4px_4px_0_0_#111827]' },
]

const fonts = ['Link Sans', 'Inter', 'Outfit', 'Playfair Display', 'Space Grotesk']
const bgColorPresets = ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#0f172a', '#1e293b', '#fff1f2', '#eff6ff', '#f0fdf4']

/* ── Components ────────────────────────────────────── */
export function DesignPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'background' | 'buttons' | 'typography'>('profile')
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  const [profileTitle, setProfileTitle] = useState('devkiisi')
  const [profileBio, setProfileBio] = useState('Frontend Developer & UI/UX Designer')
  const [profileLayout, setProfileLayout] = useState<'classic' | 'hero'>('classic')

  const [activeTheme, setActiveTheme] = useState('t1')
  const [bgType, setBgType] = useState<'color' | 'gradient' | 'image' | 'video'>('color')
  const [bgColor, setBgColor] = useState('#ffffff')

  const [btnShape, setBtnShape] = useState('pill')
  const [btnStyle, setBtnStyle] = useState('shadow')
  const [btnColor, setBtnColor] = useState('#ffffff')
  const [btnFontColor, setBtnFontColor] = useState('#0f172a')

  const [fontFamily, setFontFamily] = useState('Link Sans')
  const [fontColor, setFontColor] = useState('#0f172a')

  // Prevent background scrolling when mobile preview is open
  useEffect(() => {
    if (mobilePreviewOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [mobilePreviewOpen])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'theme', label: 'Themes', icon: LayoutTemplate },
    { id: 'background', label: 'Background', icon: ImageIcon },
    { id: 'buttons', label: 'Buttons', icon: Shapes },
    { id: 'typography', label: 'Typography', icon: Type },
  ] as const

  return (
    <div className="flex h-full w-full bg-[#FAFAFA]">
      {/* ─── Editor Area ─── */}
      <div className="flex w-full flex-1 flex-col xl:w-auto xl:min-w-[600px] xl:max-w-3xl">
        
        {/* Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-gray-900">Design Studio</h1>
              <p className="hidden text-[11px] font-medium text-gray-500 sm:block">Craft a unique identity for your Linkgrove.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobilePreviewOpen(true)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 xl:hidden"
            >
              <Eye size={18} />
            </button>
            <button className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-900 px-5 font-sans text-xs font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]">
              Save Changes
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-[73px] z-10 w-full border-b border-gray-100 bg-white/95 backdrop-blur-xl">
          <div className="flex overflow-x-auto hide-scrollbar px-4 sm:px-8">
            <div className="flex gap-1 py-3">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex whitespace-nowrap cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                      isActive
                        ? 'bg-gray-900 text-white shadow-md'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Content Form */}
        <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 pb-32">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="flex max-w-2xl flex-col gap-8 mx-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
              
              <section className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                <h3 className="mb-6 text-sm font-bold text-gray-900">Profile Image</h3>
                <div className="flex items-center gap-6">
                  <div className="relative group flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-indigo-400">
                    <User size={32} className="text-gray-400 group-hover:text-indigo-400 transition-colors" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Upload size={20} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="w-fit cursor-pointer rounded-full bg-gray-900 px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-gray-800">
                      Upload Image
                    </button>
                    <p className="text-[11px] font-medium text-gray-400">Must be a PNG, JPG, or GIF. Max 5MB.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                <h3 className="mb-6 text-sm font-bold text-gray-900">Profile Details</h3>
                
                <div className="mb-6">
                  <label className="mb-2 block text-xs font-bold text-gray-700">Layout Style</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setProfileLayout('classic')}
                      className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                        profileLayout === 'classic' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2 w-full">
                        <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
                        <div className="h-1.5 w-24 bg-gray-200 rounded-full"></div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">Classic (Center)</span>
                    </button>
                    <button
                      onClick={() => setProfileLayout('hero')}
                      className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                        profileLayout === 'hero' ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-start gap-2 w-full px-2">
                        <div className="h-10 w-10 rounded-xl bg-gray-300"></div>
                        <div className="h-2 w-16 bg-gray-300 rounded-full mt-1"></div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full"></div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700">Hero (Left Align)</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-700">Title</label>
                    <input
                      type="text"
                      value={profileTitle}
                      onChange={(e) => setProfileTitle(e.target.value)}
                      className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 font-sans text-sm font-semibold text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-gray-700">Bio</label>
                    <textarea
                      rows={3}
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 font-sans text-sm font-semibold text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                    />
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* Themes Tab */}
          {activeTab === 'theme' && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Curated Themes</h3>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold text-indigo-600">Pro features included</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {presetThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setActiveTheme(theme.id)}
                    className="group flex cursor-pointer flex-col gap-3 text-left w-full"
                  >
                    <div
                      className={`relative w-full aspect-[9/16] rounded-2xl border-2 p-3 transition-all flex flex-col items-center gap-2.5 overflow-hidden ${
                        activeTheme === theme.id ? 'border-gray-900 ring-4 ring-gray-900/10 scale-[1.02]' : 'border-gray-200 group-hover:border-gray-400 group-hover:shadow-md'
                      }`}
                      style={{ background: theme.bg }}
                    >
                      <div className="h-8 w-8 rounded-full bg-current opacity-20 shrink-0 mt-2" style={{ color: theme.text }}></div>
                      <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: theme.text }}></div>
                      
                      <div className="mt-2 w-full flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i} 
                            className={`h-6 w-full rounded-md ${theme.outline ? 'border border-current bg-transparent' : ''}`} 
                            style={{ 
                              backgroundColor: theme.outline ? 'transparent' : theme.button,
                              borderColor: theme.outline ? theme.accent : 'transparent'
                            }} 
                          />
                        ))}
                      </div>

                      {activeTheme === theme.id && (
                        <div className="absolute inset-0 border-4 border-gray-900 rounded-2xl pointer-events-none"></div>
                      )}
                      {activeTheme === theme.id && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-gray-900 flex items-center justify-center text-white shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Backgrounds Tab */}
          {activeTab === 'background' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <section className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                <div className="mb-6 flex rounded-xl bg-gray-100 p-1 w-full">
                  {[
                    { id: 'color', label: 'Flat Color' },
                    { id: 'gradient', label: 'Gradient' },
                    { id: 'image', label: 'Image' },
                    { id: 'video', label: 'Video' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setBgType(opt.id as any)}
                      className={`flex-1 cursor-pointer rounded-lg border-none py-2 text-xs font-bold transition-all ${
                        bgType === opt.id ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {bgType === 'color' && (
                  <div className="animate-in fade-in">
                    <label className="mb-3 block text-xs font-bold text-gray-700">Presets</label>
                    <div className="mb-6 grid grid-cols-5 gap-3 sm:grid-cols-9">
                      {bgColorPresets.map((c) => (
                        <button
                          key={c}
                          onClick={() => setBgColor(c)}
                          className={`aspect-square w-full rounded-xl border transition-all ${
                            bgColor === c ? 'border-gray-900 ring-4 ring-gray-900/10 scale-110' : 'border-gray-200 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    
                    <label className="mb-3 block text-xs font-bold text-gray-700">Custom Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-20 overflow-hidden rounded-xl border border-gray-200 shadow-sm cursor-pointer">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="absolute -inset-2 h-20 w-28 cursor-pointer border-none bg-transparent"
                        />
                      </div>
                      <div className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4">
                        <Hash size={16} className="text-gray-400" />
                        <span className="font-mono text-sm font-semibold text-gray-700 uppercase">{bgColor.replace('#', '')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {bgType === 'image' && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-12 transition-colors hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer animate-in fade-in">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100">
                      <Upload size={24} className="text-indigo-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Click to upload an image</p>
                    <p className="mt-1 text-xs font-medium text-gray-500">Supports JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                )}

                {(bgType === 'gradient' || bgType === 'video') && (
                  <div className="py-10 text-center animate-in fade-in">
                    <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-500 mb-3">
                      Pro Feature
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">Upgrade to unlock {bgType}s</h4>
                    <p className="mt-2 text-xs text-gray-500">Make your profile stand out with dynamic backgrounds.</p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Buttons Tab */}
          {activeTab === 'buttons' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <section className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                
                <div className="mb-8">
                  <label className="mb-4 block text-xs font-bold text-gray-900">Button Shape</label>
                  <div className="grid grid-cols-3 gap-4">
                    {buttonShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setBtnShape(shape.id)}
                        className={`flex flex-col items-center gap-3 rounded-2xl p-4 transition-all border-2 ${
                          btnShape === shape.id ? 'border-gray-900 bg-gray-50' : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className={`h-8 w-full bg-gray-800 ${shape.radius}`}></div>
                        <span className="text-[11px] font-bold text-gray-600">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-8 border-t border-gray-100 pt-8">
                  <label className="mb-4 block text-xs font-bold text-gray-900">Button Style</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {buttonStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setBtnStyle(style.id)}
                        className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-4 transition-all ${
                          btnStyle === style.id ? 'border-gray-900 bg-gray-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`h-10 w-full rounded-lg flex items-center justify-center text-xs font-bold ${style.class}`}>
                          Preview
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">{style.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-8">
                  <div>
                    <label className="mb-3 block text-xs font-bold text-gray-900">Button Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-gray-200 shadow-sm cursor-pointer shrink-0">
                        <input type="color" value={btnColor} onChange={(e) => setBtnColor(e.target.value)} className="absolute -inset-2 h-20 w-24 cursor-pointer border-none bg-transparent" />
                      </div>
                      <div className="flex h-12 flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 font-mono text-sm font-semibold uppercase text-gray-700">
                        {btnColor}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-3 block text-xs font-bold text-gray-900">Text Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-16 overflow-hidden rounded-xl border border-gray-200 shadow-sm cursor-pointer shrink-0">
                        <input type="color" value={btnFontColor} onChange={(e) => setBtnFontColor(e.target.value)} className="absolute -inset-2 h-20 w-24 cursor-pointer border-none bg-transparent" />
                      </div>
                      <div className="flex h-12 flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 font-mono text-sm font-semibold uppercase text-gray-700">
                        {btnFontColor}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-2 fade-in duration-300">
              <section className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-sm">
                
                <h3 className="mb-6 text-sm font-bold text-gray-900">Font Selection</h3>
                
                <div className="mb-8">
                  <label className="mb-2 block text-xs font-bold text-gray-700">Profile Font</label>
                  <div className="relative">
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="h-14 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 font-sans text-sm font-bold text-gray-900 shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer hover:border-gray-300"
                    >
                      {fonts.map((f) => (
                        <option key={f} value={f} className="font-sans font-medium">{f}</option>
                      ))}
                    </select>
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-gray-400">
                      <Settings2 size={16} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                   <h3 className="mb-6 text-sm font-bold text-gray-900">Text Colors</h3>
                   <div>
                    <label className="mb-3 block text-xs font-bold text-gray-700">Main Text Color</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-20 overflow-hidden rounded-xl border border-gray-200 shadow-sm cursor-pointer shrink-0">
                        <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="absolute -inset-2 h-20 w-28 cursor-pointer border-none bg-transparent" />
                      </div>
                      <div className="flex h-12 flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 font-mono text-sm font-semibold uppercase text-gray-700">
                        {fontColor}
                      </div>
                    </div>
                  </div>
                </div>

              </section>
            </div>
          )}

        </div>
      </div>

      {/* ─── Right Live Preview (Desktop) ─── */}
      <div className="hidden xl:flex w-[400px] shrink-0 border-l border-gray-100 bg-white flex-col items-center px-8 relative overflow-hidden h-full">
        {/* Decorative background blur for preview area like modern editors do */}
        <div className="absolute top-0 w-full h-40 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none"></div>

        <div className="mt-8 mb-4 flex items-center justify-between w-full">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Live Preview</span>
          <div className="flex gap-2">
             <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 cursor-pointer">
              <Monitor size={12} />
             </button>
             <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white shadow-sm cursor-pointer">
              <Phone size={12} />
             </button>
          </div>
        </div>
        
        <div className="w-full flex justify-center scale-[0.9] origin-top">
          <LivePreview username={profileTitle} displayName={profileBio} />
        </div>
      </div>

      {/* ─── Mobile Modal Preview ─── */}
      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-100/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 xl:hidden">
          <div className="flex items-center justify-between border-b border-gray-200 bg-white/50 px-4 py-4">
            <span className="text-sm font-bold text-gray-900">Live Preview</span>
            <button 
              onClick={() => setMobilePreviewOpen(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm text-gray-700 border border-gray-200 transition-colors hover:bg-gray-50"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto flex justify-center pt-8 pb-12">
            <LivePreview username={profileTitle} displayName={profileBio} />
          </div>
        </div>
      )}
    </div>
  )
}
