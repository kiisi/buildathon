import { createFileRoute, Outlet, useNavigate, useMatches } from '@tanstack/react-router'
import Sidebar from '../components/dashboard/Sidebar'
import TopBanner from '../components/dashboard/TopBanner'
import {
  TreePine,
  Sparkles,
  Music,
  User,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = useNavigate()
  const matches = useMatches()

  // Determine active nav from current route
  const currentPath = matches[matches.length - 1]?.fullPath || ''
  const activeNav = currentPath.includes('anonymous-messages')
    ? 'anonymous-message'
    : currentPath.includes('link-shortener')
      ? 'link-shortener'
      : currentPath.includes('qr-code')
        ? 'qr-code'
        : currentPath.includes('polls')
          ? 'polls'
          : currentPath.includes('insights')
            ? 'insights'
            : currentPath.includes('design')
              ? 'design'
              : 'links'

  function handleNavigate(id: string) {
    if (id === 'anonymous-message') {
      navigate({ to: '/dashboard/anonymous-messages' })
    } else if (id === 'link-shortener') {
      navigate({ to: '/dashboard/link-shortener' })
    } else if (id === 'qr-code') {
      navigate({ to: '/dashboard/qr-code' })
    } else if (id === 'polls') {
      navigate({ to: '/dashboard/polls' })
    } else if (id === 'insights') {
      navigate({ to: '/dashboard/insights' })
    } else if (id === 'design') {
      navigate({ to: '/dashboard/design' })
    } else if (id === 'links') {
      navigate({ to: '/dashboard' })
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50/60">
      {/* Top banner */}
      <TopBanner />

      {/* Main layout: sidebar + content */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar activeItem={activeNav} onNavigate={handleNavigate} />
        </div>

        {/* Content area */}
        <main className="flex min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="flex items-center justify-around border-t border-gray-200 bg-white py-2 lg:hidden">
        {[
          { icon: <TreePine size={20} />, label: 'Links' },
          { icon: <Sparkles size={20} />, label: 'Design' },
          { icon: <Music size={20} />, label: 'Earn' },
          { icon: <User size={20} />, label: 'Profile' },
        ].map((item) => (
          <button
            key={item.label}
            className="flex cursor-pointer flex-col items-center gap-0.5 border-none bg-transparent text-gray-400"
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
