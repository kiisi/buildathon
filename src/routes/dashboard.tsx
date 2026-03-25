import { createFileRoute, Outlet, useNavigate, useMatches, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import Sidebar from '../components/dashboard/Sidebar'
import { getSession } from '../lib/session'
import {
  TreePine,
  Sparkles,
  Link2,
  BarChart,
  User,
} from 'lucide-react'

const getSessionFn = createServerFn().handler(async () => {
  const session = await getSession()
  return session
})

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session) {
      throw redirect({ to: '/auth/login' })
    }
    return { userId: session.userId }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = useNavigate()
  const matches = useMatches()

  // Determine active nav from current route
  const currentPath = matches[matches.length - 1]?.fullPath || ''
  const activeNav = currentPath.includes('account')
    ? 'account'
    : currentPath.includes('anonymous-messages')
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
    if (id === 'account') {
      navigate({ to: '/dashboard/account' })
    } else if (id === 'anonymous-message') {
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
      <div className="flex items-center justify-around border-t border-gray-200 bg-white py-2 lg:hidden pb-safe">
        {[
          { id: 'links', icon: <TreePine size={20} />, label: 'Links' },
          { id: 'design', icon: <Sparkles size={20} />, label: 'Design' },
          { id: 'link-shortener', icon: <Link2 size={20} />, label: 'Shorts' },
          { id: 'polls', icon: <BarChart size={20} />, label: 'Polls' },
          { id: 'account', icon: <User size={20} />, label: 'Account' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigate(item.id)}
            className={`flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent transition-colors ${
              activeNav === item.id ? 'text-[#1069f9]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {item.icon}
            <span className={`text-[10px] ${activeNav === item.id ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
