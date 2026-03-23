import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TreePine, Star } from 'lucide-react'

export const Route = createFileRoute('/onboarding/pro-trial')({
  component: ProTrialPage,
})

const timeline = [
  {
    icon: 'star',
    color: 'bg-[#8b5cf6]',
    title: 'Today',
    description: (
      <>
        Get started with the world's most trusted link in bio,{' '}
        <a href="#" className="underline">
          cancel any time
        </a>
        .
      </>
    ),
  },
  {
    icon: 'bell',
    color: 'bg-gray-700',
    title: 'In 5 days',
    description: "We'll send you a reminder email that your trial is ending soon.",
  },
  {
    icon: 'lock',
    color: 'bg-gray-700',
    title: 'In 7 days',
    description: (
      <>
        Your plan starts on Mar 29, 2026, unless you cancelled
        <br className="hidden sm:block" />
        during the trial.
      </>
    ),
  },
]

function ProTrialPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[#fafafa] px-5 py-10">
      {/* Skip */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          navigate({ to: '/onboarding/select-plan' })
        }}
        className="mb-8 self-end text-sm font-medium text-gray-400 hover:text-gray-600 hover:underline"
        id="skip-trial-btn"
      >
        Skip
      </a>

      {/* Logo */}
      <div className="mb-6 flex items-center gap-1.5">
        <TreePine size={22} strokeWidth={2.5} className="text-[#1069f9]" />
        <span className="text-base font-extrabold tracking-tight text-gray-900">
          Linkgrove
        </span>
        <span className="ml-0.5 text-base font-medium text-gray-500">Pro</span>
      </div>

      {/* Heading */}
      <h1 className="mb-2 text-center text-[2.25rem] font-extrabold leading-tight tracking-tight text-gray-900 sm:text-[2.75rem]">
        Claim a free
        <br />
        7-day Pro trial
      </h1>
      <p className="mb-10 text-center text-sm text-gray-400">
        Start with the full power of Linkgrove!
      </p>

      {/* Timeline */}
      <div className="relative mb-10 w-full max-w-[520px]">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Vertical line */}
            {idx < timeline.length - 1 && (
              <div className="absolute left-[17px] top-[38px] h-[calc(100%-30px)] w-[2px] bg-gray-200" />
            )}

            {/* Icon circle */}
            <div
              className={`relative z-10 flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full ${item.color}`}
            >
              {item.icon === 'star' ? (
                <Star size={16} className="text-white" fill="white" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="pt-1">
              <h3 className="mb-1 text-sm font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stars + trust */}
      <div className="mb-10 flex flex-col items-center gap-1.5">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={22}
              className="text-yellow-400"
              fill="#facc15"
              strokeWidth={0}
            />
          ))}
        </div>
        <p className="text-sm font-medium text-gray-500">Trusted by 70M+ creators</p>
      </div>

      {/* CTA */}
      <button
        type="button"
        id="start-trial-btn"
        onClick={() => navigate({ to: '/onboarding/select-plan' })}
        className="h-[56px] w-full max-w-[520px] cursor-pointer rounded-full bg-[#8b5cf6] font-sans text-base font-bold text-white transition-all hover:bg-[#7c3aed] active:scale-[0.985]"
      >
        Continue with free trial
      </button>

      {/* Cookie footer */}
      <p className="mt-auto pt-8 self-start text-xs text-gray-400 cursor-pointer hover:underline">
        Cookie Preferences
      </p>
    </div>
  )
}
