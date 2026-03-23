import { TreePine, Share2, Settings, User } from 'lucide-react'

interface LivePreviewProps {
  username: string
  displayName: string
}

export default function LivePreview({ username, displayName }: LivePreviewProps) {
  return (
    <div className="w-[260px] shrink-0">
      {/* URL bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 items-center justify-center rounded-full bg-gray-100 px-4 py-2">
          <span className="text-xs font-medium text-gray-600">linkgrove.ee/{username}</span>
        </div>
        <button className="cursor-pointer rounded-full border-none bg-transparent p-1.5 text-gray-400 hover:text-gray-600">
          <Share2 size={16} />
        </button>
        <button className="cursor-pointer rounded-full border-none bg-transparent p-1.5 text-gray-400 hover:text-gray-600">
          <Settings size={16} />
        </button>
      </div>

      {/* Phone preview card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Blue accent top line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#1069f9] to-[#3b82f6]" />

        {/* Dark dot */}
        <div className="flex justify-end px-3 pt-3">
          <div className="h-2 w-2 rounded-full bg-gray-800" />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center px-4 pb-6 pt-4">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <User size={28} className="text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-900">{username}</p>
          <p className="text-xs text-gray-400">{displayName}</p>
        </div>

        {/* Empty state - placeholder links for when links are added */}
        <div className="space-y-2 px-4 pb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 w-full rounded-lg bg-gray-50" />
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-4 text-center">
          <button className="mb-2 cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-1.5 font-sans text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Join {username} on Linkgrove
          </button>
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <a href="#" className="hover:underline">
              Report
            </a>
            <span>·</span>
            <a href="#" className="hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
