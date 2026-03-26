import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import {
  Shield, Zap, Crown, Check, Loader2, RotateCcw,
  XCircle, Receipt, AlertTriangle, CalendarClock,
} from 'lucide-react'
import connectToDatabase from '../../lib/db'
import UserModel from '../../models/User'
import PaymentHistoryModel from '../../models/PaymentHistory'

declare global {
  interface Window { webpayCheckout: (config: Record<string, unknown>) => void }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentRecord = {
  id: string; txnRef: string; amount: number
  status: 'success' | 'failed' | 'pending'; period: string; createdAt: string
}
type AccountData = {
  email: string; username: string; firstName: string; lastName: string
  plan: 'free' | 'pro'; planRenewsAt: string | null; allowDataSharing: boolean; payments: PaymentRecord[]
}

// ── Server functions ──────────────────────────────────────────────────────────

const getAccountDataFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const user = await UserModel.findById(session.userId)
    .select('email username firstName lastName plan planRenewsAt allowDataSharing').lean() as any
  if (!user) throw new Error('User not found')
  const payments = await PaymentHistoryModel
    .find({ userId: session.userId }).sort({ createdAt: -1 }).limit(20).lean()
  return {
    email: user.email as string,
    username: (user.username ?? '') as string,
    firstName: (user.firstName ?? '') as string,
    lastName: (user.lastName ?? '') as string,
    plan: (user.plan ?? 'free') as 'free' | 'pro',
    planRenewsAt: user.planRenewsAt
      ? new Date(user.planRenewsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null,
    allowDataSharing: user.allowDataSharing !== false,
    payments: payments.map((p: any) => ({
      id: String(p._id), txnRef: p.txnRef, amount: p.amount,
      status: p.status as 'success' | 'failed' | 'pending',
      period: p.period,
      createdAt: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })),
  } as AccountData
})

const updateUsernameFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._]+$/) }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    const taken = await UserModel.findOne({ username: data.username, _id: { $ne: session.userId } }).lean()
    if (taken) throw new Error('Username is already taken')
    await UserModel.updateOne({ _id: session.userId }, { $set: { username: data.username } })
    return { ok: true }
  })

const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ firstName: z.string().min(1), lastName: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await UserModel.updateOne({ _id: session.userId }, { $set: { firstName: data.firstName, lastName: data.lastName } })
    return { ok: true }
  })

const verifyPaymentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ txnRef: z.string(), responseCode: z.string() }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    if (data.responseCode !== '00') throw new Error('Payment was not successful. Please try again.')
    await connectToDatabase()
    const renewsAt = new Date()
    renewsAt.setDate(renewsAt.getDate() + 30)
    await UserModel.updateOne({ _id: session.userId }, { $set: { plan: 'pro', lastTxnRef: data.txnRef, planRenewsAt: renewsAt } })
    await PaymentHistoryModel.create({
      userId: session.userId, txnRef: data.txnRef,
      amount: 200000, status: 'success', plan: 'pro', period: 'monthly',
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

const toggleDataSharingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ allow: z.boolean() }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')
    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await UserModel.updateOne({ _id: session.userId }, { $set: { allowDataSharing: data.allow } })
    return { ok: true }
  })

const deleteAccountFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSession, clearSession } = await import('../../lib/session')
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  await UserModel.deleteOne({ _id: session.userId })
  clearSession()
  return { ok: true }
})

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/account')({
  loader: async () => getAccountDataFn(),
  component: AccountPage,
})

const proFeatures = [
  'Remove Linkgrove branding', 'Customized appearance & layouts',
  'Comprehensive analytics', 'Social media scheduling',
  'Automated Instagram DMs', 'Email integrations',
  'Lower seller fees (9%)', 'Linkgrove affiliate shop',
]

function AccountPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [account, setAccount] = useState<AccountData>(data)
  const [username, setUsername] = useState(data.username)
  const [firstName, setFirstName] = useState(data.firstName)
  const [lastName, setLastName] = useState(data.lastName)
  const [usernameError, setUsernameError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')

  const isPro = account.plan === 'pro'
  const usernameChanged = username !== account.username
  const usernameValid = /^[a-zA-Z0-9._]{3,30}$/.test(username)
  const profileChanged = firstName !== account.firstName || lastName !== account.lastName
  const profileValid = firstName.trim().length > 0 && lastName.trim().length > 0

  async function refresh() {
    const fresh = await getAccountDataFn()
    setAccount(fresh)
    await router.invalidate()
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  const usernameMutation = useMutation({
    mutationFn: () => updateUsernameFn({ data: { username } }),
    onSuccess: () => { setAccount(a => ({ ...a, username })); setUsernameError('') },
    onError: (err: any) => setUsernameError(err?.message || 'Failed to update username'),
  })

  const profileMutation = useMutation({
    mutationFn: () => updateProfileFn({ data: { firstName: firstName.trim(), lastName: lastName.trim() } }),
    onSuccess: () => { setAccount(a => ({ ...a, firstName: firstName.trim(), lastName: lastName.trim() })); setProfileError('') },
    onError: (err: any) => setProfileError(err?.message || 'Failed to update name'),
  })

  const verifyMutation = useMutation({
    mutationFn: (vars: { txnRef: string; responseCode: string }) => verifyPaymentFn({ data: vars }),
    onSuccess: async () => { await refresh(); setLoadingPayment(false) },
    onError: (err: any) => { setLoadingPayment(false); alert(err?.message || 'Payment verification failed') },
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelPlanFn(),
    onSuccess: async () => { await refresh(); setShowCancelConfirm(false) },
    onError: (err: any) => alert(err?.message || 'Failed to cancel plan'),
  })

  const dataSharingMutation = useMutation({
    mutationFn: (allow: boolean) => toggleDataSharingFn({ data: { allow } }),
    onSuccess: (_, allow) => setAccount(a => ({ ...a, allowDataSharing: allow })),
    onError: (err: any) => alert(err?.message || 'Failed to update setting'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccountFn(),
    onSuccess: () => router.navigate({ to: '/' }),
    onError: (err: any) => alert(err?.message || 'Failed to delete account'),
  })

  // ── Interswitch ────────────────────────────────────────────────────────────

  function handleUpgrade() {
    setLoadingPayment(true)
    const txnRef = `LG-${account.username}-${Date.now()}`
    window.webpayCheckout({
      merchant_code: 'MX276092', pay_item_id: 'Default_Payable_MX276092',
      txn_ref: txnRef, amount: 200000, currency: 566,
      site_redirect_url: `${window.location.origin}/dashboard/account`,
      cust_id: account.username, cust_name: account.username, cust_email: account.email,
      mode: 'TEST',
      onComplete: (response: { resp: string; txnref: string }) => {
        verifyMutation.mutate({ txnRef: response.txnref ?? txnRef, responseCode: response.resp })
      },
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/40">
      <div className="mx-auto w-full max-w-[720px] px-4 pb-20 pt-6 sm:px-8">
        <h1 className="mb-8 text-2xl font-extrabold tracking-tight text-gray-900">Account</h1>

        <div className="flex flex-col gap-8">

          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">My information</h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-3">
                {/* First + Last name */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col rounded-xl bg-[#F5F6F8] px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1069f9]/20">
                      <label className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">First name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => { setFirstName(e.target.value); setProfileError('') }}
                        className="bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
                        placeholder="First name"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col rounded-xl bg-[#F5F6F8] px-4 py-2.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1069f9]/20">
                      <label className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Last name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => { setLastName(e.target.value); setProfileError('') }}
                        className="bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                </div>
                {profileError && <p className="text-xs text-red-500">{profileError}</p>}

                {/* Username — editable */}
                <div>
                  <div className={`flex flex-col rounded-xl px-4 py-2.5 transition-colors ${
                    usernameError ? 'bg-red-50 ring-1 ring-red-300' : 'bg-[#F5F6F8] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1069f9]/20'
                  }`}>
                    <label className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setUsernameError('') }}
                      className="bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:text-gray-400"
                      placeholder="your-username"
                    />
                  </div>
                  {usernameError && <p className="mt-1 text-xs text-red-500">{usernameError}</p>}
                </div>

                {/* Email — read only */}
                <div className="flex flex-col rounded-xl bg-[#F5F6F8] px-4 py-2.5 opacity-60">
                  <label className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Email</label>
                  <input
                    type="email"
                    value={account.email}
                    disabled
                    className="bg-transparent text-[15px] font-medium text-gray-900 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (profileChanged && profileValid) profileMutation.mutate()
                  if (usernameChanged && usernameValid) usernameMutation.mutate()
                }}
                disabled={(!profileChanged && !usernameChanged) || (!profileValid && !usernameValid) || profileMutation.isPending || usernameMutation.isPending}
                className={`mt-4 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold transition-all ${
                  (!profileChanged && !usernameChanged) || (!profileValid && !usernameValid)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.98]'
                }`}
              >
                {profileMutation.isPending || usernameMutation.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                  : 'Save changes'}
              </button>
            </div>
          </section>

          {/* ── Billing & Plan ── */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Billing & Plan</h2>

            {isPro ? (
              <div className="overflow-hidden rounded-2xl border border-violet-200 bg-white">
                <div className="flex items-center justify-between bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Crown size={20} className="text-white" />
                    <div>
                      <p className="text-sm font-extrabold text-white">Pro Plan</p>
                      <p className="text-xs text-white/70">₦2,000 / month</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">Active</span>
                </div>

                <div className="p-5">
                  {account.planRenewsAt && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3">
                      <CalendarClock size={14} className="shrink-0 text-violet-500" />
                      <p className="text-sm text-violet-700">
                        Next billing on <span className="font-semibold">{account.planRenewsAt}</span>
                      </p>
                    </div>
                  )}

                  <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {proFeatures.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={13} className="shrink-0 text-violet-500" /> {f}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    {/* "Manage subscription" instead of "Renew now" when active */}
                    {/* <button
                      onClick={handleUpgrade}
                      disabled={loadingPayment || verifyMutation.isPending}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-violet-200 bg-violet-50 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:bg-violet-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingPayment || verifyMutation.isPending
                        ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
                        : <><RotateCcw size={14} /> Pay next cycle early</>}
                    </button> */}
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <XCircle size={14} /> Cancel plan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Free Plan</p>
                    <p className="text-xs text-gray-400">₦0 / month</p>
                  </div>
                  <span className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-500">Current</span>
                </div>
                <div className="p-5">
                  <div className="mb-4 flex items-start gap-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 p-4">
                    <Crown size={18} className="mt-0.5 shrink-0 text-violet-500" />
                    <div>
                      <p className="mb-0.5 text-sm font-bold text-gray-900">Upgrade to Pro — ₦2,000/month</p>
                      <p className="text-xs text-gray-500">Unlock all features, remove branding, and grow faster.</p>
                    </div>
                  </div>
                  <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {proFeatures.map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={13} className="shrink-0 text-violet-500" /> {f}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleUpgrade}
                    disabled={loadingPayment || verifyMutation.isPending}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 py-3 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingPayment || verifyMutation.isPending
                      ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
                      : <><Zap size={14} /> Upgrade to Pro — ₦2,000/mo</>}
                  </button>
                  <p className="mt-2 text-center text-xs text-gray-400">Billed monthly · Cancel anytime</p>
                </div>
              </div>
            )}
          </section>

          {/* ── Payment History ── */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Payment History</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {account.payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Receipt size={28} className="mb-3 text-gray-200" />
                  <p className="text-sm font-semibold text-gray-500">No payments yet</p>
                  <p className="text-xs text-gray-400">Your billing history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/60">
                        {['Date', 'Plan', 'Amount', 'Status', 'Ref'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {account.payments.map((p, i) => (
                        <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.createdAt}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Crown size={11} className="text-violet-500" />
                              <span className="text-sm font-semibold capitalize text-gray-800">Pro · {p.period}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">₦{(p.amount / 100).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              p.status === 'success' ? 'bg-emerald-50 text-emerald-600'
                              : p.status === 'failed' ? 'bg-red-50 text-red-500'
                              : 'bg-amber-50 text-amber-600'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${
                                p.status === 'success' ? 'bg-emerald-500'
                                : p.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                              }`} />
                              {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-gray-400 max-w-[120px] truncate">{p.txnRef}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* ── Privacy ── */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Privacy</h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Allow data sharing</p>
                    <p className={`text-xs font-semibold ${account.allowDataSharing ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {account.allowDataSharing ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dataSharingMutation.mutate(!account.allowDataSharing)}
                  disabled={dataSharingMutation.isPending}
                  className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full border-none transition-colors duration-200 disabled:cursor-not-allowed ${
                    account.allowDataSharing ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 ${
                    account.allowDataSharing ? 'left-[22px]' : 'left-0.5'
                  }`} />
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Disabling this may affect access to certain monetization features.{' '}
                <a href="#" className="underline hover:text-gray-600">Learn more</a>
              </p>
            </div>
          </section>

          {/* ── Danger zone ── */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">Danger zone</h2>
            <div className="rounded-2xl border border-red-100 bg-white p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">Delete account</p>
                  <p className="text-xs text-gray-400">Permanently delete your account and all associated data.</p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-3 cursor-pointer rounded-full border border-red-200 bg-red-50 px-5 py-2 text-sm font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white sm:mt-0"
                >
                  Delete account
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* ── Cancel plan modal ── */}
      {showCancelConfirm && (
        <Modal onClose={() => setShowCancelConfirm(false)}>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
            <XCircle size={20} className="text-red-500" />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-gray-900">Cancel Pro plan?</h3>
          <p className="mb-6 text-sm text-gray-500">You'll lose access to all Pro features immediately.</p>
          <div className="flex gap-2.5">
            <button onClick={() => setShowCancelConfirm(false)}
              className="flex-1 cursor-pointer rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Keep Pro
            </button>
            <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60">
              {cancelMutation.isPending && <Loader2 size={13} className="animate-spin" />}
              Yes, cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete account modal ── */}
      {showDeleteConfirm && (
        <Modal onClose={() => { setShowDeleteConfirm(false); setDeleteInput('') }}>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h3 className="mb-1.5 text-base font-bold text-gray-900">Delete your account?</h3>
          <p className="mb-4 text-sm text-gray-500">
            This will permanently delete your account, all links, and data. This action <span className="font-semibold text-gray-700">cannot be undone</span>.
          </p>
          <p className="mb-2 text-xs font-semibold text-gray-600">
            Type <span className="font-bold text-gray-900">{account.username}</span> to confirm
          </p>
          <input
            type="text"
            value={deleteInput}
            onChange={e => setDeleteInput(e.target.value)}
            placeholder={account.username}
            className="mb-5 h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
          />
          <div className="flex gap-2.5">
            <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
              className="flex-1 cursor-pointer rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteInput !== account.username || deleteMutation.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleteMutation.isPending && <Loader2 size={13} className="animate-spin" />}
              Delete forever
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Reusable modal wrapper ────────────────────────────────────────────────────

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6">
        {children}
      </div>
    </div>
  )
}
