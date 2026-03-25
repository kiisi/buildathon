import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import {
  Shield, Zap, Crown, Check, Loader2,
  RotateCcw, XCircle, Receipt,
} from 'lucide-react'
import connectToDatabase from '../../lib/db'
import UserModel from '../../models/User'
import PaymentHistoryModel from '../../models/PaymentHistory'

// ── Interswitch global ────────────────────────────────────────────────────────
declare global {
  interface Window {
    webpayCheckout: (config: Record<string, unknown>) => void
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
type PaymentRecord = {
  id: string
  txnRef: string
  amount: number
  status: 'success' | 'failed' | 'pending'
  period: string
  createdAt: string
}

type AccountData = {
  email: string
  username: string
  plan: 'free' | 'pro'
  planRenewsAt: string | null
  payments: PaymentRecord[]
}

// ── Server functions ──────────────────────────────────────────────────────────

const getAccountDataFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()

  const user = await UserModel.findById(session.userId)
    .select('email username plan planRenewsAt').lean() as any
  if (!user) throw new Error('User not found')

  const payments = await PaymentHistoryModel
    .find({ userId: session.userId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean()

  return {
    email: user.email as string,
    username: (user.username ?? '') as string,
    plan: (user.plan ?? 'free') as 'free' | 'pro',
    planRenewsAt: user.planRenewsAt
      ? new Date(user.planRenewsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null,
    payments: payments.map((p: any) => ({
      id: String(p._id),
      txnRef: p.txnRef,
      amount: p.amount,
      status: p.status as 'success' | 'failed' | 'pending',
      period: p.period,
      createdAt: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })),
  } as AccountData
})

const verifyPaymentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ txnRef: z.string(), responseCode: z.string() }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')

    if (data.responseCode !== '00') throw new Error('Payment was not successful. Please try again.')

    await connectToDatabase()

    // Set renewal date 30 days from now
    const renewsAt = new Date()
    renewsAt.setDate(renewsAt.getDate() + 30)

    await UserModel.updateOne(
      { _id: session.userId },
      { $set: { plan: 'pro', lastTxnRef: data.txnRef, planRenewsAt: renewsAt } },
    )

    // Record payment
    await PaymentHistoryModel.create({
      userId: session.userId,
      txnRef: data.txnRef,
      amount: 200000,
      status: 'success',
      plan: 'pro',
      period: 'monthly',
    })

    return { ok: true }
  })

const cancelPlanFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSession } = await import('../../lib/session')
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  await UserModel.updateOne({ _id: session.userId }, { $set: { plan: 'free', planRenewsAt: null } })
  return { ok: true }
})

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/account')({
  loader: async () => getAccountDataFn(),
  component: AccountPage,
})

// ── Pro features list ─────────────────────────────────────────────────────────

const proFeatures = [
  'Remove Linkgrove branding',
  'Customized appearance & layouts',
  'Comprehensive analytics',
  'Social media scheduling',
  'Automated Instagram DMs',
  'Email integrations',
  'Lower seller fees (9%)',
  'Linkgrove affiliate shop',
]

// ── Component ─────────────────────────────────────────────────────────────────

function AccountPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [account, setAccount] = useState<AccountData>(data)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const isPro = account.plan === 'pro'

  const verifyMutation = useMutation({
    mutationFn: (vars: { txnRef: string; responseCode: string }) =>
      verifyPaymentFn({ data: vars }),
    onSuccess: async () => {
      const fresh = await getAccountDataFn()
      setAccount(fresh)
      setLoadingPayment(false)
      // Re-run dashboard layout loader so Sidebar gets updated plan
      await router.invalidate()
    },
    onError: (err: any) => {
      setLoadingPayment(false)
      alert(err?.message || 'Payment verification failed')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelPlanFn(),
    onSuccess: async () => {
      const fresh = await getAccountDataFn()
      setAccount(fresh)
      setShowCancelConfirm(false)
      // Re-run dashboard layout loader so Sidebar reflects free plan
      await router.invalidate()
    },
    onError: (err: any) => alert(err?.message || 'Failed to cancel plan'),
  })

  // ── Interswitch checkout ───────────────────────────────────────────────────

  function handleUpgrade() {
    setLoadingPayment(true)
    const txnRef = `LG-${account.username}-${Date.now()}`

    window.webpayCheckout({
      merchant_code: 'MX276092',
      pay_item_id: 'Default_Payable_MX276092',
      txn_ref: txnRef,
      amount: 200000, // ₦2,000 in kobo
      currency: 566,
      site_redirect_url: `${window.location.origin}/dashboard/account`,
      cust_id: account.username,
      cust_name: account.username,
      cust_email: account.email,
      mode: 'TEST',
      onComplete: (response: { resp: string; txnref: string }) => {
        verifyMutation.mutate({
          txnRef: response.txnref ?? txnRef,
          responseCode: response.resp,
        })
      },
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto bg-white/50">
      <div className="mx-auto w-full max-w-[800px] px-4 pb-20 pt-6 sm:px-10 lg:px-12">
        <h1 className="mb-10 text-[24px] font-extrabold tracking-tight text-gray-900">Account</h1>

        <div className="flex flex-col gap-10">

          {/* ── My information ── */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">My information</h2>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3">
                <div className="flex flex-col rounded-lg bg-[#F5F6F8] px-4 py-2 focus-within:ring-2 focus-within:ring-black/5">
                  <label className="text-[12px] font-medium text-gray-500">Username</label>
                  <input type="text" defaultValue={account.username} readOnly
                    className="bg-transparent text-[15px] font-medium text-gray-900 outline-none" />
                </div>
                <div className="flex flex-col rounded-lg bg-[#F5F6F8] px-4 py-2 focus-within:ring-2 focus-within:ring-black/5">
                  <label className="text-[12px] font-medium text-gray-500">Email</label>
                  <input type="email" defaultValue={account.email} readOnly
                    className="bg-transparent text-[15px] font-medium text-gray-900 outline-none" />
                </div>
              </div>
            </div>
          </section>

          {/* ── Billing & Plan ── */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">Billing & Plan</h2>

            {isPro ? (
              /* ── Pro plan card ── */
              <div className="overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Crown size={22} className="text-white" />
                    <div>
                      <p className="text-base font-extrabold text-white">Pro Plan</p>
                      <p className="text-sm text-white/70">₦2,000 / month</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">Active</span>
                </div>

                <div className="p-6">
                  {account.planRenewsAt && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-3">
                      <RotateCcw size={14} className="text-violet-500" />
                      <p className="text-sm text-violet-700">
                        Renews on <span className="font-semibold">{account.planRenewsAt}</span>
                      </p>
                    </div>
                  )}

                  {/* Pro features */}
                  <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {proFeatures.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={14} className="shrink-0 text-violet-500" />
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Renew now + cancel */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={handleUpgrade}
                      disabled={loadingPayment || verifyMutation.isPending}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingPayment || verifyMutation.isPending
                        ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
                        : <><RotateCcw size={15} /> Renew now</>}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <XCircle size={15} /> Cancel plan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Free plan + upgrade card ── */
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-base font-bold text-gray-900">Free Plan</p>
                      <p className="text-sm text-gray-400">₦0 / month</p>
                    </div>
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500">Current</span>
                  </div>
                </div>

                {/* Upgrade section */}
                <div className="p-6">
                  <div className="mb-5 flex items-start gap-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-4">
                    <Crown size={20} className="mt-0.5 shrink-0 text-violet-500" />
                    <div>
                      <p className="mb-1 text-sm font-bold text-gray-900">Upgrade to Pro — ₦2,000/month</p>
                      <p className="text-xs text-gray-500">Unlock all features, remove branding, and grow faster.</p>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {proFeatures.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={14} className="shrink-0 text-violet-500" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleUpgrade}
                    disabled={loadingPayment || verifyMutation.isPending}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingPayment || verifyMutation.isPending
                      ? <><Loader2 size={15} className="animate-spin" /> Processing…</>
                      : <><Zap size={15} /> Upgrade to Pro — ₦2,000/mo</>}
                  </button>
                  <p className="mt-2 text-center text-xs text-gray-400">Billed monthly · Cancel anytime</p>
                </div>
              </div>
            )}
          </section>

          {/* ── Payment History ── */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">Payment History</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {account.payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Receipt size={32} className="mb-3 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-500">No payments yet</p>
                  <p className="text-xs text-gray-400">Your billing history will appear here</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Plan</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Amount</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.payments.map((p, i) => (
                      <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{p.createdAt}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Crown size={12} className="text-violet-500" />
                            <span className="text-sm font-semibold capitalize text-gray-800">Pro · {p.period}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-900">
                          ₦{(p.amount / 100).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            p.status === 'success' ? 'bg-emerald-50 text-emerald-600'
                            : p.status === 'failed' ? 'bg-red-50 text-red-500'
                            : 'bg-amber-50 text-amber-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              p.status === 'success' ? 'bg-emerald-500'
                              : p.status === 'failed' ? 'bg-red-500'
                              : 'bg-amber-500'
                            }`} />
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-[11px] text-gray-400">{p.txnRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* ── Privacy ── */}
          <section>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-base font-bold text-gray-900">Privacy Settings</h2>
              <p className="mb-6 text-sm text-gray-600">
                Stop sharing your data with third parties. Learn more in our{' '}
                <a href="#" className="font-medium text-gray-900 underline">privacy notice</a>.
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-[#7c3aed]">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="mb-0.5 text-sm font-bold text-gray-900">Allow data sharing</h3>
                    <p className="text-xs font-semibold text-emerald-600">Enabled</p>
                  </div>
                </div>
                <button className="cursor-pointer rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50">
                  Disable
                </button>
              </div>
            </div>
          </section>

          {/* ── Account management ── */}
          <section>
            <h2 className="mb-4 text-base font-bold text-gray-900">Account management</h2>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-900">Delete account</h3>
              <p className="mb-6 text-sm text-gray-600">Permanently delete your account and all data.</p>
              <button className="cursor-pointer rounded-full border-none bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600">
                Delete Account
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* ── Cancel confirmation modal ── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle size={22} className="text-red-500" />
            </div>
            <h3 className="mb-2 text-base font-bold text-gray-900">Cancel Pro plan?</h3>
            <p className="mb-6 text-sm text-gray-500">
              You'll lose access to all Pro features immediately. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 cursor-pointer rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Keep Pro
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {cancelMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
