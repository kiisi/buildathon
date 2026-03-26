import { Share2, Settings, User } from 'lucide-react'

export interface DesignSettings {
  profileLayout: 'classic' | 'hero'
  bgColor: string
  btnShape: 'rect' | 'soft' | 'pill'
  btnStyle: 'solid' | 'outline' | 'shadow'
  btnColor: string
  btnFontColor: string
  fontColor: string
  fontFamily: string
  profileImage?: string
}

interface LivePreviewProps {
  username: string      // displayed name under avatar
  displayName: string   // bio line
  slug?: string         // URL slug (linkgrove.ee/slug) — falls back to username
  showFooter?: boolean
  links?: { id: string; title: string; url: string; enabled: boolean }[]
  design?: Partial<DesignSettings>
}

const btnRadiusMap = { rect: '0px', soft: '10px', pill: '9999px' }

export default function LivePreview({ username, displayName, slug, showFooter = true, links = [], design = {} }: LivePreviewProps) {
  const activeLinks = links.filter(l => l.enabled && l.title)
  const urlSlug = slug || username

  const {
    profileLayout = 'classic',
    bgColor = '#ffffff',
    btnShape = 'pill',
    btnStyle = 'solid',
    btnColor = '#f1f5f9',
    btnFontColor = '#0f172a',
    fontColor = '#0f172a',
    fontFamily = 'inherit',
    profileImage = '',
  } = design

  const btnRadius = btnRadiusMap[btnShape]

  function getBtnStyle(): React.CSSProperties {
    const base: React.CSSProperties = {
      borderRadius: btnRadius,
      color: btnFontColor,
      fontFamily,
    }
    if (btnStyle === 'solid') return { ...base, backgroundColor: btnColor, border: 'none' }
    if (btnStyle === 'outline') return { ...base, backgroundColor: 'transparent', border: `2px solid ${btnColor}` }
    if (btnStyle === 'shadow') return { ...base, backgroundColor: btnColor, border: `2px solid ${fontColor}`, boxShadow: `3px 3px 0 0 ${fontColor}` }
    return base
  }

  const isHero = profileLayout === 'hero'

  return (
    <div className="w-[260px] shrink-0">
      {/* URL bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 items-center justify-center rounded-full bg-gray-100 px-4 py-2">
          <span className="text-xs font-medium text-gray-600">linkgrove.ee/{urlSlug}</span>
        </div>
        <button className="cursor-pointer rounded-full border-none bg-transparent p-1.5 text-gray-400 hover:text-gray-600">
          <Share2 size={16} />
        </button>
        <button className="cursor-pointer rounded-full border-none bg-transparent p-1.5 text-gray-400 hover:text-gray-600">
          <Settings size={16} />
        </button>
      </div>

      {/* Phone frame */}
      <div className="overflow-hidden rounded-2xl border border-gray-200" style={{ backgroundColor: bgColor, fontFamily }}>
        {/* Notch */}
        <div className="flex justify-end px-3 pt-3">
          <div className="h-2 w-2 rounded-full bg-gray-400 opacity-40" />
        </div>

        {/* Profile section */}
        {isHero ? (
          <div className="flex items-center gap-3 px-4 pb-4 pt-2">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-200">
              {profileImage
                ? <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                : <User size={22} className="text-gray-400" />}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: fontColor }}>{username || 'Your name'}</p>
              <p className="text-[11px] opacity-60" style={{ color: fontColor }}>{displayName || 'Your bio'}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 pb-4 pt-4">
            <div className="mb-2.5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-200">
              {profileImage
                ? <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                : <User size={22} className="text-gray-400" />}
            </div>
            <p className="text-sm font-bold" style={{ color: fontColor }}>{username || 'Your name'}</p>
            <p className="mt-0.5 text-[11px] opacity-60" style={{ color: fontColor }}>{displayName || 'Your bio'}</p>
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col gap-2 px-4 pb-6 min-h-[120px]">
          {activeLinks.length > 0 ? (
            activeLinks.map(link => (
              <div
                key={link.id}
                className="flex min-h-[40px] w-full items-center justify-center px-3 py-2 text-center text-[12px] font-bold transition-opacity hover:opacity-80"
                style={getBtnStyle()}
              >
                <span className="line-clamp-1">{link.title}</span>
              </div>
            ))
          ) : (
            [1, 2, 3].map(i => (
              <div
                key={i}
                className="h-10 w-full animate-pulse opacity-40"
                style={{ ...getBtnStyle(), minHeight: '40px' }}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="border-t border-gray-100/30 px-4 py-3 text-center">
            <p className="text-[10px] opacity-40" style={{ color: fontColor }}>
              linkgrove.ee
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
