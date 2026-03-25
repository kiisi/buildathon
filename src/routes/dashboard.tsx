import { createFileRoute, Outlet, useNavigate, useMatches, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import Sidebar from '../components/dashboard/Sidebar'
import connectToDatabase from '../lib/db'
import UserModel from '../models/User'
import { TreePine, Sparkles, Link2, BarChart, User } from 'lucide-react'

const checkSessionFn = createServerFn().handler(async () => {
  const { getSession } = await import('../lib/session')
  return await getSession()
})

const getUserProfileFn = createServerFn().handler(async () => {
  const { getSession } = await import('../lib/session')
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const user = await UserModel.findById(session.userId).select('email username plan').lean() as any
  if (!user) throw new Error('User not found')
  return {
    email: user.email as string,
    username: (user.username ?? '') as string,
    plan: (user.plan ?? 'free') as 'free' | 'pro',
  }
})

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await checkSessionFn()
    if (!session) throw redirect({ to: '/auth/login' })
    return { userId: session.userId }
  },
  loader: async () => getUserProfileFn(),
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = useNavigate()
  const matches = useMatches()
  const { email, username, plan } = Route.useLoaderData()

  const currentPath = matches[matches.length - 1]?.fullPath || ''
  const activeNav = currentPath.includes('account') ? 'account'
    : currentPath.includes('link-shortener') ? 'link-shortener'
    : currentPath.includes('qr-code') ? 'qr-code'
    : currentPath.includes('polls') ? 'polls'
    : currentPath.includes('insights') ? 'insights'
    : currentPath.includes('design') ? 'design'
    : 'links'

  function handleNavigate(id: string) {
    const routes: Record<string, string> = {
      account: '/dashboard/account',
      'link-shortener': '/dashboard/link-shortener',
      'qr-code': '/dashboard/qr-code',
      polls: '/dashboard/polls',
      insights: '/dashboard/insights',
      design: '/dashboard/design',
      links: '/dashboard',
    }
    navigate({ to: (routes[id] ?? '/dashboard') as any })
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50/60">
      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <Sidebar activeItem={activeNav} onNavigate={handleNavigate} username={username} email={email} plan={plan} />
        </div>
        <main className="flex min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <div className="flex items-center justify-around border-t border-gray-200 bg-white py-2 lg:hidden pb-safe">
        {[
          { id: 'links', icon: <TreePine size={20} />, label: 'Links' },
          { id: 'design', icon: <Sparkles size={20} />, label: 'Design' },
          { id: 'link-shortener', icon: <Link2 size={20} />, label: 'Shorts' },
          { id: 'polls', icon: <BarChart size={20} />, label: 'Polls' },
          { id: 'account', icon: <User size={20} />, label: 'Account' },
        ].map((item) => (
          <button key={item.id} onClick={() => handleNavigate(item.id)}
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
