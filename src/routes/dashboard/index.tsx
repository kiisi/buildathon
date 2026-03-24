import { createFileRoute } from '@tanstack/react-router'
import LinkCard from '../../components/dashboard/LinkCard'
import LivePreview from '../../components/dashboard/LivePreview'
import {
  Sparkles,
  Settings,
  Plus,
  FolderOpen,
  Archive,
  ChevronRight,
  User,
  Instagram,
  MessageCircle,
  Youtube,
  Music,
  Ghost,
  Twitch,
  TreePine,
  Globe,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardLinksPage,
})

const socialLinks = [
  { title: 'Instagram', icon: <Instagram size={16} />, enabled: false, connectHint: 'Connect your Instagram' },
  { title: 'WhatsApp', icon: <MessageCircle size={16} />, enabled: false },
  { title: 'YouTube', icon: <Youtube size={16} />, enabled: false },
  { title: 'Spotify', icon: <Music size={16} />, enabled: true },
  { title: 'Snapchat', icon: <Ghost size={16} />, enabled: false },
  { title: 'Twitch', icon: <Twitch size={16} />, enabled: false },
]

function DashboardLinksPage() {
  return (
    <>
      <div className="flex-1 px-6 pt-6 pb-12 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Links</h1>
          <div className="flex items-center gap-2">
            <button className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 font-sans text-sm font-semibold text-gray-700 transition-all hover:border-gray-300">
              <Sparkles size={16} className="text-gray-500" />
              Enhance
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:border-gray-300">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Profile header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">devkiisi</h2>
            <p className="text-sm text-gray-400">Kiisi</p>
            <div className="mt-2 flex items-center gap-2">
              {[Globe, Instagram, Youtube, Twitch].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                >
                  <Icon size={14} />
                </button>
              ))}
              <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-gray-100 text-gray-400 hover:bg-gray-200">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User size={24} className="text-gray-400" />
          </div>
        </div>

        {/* Add button */}
        <button className="mb-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1069f9] font-sans text-sm font-bold text-white transition-all hover:bg-[#0b5ad4] active:scale-[0.985]">
          <Plus size={18} strokeWidth={2.5} />
          Add
        </button>

        {/* Collection row */}
        <div className="mb-6 flex items-center justify-between">
          <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            <FolderOpen size={14} />
            Add collection
          </button>
          <button className="flex cursor-pointer items-center gap-1 border-none bg-transparent font-sans text-xs font-semibold text-gray-500 hover:text-gray-700">
            <Archive size={14} />
            View archive
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Link cards */}
        <div className="flex flex-col gap-3">
          {socialLinks.map((link) => (
            <LinkCard
              key={link.title}
              title={link.title}
              url=""
              icon={link.icon}
              enabled={link.enabled}
              clicks={0}
              connectHint={link.connectHint}
            />
          ))}
        </div>

        {/* Linkgrove footer toggle */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">Linkgrove footer</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <TreePine size={14} className="text-[#1069f9]" />
              <span className="text-sm font-extrabold tracking-tight text-gray-900">
                Linkgrove
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-[#1069f9] text-white">
              <Plus size={12} />
            </button>
            <button className="relative h-6 w-11 cursor-pointer rounded-full border-none bg-[#22c55e] transition-colors">
              <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Live preview — hidden on tablet and below */}
      <div className="hidden border-l border-gray-100 bg-white p-6 pb-12 overflow-y-auto xl:block">
        <LivePreview username="devkiisi" displayName="Kiisi" />
      </div>
    </>
  )
}
