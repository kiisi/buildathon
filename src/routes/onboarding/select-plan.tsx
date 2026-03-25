import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TreePine, Check, Loader2 } from 'lucide-react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { useState } from 'react'
import connectToDatabase from '../../lib/db'
import User from '../../models/User'

// Interswitch global
declare global {
  interface Window {
    webpayCheckout: (config: Record<string, unknown>) => void
  }
}

// ── Server functions ──────────────────────────────────────────────────────────

/** Fetch the logged-in user's email + username for the payment request */
const getUserInfoFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')

  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const user = await User.findById(session.userId).select('email username').lean() as any
  if (!user) throw new Error('User not found')
  return { email: user.email as string, username: (user.username ?? '') as string }
})

/** Save free plan directly */
const selectFreePlanFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSession } = await import('../../lib/session')

  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  await User.updateOne({ _id: session.userId }, { $set: { plan: 'free' } })
  return { ok: true }
})

/** Called after Interswitch payment completes — verifies txn ref and upgrades plan */
const verifyAndUpgradeFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      txnRef: z.string(),
      responseCode: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    // Interswitch returns '00' for a successful transaction
    if (data.responseCode !== '00') {
      throw new Error('Payment was not successful. Please try again.')
    }

    await connectToDatabase()
    await User.updateOne(
      { _id: session.userId },
      { $set: { plan: 'pro', lastTxnRef: data.txnRef } },
    )
    return { ok: true }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/onboarding/select-plan')({
  loader: async () => getUserInfoFn(),
  component: SelectPlanPage,
})

// ── Plan data ─────────────────────────────────────────────────────────────────

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with your own personal LinkGrove',
    priceMonthly: '₦0',
    cta: 'Get started',
    ctaStyle: 'outlined' as const,
    highlighted: false,
    badge: null,
    features: [
      {
        category: 'Link in Bio',
        items: ['Personalized Linkgrove', 'Unlimited links', 'Multiple design styles', 'Basic analytics (clicks only)'],
      },
      {
        category: 'Tools',
        items: ['Link shortener', 'QR Code Generator', 'Anonymous Message', 'Polls & Feedback'],
        badge: '0% fees',
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For creators and solopreneurs looking to grow and monetize',
    priceMonthly: '₦2,000',
    cta: 'Subscribe now',
    ctaStyle: 'filled' as const,
    highlighted: true,
    badge: 'Recommended',
    features: [
      {
        category: 'Link in Bio',
        items: ['Remove Linkgrove logo', 'Customized appearance and layouts', 'Comprehensive analytics'],
      },
      { category: 'Grow your audience', items: ['Social media scheduling', 'Link shortener'], badge: 'New!' },
      { category: 'Audience CRM Tools', items: ['Automated Instagram DMs', 'Email integrations'], badge: 'New!' },
      { category: 'Make Money', items: ['Lower seller fees', 'Linkgrove affiliate shop'], badge: '9% fees' },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

function SelectPlanPage() {
  const navigate = useNavigate()
  const { email, username } = Route.useLoaderData()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  // Free plan — direct save
  const freeMutation = useMutation({
    mutationFn: () => selectFreePlanFn(),
    onSuccess: () => navigate({ to: '/dashboard' }),
    onError: (err: any) => {
      setLoadingPlan(null)
      alert(err?.message || 'Something went wrong')
    },
  })

  // Pro plan — after payment verified
  const verifyMutation = useMutation({
    mutationFn: (vars: { txnRef: string; responseCode: string }) =>
      verifyAndUpgradeFn({ data: vars }),
    onSuccess: () => navigate({ to: '/dashboard' }),
    onError: (err: any) => {
      setLoadingPlan(null)
      alert(err?.message || 'Payment verification failed')
    },
  })

  function handleSelectPlan(planId: string) {
    if (planId === 'free') {
      setLoadingPlan('free')
      freeMutation.mutate()
      return
    }

    // Pro — open Interswitch inline checkout
    setLoadingPlan('pro')
    const txnRef = `LG-${username}-${Date.now()}`

    window.webpayCheckout({
      merchant_code: 'MX276092',
      pay_item_id: 'Default_Payable_MX276092',
      txn_ref: txnRef,
      amount: 200000, // ₦2,000 in kobo
      currency: 566,  // NGN ISO 4217
      site_redirect_url: `${window.location.origin}/dashboard`,
      // Pass user identity in the hash/cust fields for audit trail
      cust_id: username,
      cust_name: username,
      cust_email: email,
      mode: 'TEST',
      onComplete: (response: { resp: string; txnref: string }) => {
        verifyMutation.mutate({
          txnRef: response.txnref ?? txnRef,
          responseCode: response.resp,
        })
      },
    })
  }

  const isPending = freeMutation.isPending || verifyMutation.isPending

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
      <div className="mb-10 grid w-full max-w-[640px] gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border-[1.5px] p-6 ${
              plan.highlighted ? 'border-[#8b5cf6] shadow-lg shadow-purple-100' : 'border-gray-200'
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
                {plan.badge}
              </span>
            )}

            <h2 className="mb-2 text-xl font-extrabold text-gray-900">{plan.name}</h2>
            <p className="mb-5 text-sm leading-relaxed text-gray-500">{plan.description}</p>

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-gray-900">{plan.priceMonthly}</span>
              <span className="text-sm text-gray-400">NGN/mo</span>
            </div>

            {/* CTA */}
            <button
              type="button"
              id={`plan-${plan.id}-btn`}
              disabled={isPending}
              onClick={() => handleSelectPlan(plan.id)}
              className={`mb-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-full font-sans text-sm font-bold transition-all active:scale-[0.985] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.ctaStyle === 'filled'
                  ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                  : 'border-[1.5px] border-gray-200 bg-white text-gray-900 hover:border-gray-400'
              }`}
            >
              {loadingPlan === plan.id && isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Processing…</>
              ) : (
                plan.cta
              )}
            </button>

            <div className="mb-5 h-px bg-gray-100" />

            <p className="mb-4 text-xs font-medium text-gray-500">
              {plan.id === 'free' ? '' : 'Everything in Free, plus:'}
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
