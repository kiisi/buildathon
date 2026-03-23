import { TreePine, Zap } from 'lucide-react'

export default function TopBanner() {
  return (
    <div className="flex h-10 w-full items-center justify-center gap-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-4">
      <TreePine size={16} className="text-[#22c55e]" />
      <p className="text-center text-[13px] text-gray-300">
        <span className="font-semibold text-white">Try Pro for free</span> — our most popular plan
        for content creators and businesses.
      </p>
      <button className="flex cursor-pointer items-center gap-1 rounded-full border border-[#22c55e] bg-transparent px-3 py-0.5 font-sans text-xs font-semibold text-[#22c55e] transition-colors hover:bg-[#22c55e]/10">
        <Zap size={12} />
        Upgrade
      </button>
    </div>
  )
}
