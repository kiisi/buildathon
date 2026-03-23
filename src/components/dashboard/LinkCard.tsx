import {
  GripVertical,
  Pencil,
  Share2,
  QrCode,
  Link2,
  Image,
  Star,
  Copy,
  ExternalLink,
  BarChart3,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

interface LinkCardProps {
  title: string
  url: string
  icon: React.ReactNode
  enabled?: boolean
  clicks?: number
  connectHint?: string
}

export default function LinkCard({
  title,
  url,
  icon,
  enabled = false,
  clicks = 0,
  connectHint,
}: LinkCardProps) {
  const [isEnabled, setIsEnabled] = useState(enabled)

  return (
    <div
      className={`rounded-2xl border bg-white p-4 transition-shadow ${
        isEnabled ? 'border-[#1069f9]/30 shadow-sm' : 'border-gray-200'
      }`}
    >
      {/* Top row: drag, title, share, toggle */}
      <div className="mb-1 flex items-center gap-2">
        <button className="shrink-0 cursor-grab border-none bg-transparent p-0 text-gray-300 hover:text-gray-500">
          <GripVertical size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">{title}</span>
            <Pencil size={12} className="cursor-pointer text-gray-300 hover:text-gray-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">URL</span>
            <Pencil size={10} className="cursor-pointer text-gray-300 hover:text-gray-500" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="cursor-pointer border-none bg-transparent p-1 text-gray-300 hover:text-gray-500">
            <Share2 size={16} />
          </button>
          {/* Toggle */}
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors ${
              isEnabled ? 'bg-[#1069f9]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                isEnabled ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action icons row */}
      <div className="mt-3 flex items-center gap-1">
        <span className="mr-1 shrink-0 text-gray-400">{icon}</span>
        <ActionBtn icon={<Link2 size={14} />} />
        <ActionBtn icon={<Image size={14} />} />
        <ActionBtn icon={<Star size={14} />} />
        <ActionBtn icon={<Copy size={14} />} />
        <ActionBtn icon={<ExternalLink size={14} />} />
        <span className="ml-1 flex items-center gap-1 text-xs text-gray-400">
          <BarChart3 size={12} />
          {clicks} clicks
        </span>
        <button className="ml-auto cursor-pointer border-none bg-transparent p-1 text-gray-300 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Optional connect hint */}
      {connectHint && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            Looking for a more visual display?{' '}
            <a href="#" className="font-semibold text-gray-900 underline">
              {connectHint}
            </a>{' '}
            <span className="text-gray-300">ⓘ</span>
          </p>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="cursor-pointer rounded-md border-none bg-transparent p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500">
      {icon}
    </button>
  )
}
