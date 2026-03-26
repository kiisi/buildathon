import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { TreePine, ExternalLink, Share2 } from 'lucide-react'
import connectToDatabase from '../lib/db'
import UserModel from '../models/User'
import LinkModel from '../models/Link'
import DesignModel from '../models/Design'

// ── Types ─────────────────────────────────────────────────────────────────────

type PublicLink = { id: string; title: string; url: string }

type ProfileData = {
  username: string
  firstName: string
  lastName: string
  profileTitle: string
  profileBio: string
  profileImage: string
  profileLayout: 'classic' | 'hero'
  bgColor: string
  btnShape: 'rect' | 'soft' | 'pill'
  btnStyle: 'solid' | 'outline' | 'shadow'
  btnColor: string
  btnFontColor: string
  fontColor: string
  fontFamily: string
  links: PublicLink[]
}

// ── Server function ───────────────────────────────────────────────────────────

const getProfileFn = createServerFn()
  .inputValidator((d: { username: string }) => d)
  .handler(async ({ data }) => {
    await connectToDatabase()
    const user = await UserModel.findOne({ username: data.username })
      .select('username firstName lastName').lean() as any
    if (!user) return null

    const [design, links] = await Promise.all([
      DesignModel.findOne({ userId: user._id }).lean() as any,
      LinkModel.find({ userId: user._id, enabled: true }).sort({ order: 1 }).lean(),
    ])

    return {
      username: user.username as string,
      firstName: (user.firstName ?? '') as string,
      lastName: (user.lastName ?? '') as string,
      profileTitle: (design?.profileTitle ?? '') as string,
      profileBio: (design?.profileBio ?? '') as string,
      profileImage: (design?.profileImage ?? '') as string,
      profileLayout: (design?.profileLayout ?? 'classic') as 'classic' | 'hero',
      bgColor: (design?.bgColor ?? '#ffffff') as string,
      btnShape: (design?.btnShape ?? 'pill') as 'rect' | 'soft' | 'pill',
      btnStyle: (design?.btnStyle ?? 'solid') as 'solid' | 'outline' | 'shadow',
      btnColor: (design?.btnColor ?? '#f1f5f9') as string,
      btnFontColor: (design?.btnFontColor ?? '#0f172a') as string,
      fontColor: (design?.fontColor ?? '#0f172a') as string,
      fontFamily: (design?.fontFamily ?? 'inherit') as string,
      links: links.map((l: any) => ({
        id: String(l._id),
        title: l.title,
        url: l.url,
      })),
    } as ProfileData
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/$username')({
  loader: async ({ params }) => {
    const profile = await getProfileFn({ data: { username: params.username } })
    return { profile }
  },
  component: PublicProfilePage,
})

// ── Button style helper ───────────────────────────────────────────────────────

const btnRadiusMap = { rect: '0px', soft: '12px', pill: '9999px' }

function getBtnStyle(p: ProfileData): React.CSSProperties {
  const radius = btnRadiusMap[p.btnShape]
  const base: React.CSSProperties = { borderRadius: radius, color: p.btnFontColor, fontFamily: p.fontFamily }
  if (p.btnStyle === 'solid') return { ...base, backgroundColor: p.btnColor, border: 'none' }
  if (p.btnStyle === 'outline') return { ...base, backgroundColor: 'transparent', border: `2px solid ${p.btnColor}` }
  return { ...base, backgroundColor: p.btnColor, border: `2px solid ${p.fontColor}`, boxShadow: `3px 3px 0 0 ${p.fontColor}` }
}

// ── Component ─────────────────────────────────────────────────────────────────

function PublicProfilePage() {
  const { profile } = Route.useLoaderData()

  if (!profile) return <NotFoundPage />

  const displayName = profile.profileTitle || `${profile.firstName} ${profile.lastName}`.trim() || profile.username
  const btnStyle = getBtnStyle(profile)
  const isHero = profile.profileLayout === 'hero'

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: displayName, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div
      className="min-h-dvh w-full"
      style={{ backgroundColor: profile.bgColor, fontFamily: profile.fontFamily }}
    >
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 py-10">

        {/* Profile section */}
        {isHero ? (
          <div className="mb-8 flex items-center gap-4">
            <Avatar profile={profile} size="lg" shape="rounded" />
            <div>
              <h1 className="text-xl font-extrabold leading-tight" style={{ color: profile.fontColor }}>
                {displayName}
              </h1>
              {profile.profileBio && (
                <p className="mt-1 text-sm opacity-60" style={{ color: profile.fontColor }}>{profile.profileBio}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-col items-center text-center">
            <Avatar profile={profile} size="xl" shape="circle" />
            <h1 className="mt-4 text-xl font-extrabold" style={{ color: profile.fontColor }}>{displayName}</h1>
            {profile.profileBio && (
              <p className="mt-1.5 max-w-xs text-sm opacity-60" style={{ color: profile.fontColor }}>{profile.profileBio}</p>
            )}
          </div>
        )}

        {/* Links */}
        <div className="flex flex-col gap-3">
          {profile.links.length > 0 ? (
            profile.links.map(link => (
              <a
                key={link.id}
                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] w-full items-center justify-center px-5 py-3 text-center text-[15px] font-bold transition-opacity hover:opacity-80 active:scale-[0.98]"
                style={btnStyle}
                onClick={() => {
                  // Fire click tracking (fire-and-forget)
                  fetch(`/api/links/${link.id}/click`, { method: 'POST' }).catch(() => {})
                }}
              >
                {link.title}
                <ExternalLink size={13} className="ml-2 opacity-40 shrink-0" />
              </a>
            ))
          ) : (
            <p className="text-center text-sm opacity-40" style={{ color: profile.fontColor }}>
              No links yet.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12 flex flex-col items-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ borderColor: `${profile.fontColor}30`, color: profile.fontColor }}
          >
            <Share2 size={13} /> Share this page
          </button>

          <Link to="/" className="flex items-center gap-1.5 opacity-40 hover:opacity-70 transition-opacity">
            <TreePine size={14} style={{ color: profile.fontColor }} />
            <span className="text-xs font-bold" style={{ color: profile.fontColor }}>Linkgrove</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Avatar sub-component ──────────────────────────────────────────────────────

function Avatar({ profile, size, shape }: {
  profile: ProfileData
  size: 'lg' | 'xl'
  shape: 'circle' | 'rounded'
}) {
  const dim = size === 'xl' ? 'h-24 w-24' : 'h-16 w-16'
  const radius = shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
  const initials = (profile.firstName?.[0] ?? profile.username?.[0] ?? '?').toUpperCase()

  if (profile.profileImage) {
    return (
      <img
        src={profile.profileImage}
        alt={profile.username}
        className={`${dim} ${radius} object-cover`}
      />
    )
  }

  return (
    <div
      className={`${dim} ${radius} flex items-center justify-center text-2xl font-extrabold`}
      style={{ backgroundColor: `${profile.fontColor}15`, color: profile.fontColor }}
    >
      {initials}
    </div>
  )
}

// ── 404 ───────────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-5 text-center">
      <TreePine size={40} className="text-[#1069f9]" />
      <h1 className="text-2xl font-extrabold text-gray-900">Page not found</h1>
      <p className="text-sm text-gray-400">This Linkgrove doesn't exist or has been removed.</p>
      <Link to="/" className="mt-2 rounded-full bg-[#1069f9] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0558e0]">
        Go to Linkgrove
      </Link>
    </div>
  )
}
