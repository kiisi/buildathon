import { useState, useRef, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  ChevronDown, ChevronUp, Bell, Link2, QrCode, BarChart,
  LayoutDashboard, User, Zap, LogOut, Crown,
} from 'lucide-react'

const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { clearSession } = await import('../../lib/session')
  clearSession()
})

type NavItem = {
  id: string
  label: string
  icon?: React.ReactNode
  children?: { id: string; label: string }[]
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      {
        id: 'my-linkgrove',
        label: 'My Linkgrove',
        icon: <LayoutDashboard size={16} />,
        children: [
          { id: 'links', label: 'Links' },
          { id: 'design', label: 'Design' },
        ],
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      { id: 'link-shortener', label: 'Link shortener', icon: <Link2 size={16} /> },
      { id: 'qr-code', label: 'QR Code Generator', icon: <QrCode size={16} /> },
      { id: 'polls', label: 'Polls & Feedback', icon: <BarChart size={16} /> },
    ],
  },
]

interface SidebarProps {
  activeItem: string
  onNavigate: (id: string) => void
  username?: string
  email?: string
  plan?: 'free' | 'pro'
}

export default function Sidebar({
  activeItem, onNavigate, username = '', plan = 'free',
}: SidebarProps) {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ 'my-linkgrove': true })
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isPro = plan === 'pro'

  async function handleLogout() {
    await logoutFn()
    router.navigate({ to: '/auth/login' })
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsUserDropdownOpen(false)
    }
    if (isUserDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserDropdownOpen])

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* Top: user trigger + bell */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsUserDropdownOpen(v => !v)}
            className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-sans text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs">👤</div>
            <span className="max-w-[100px] truncate">{username || 'Account'}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {isUserDropdownOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              {/* Profile header */}
              <div className="flex items-start justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm">👤</div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900">{username || 'Account'}</p>
                    <p className="text-[12px] text-gray-400">linkgrove.ee/{username}</p>
                  </div>
                </div>
                {isPro ? (
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-1">
                    <Crown size={10} className="text-white" />
                    <span className="text-[11px] font-bold text-white">Pro</span>
                  </div>
                ) : (
                  <div className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500">Free</div>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex flex-col p-2">
                <button
                  onClick={() => { setIsUserDropdownOpen(false); onNavigate('account') }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50"
                >
                  <User size={18} className="text-gray-700" />
                  <span className="text-[14px] font-semibold text-gray-800">Account</span>
                </button>

                {isPro ? (
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <Crown size={18} className="text-violet-500" />
                    <div>
                      <p className="text-[14px] font-semibold text-violet-600">Pro member</p>
                      <p className="text-[11px] text-gray-400">All features unlocked</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => { setIsUserDropdownOpen(false); onNavigate('account') }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-violet-50"
                  >
                    <Zap size={18} className="text-violet-500" />
                    <span className="text-[14px] font-semibold text-violet-600">Upgrade to Pro</span>
                  </button>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-red-50"
                >
                  <LogOut size={18} className="text-red-500" />
                  <span className="text-[14px] font-semibold text-red-500">Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
        <button className="cursor-pointer border-none bg-transparent p-1 text-gray-400 hover:text-gray-600">
          <Bell size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && (
              <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">{section.title}</p>
            )}
            {section.items.map(item => (
              <div key={item.id}>
                <button
                  onClick={() => item.children ? setExpandedSections(p => ({ ...p, [item.id]: !p[item.id] })) : onNavigate(item.id)}
                  className={`mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-none px-2.5 py-2 text-left font-sans text-[13px] transition-colors ${
                    activeItem === item.id
                      ? 'bg-[#1069f9]/10 font-semibold text-[#1069f9]'
                      : 'bg-transparent font-medium text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="shrink-0 text-gray-400">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.children && (
                    <span className="text-gray-300">
                      {expandedSections[item.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  )}
                </button>
                {item.children && expandedSections[item.id] && (
                  <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        className={`w-full cursor-pointer rounded-md border-none px-2.5 py-1.5 text-left font-sans text-[13px] transition-colors ${
                          activeItem === child.id
                            ? 'bg-[#1069f9]/10 font-semibold text-[#1069f9]'
                            : 'bg-transparent font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom card */}
      <div className="mx-3 mb-4">
        {isPro ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3">
            <Crown size={16} className="shrink-0 text-white" />
            <div>
              <p className="text-xs font-bold text-white">Pro member</p>
              <p className="text-[11px] text-white/70">All features unlocked</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-white p-3.5">
            <p className="text-xs font-bold text-gray-900">Upgrade to Pro</p>
            <p className="mb-3 text-[11px] text-gray-400">Unlock all features and remove branding.</p>
            <button
              onClick={() => onNavigate('account')}
              className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 font-sans text-xs font-bold text-white transition-all hover:opacity-90"
            >
              <Zap size={12} /> Upgrade
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
