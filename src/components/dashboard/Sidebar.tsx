import { useState, useRef, useEffect } from 'react'
import { useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  ChevronDown,
  ChevronUp,
  Bell,
  Settings,
  Link2,
  Wallet,
  Users,
  BarChart3,
  EyeOff,
  HelpCircle,
  Flag,
  QrCode,
  BarChart,
  LayoutDashboard,
  Plus,
  User,
  Zap,
  FileText,
  Lightbulb,
  LogOut,
} from 'lucide-react'

const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { clearSession } = await import('../../lib/session')
  await clearSession()
})

type NavItem = {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string
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
          // { id: 'shop', label: 'Shop' },
        ],
      },
      // { id: 'earn', label: 'Earn', icon: <Wallet size={16} />, badge: '$0.00' },
      // { id: 'audience', label: 'Audience', icon: <Users size={16} /> },
      // { id: 'insights', label: 'Insights', icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: 'Tools',
    items: [
      // { id: 'anonymous-message', label: 'Anonymous Message', icon: <EyeOff size={16} /> },
      { id: 'link-shortener', label: 'Link shortener', icon: <Link2 size={16} /> },
      { id: 'qr-code', label: 'QR Code Generator', icon: <QrCode size={16} /> },
      { id: 'polls', label: 'Polls & Feedback', icon: <BarChart size={16} /> },
    ],
  },
]

interface SidebarProps {
  activeItem: string
  onNavigate: (id: string) => void
}

export default function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  const router = useRouter()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'my-linkgrove': true,
  })
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  async function handleLogout() {
    await logoutFn()
    router.navigate({ to: '/auth/login' })
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }
    if (isUserDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserDropdownOpen])

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-gray-100 bg-white">
      {/* User dropdown + notification */}
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-sans text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xs text-gray-500">👤</span>
            </div>
            devkiisi
            <ChevronDown size={14} className="text-gray-400 border-none" />
          </button>

          {/* Dropdown Menu */}
          {isUserDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 bg-white p-0 shadow-[0_4px_24px_rgba(0,0,0,0.06)] z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm text-gray-500">👤</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[15px] font-bold text-gray-900">devkiisi</span>
                    <span className="text-[13px] text-gray-400">linkgrove.ee/devkiisi</span>
                  </div>
                </div>
                <div className="rounded-full border border-gray-200 px-3 py-1 font-sans text-[11px] font-semibold text-gray-600 select-none">
                  Free
                </div>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Create new */}
              <div className="p-2">
                <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50">
                  <Plus size={18} className="text-gray-700" />
                  <span className="text-[14px] font-semibold text-gray-800">Create new Linkgrove</span>
                </button>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Account / Upgrade */}
              <div className="flex flex-col p-2">
                <button 
                  onClick={() => { setIsUserDropdownOpen(false); onNavigate('account'); }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50"
                >
                  <User size={18} className="text-gray-800" />
                  <span className="text-[14px] font-semibold text-gray-800">Account</span>
                </button>
                <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50">
                  <Zap size={18} className="text-gray-800" />
                  <span className="text-[14px] font-semibold text-gray-800">Upgrade</span>
                </button>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Help */}
              <div className="flex flex-col p-2">
                <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50">
                  <HelpCircle size={18} className="text-gray-800" />
                  <span className="text-[14px] font-semibold text-gray-800">Ask a question</span>
                </button>
                <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50">
                  <FileText size={18} className="text-gray-800" />
                  <span className="text-[14px] font-semibold text-gray-800">Help topics</span>
                </button>
                <button className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-sans transition-colors hover:bg-gray-50">
                  <Lightbulb size={18} className="text-gray-800" />
                  <span className="text-[14px] font-semibold text-gray-800">Share feedback</span>
                </button>
              </div>

              <div className="h-px w-full bg-gray-100" />

              {/* Log out */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.title && (
              <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
            )}
            {section.items.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => (item.children ? toggleSection(item.id) : onNavigate(item.id))}
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-none px-2.5 py-2 text-left font-sans text-[13px] mb-0.5 transition-colors ${activeItem === item.id
                    ? 'bg-[#1069f9]/10 font-semibold text-[#1069f9]'
                    : 'bg-transparent font-medium text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className="shrink-0 text-gray-400">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs text-gray-400">{item.badge}</span>
                  )}
                  {item.children && (
                    <span className="text-gray-300">
                      {expandedSections[item.id] ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </button>

                {/* Children */}
                {item.children && expandedSections[item.id] && (
                  <div className="ml-7 mt-0.5 flex flex-col gap-0.5">
                    {item.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => onNavigate(child.id)}
                        className={`w-full cursor-pointer rounded-md border-none px-2.5 py-1.5 text-left font-sans text-[13px] transition-colors ${activeItem === child.id
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

      {/* Setup checklist */}
      <div className="mx-3 mb-4 rounded-xl border border-gray-100 bg-white p-3.5">
        {/* Progress ring */}
        <div className="mb-2.5">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="#1069f9"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 16 * 0.33} ${2 * Math.PI * 16 * 0.67}`}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
            />
            <text x="20" y="21" textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-[#1069f9]">
              33%
            </text>
          </svg>
        </div>
        <p className="text-xs font-bold text-gray-900">Your setup checklist</p>
        <p className="mb-3 text-[11px] text-gray-400">2 of 6 complete</p>
        <button className="h-8 w-full cursor-pointer rounded-full bg-[#1069f9] font-sans text-xs font-bold text-white transition-colors hover:bg-[#0b5ad4]">
          Finish setup
        </button>
      </div>
    </aside>
  )
}
