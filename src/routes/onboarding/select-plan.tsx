import { createFileRoute } from '@tanstack/react-router'
import { TreePine, Check } from 'lucide-react'

export const Route = createFileRoute('/onboarding/select-plan')({
  component: SelectPlanPage,
})

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with your own personal LinkGrove',
    priceMonthly: '₦0',
    priceOriginal: '₦0',
    // billingNote: 'Billed annually, or ₦0 monthly',
    cta: 'Get started',
    ctaStyle: 'outlined' as const,
    highlighted: false,
    badge: null,
    features: [
      { category: 'Link in Bio', items: ['Personalized Linkgrove', 'Unlimited links', 'Multiple design styles', "Basic analytics (clicks only)",] },
      {
        category: 'Tools',
        items: ['Link shortener', 'QR Code Generator', 'Anonymous Message', 'Polls & Feedback'],
        badge: '0% fees'
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For creators and solopreneurs looking to grow and monetize',
    priceMonthly: '₦2000',
    priceOriginal: '',
    // billingNote: 'Billed annually, or ₦2000 monthly',
    cta: 'Try free for 7 days',
    ctaStyle: 'filled' as const,
    highlighted: true,
    badge: 'Recommended',
    features: [
      { category: 'Link in Bio', items: ['Remove Linkgrove logo', 'Customized appearance and layouts'] },
      { category: 'Grow your audience', items: ['Social media scheduling', 'Link shortener'], badge: 'New!' },
      { category: 'Audience CRM Tools', items: ['Automated Instagram DMs', 'Email integrations'], badge: 'New!' },
      { category: 'Make Money', items: ['Lower seller fees'], badge: '9% fees' },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'For businesses, brands, and teams wanting zero limits and fast results',
    priceMonthly: '₦5000',
    priceOriginal: '',
    // billingNote: 'Billed annually, or ₦5000 monthly',
    cta: 'Try free for 7 days',
    ctaStyle: 'filled' as const,
    highlighted: false,
    badge: null,
    features: [
      { category: 'Link in Bio', items: ['Comprehensive analytics'] },
      { category: 'Unlimited growth & CRM tools', items: ['Unlimited social posts', 'Unlimited Instagram DMs'], badge: 'New!' },
      { category: 'Make Money', items: ['No seller fees', 'Linkgrove affiliate shop'], badge: '0% fees' },
      { category: 'Priority Support', items: ['Concierge onboarding'] },
    ],
  },
]

function SelectPlanPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-white px-5 py-10">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-1.5 self-start">
        <TreePine size={24} strokeWidth={2.5} className="text-[#1069f9]" />
        <span className="text-lg font-extrabold tracking-tight text-gray-900">Linkgrove</span>
      </div>

      {/* Heading */}
      <h1 className="mb-2 text-center text-[2rem] font-extrabold tracking-tight text-gray-900 sm:text-[2.5rem]">
        Find the plan for you
      </h1>
      <p className="mb-10 text-center text-sm text-gray-400">You can cancel at any time.</p>

      {/* Plan cards */}
      <div className="mb-10 grid w-full max-w-[960px] gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border-[1.5px] p-6 ${plan.highlighted
              ? 'border-[#8b5cf6] shadow-lg shadow-purple-100'
              : 'border-gray-200'
              }`}
          >
            {/* Badge */}
            {plan.badge && (
              <span className="absolute -top-0 right-6 -translate-y-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                {plan.badge}
              </span>
            )}

            {/* Plan name & description */}
            <h2 className="mb-2 text-xl font-extrabold text-gray-900">{plan.name}</h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-500">{plan.description}</p>

            {/* Price */}
            <div className="mb-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{plan.priceMonthly}</span>
              <span className="text-sm text-gray-400">NGN/mo</span>
              <span className="text-sm text-gray-300 line-through">{plan.priceOriginal}</span>
            </div>
            <p className="mb-6 text-xs text-gray-400">
              {/* {plan.billingNote} */}
            </p>

            {/* CTA */}
            <button
              type="button"
              id={`plan-${plan.id}-btn`}
              className={`mb-6 h-[48px] w-full rounded-full font-sans text-sm font-bold transition-all active:scale-[0.985] ${plan.ctaStyle === 'filled'
                ? 'cursor-pointer bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                : 'cursor-pointer border-[1.5px] border-gray-200 bg-white text-gray-900 hover:border-gray-400'
                }`}
            >
              {plan.cta}
            </button>

            {/* Divider */}
            <div className="mb-5 h-px bg-gray-100" />

            {/* Prefix text */}
            <p className="mb-4 text-xs font-medium text-gray-500">
              {plan.id === 'free'
                ? ''
                : plan.id === 'pro'
                  ? 'Everything in Starter, plus:'
                  : 'Everything in Pro, plus:'}
            </p>

            {/* Features */}
            <div className="flex flex-col gap-4">
              {plan.features.map((group, gi) => (
                <div key={gi}>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900">
                    {group.category}
                    {group.badge && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-600">
                        {group.badge}
                      </span>
                    )}
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-2 text-sm text-gray-500">
                        <Check size={16} className="mt-0.5 shrink-0 text-[#8b5cf6]" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
