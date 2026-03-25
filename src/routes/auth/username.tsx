import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TreePine, ChevronLeft, Check, X } from 'lucide-react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { useState, useEffect, useRef } from 'react'
import connectToDatabase from '../../lib/db'
import User from '../../models/User'

// ── Server functions ──────────────────────────────────────────────────────────

const checkUsernameFn = createServerFn()
  .inputValidator(z.object({ username: z.string() }))
  .handler(async ({ data }) => {
    await connectToDatabase()
    const existing = await User.findOne({ username: data.username }).lean()
    return { available: !existing }
  })

const saveUsernameFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._]+$/) }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()

    const taken = await User.findOne({ username: data.username }).lean()
    if (taken) throw new Error('Username is already taken')

    await User.updateOne({ _id: session.userId }, { $set: { username: data.username } })
    return { ok: true }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/auth/username')({
  component: UsernamePage,
})

const usernameSchema = Yup.object({
  username: Yup.string()
    .min(3, 'At least 3 characters')
    .max(30, 'At most 30 characters')
    .matches(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots, and underscores')
    .required('Username is required'),
})

// ── Component ─────────────────────────────────────────────────────────────────

function UsernamePage() {
  const navigate = useNavigate()
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const mutation = useMutation({
    mutationFn: (username: string) => saveUsernameFn({ data: { username } }),
    onSuccess: () => navigate({ to: '/onboarding/select-plan' }),
    onError: (error: any) => alert(error?.message || 'Failed to save username'),
  })

  const formik = useFormik({
    initialValues: { username: '' },
    validationSchema: usernameSchema,
    onSubmit: (values) => mutation.mutate(values.username),
  })

  // Debounced availability check
  useEffect(() => {
    const val = formik.values.username
    if (!val || val.length < 3 || formik.errors.username) {
      setAvailability('idle')
      return
    }
    setAvailability('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const result = await checkUsernameFn({ data: { username: val } })
      setAvailability(result.available ? 'available' : 'taken')
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [formik.values.username, formik.errors.username])

  const isDisabled = !formik.dirty || !formik.isValid || availability === 'taken' || availability === 'checking' || mutation.isPending

  return (
    <div className="flex min-h-dvh w-full">
      {/* Left Panel */}
      <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:flex-none lg:basis-1/2">
        <div className="flex w-full max-w-[420px] flex-col">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-1.5">
            <TreePine size={28} strokeWidth={2.5} className="text-[#1069f9]" />
            <span className="text-[1.35rem] font-extrabold tracking-tight text-gray-900">Linkgrove</span>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate({ to: '/auth/register' })}
            className="mb-6 flex w-fit cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 font-sans text-sm font-semibold text-[#1069f9] hover:underline"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Back
          </button>

          <h1 className="mb-2 text-[1.75rem] font-extrabold tracking-tight text-gray-900">
            Choose your username
          </h1>
          <p className="mb-9 text-[0.875rem] leading-relaxed text-gray-400">
            This will be your public Linkgrove URL. You can change it later.
          </p>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4" noValidate>
            <div className="w-full">
              <div
                className={`flex h-[52px] items-center overflow-hidden rounded-[10px] border-[1.5px] bg-white transition-colors ${
                  formik.touched.username && formik.errors.username
                    ? 'border-red-400 focus-within:border-red-500'
                    : availability === 'available'
                    ? 'border-green-400 focus-within:border-green-500'
                    : availability === 'taken'
                    ? 'border-red-400'
                    : 'border-gray-200 focus-within:border-gray-900'
                }`}
              >
                <span className="select-none pl-4 text-[0.9rem] text-gray-400">linkgrove.ee/</span>
                <input
                  id="username-input"
                  name="username"
                  type="text"
                  className="h-full flex-1 border-none bg-transparent pr-2 font-sans text-[0.95rem] font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-300"
                  placeholder="your-username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoFocus
                  autoComplete="username"
                />
                {/* Availability indicator */}
                <span className="pr-3">
                  {availability === 'checking' && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#1069f9] inline-block" />
                  )}
                  {availability === 'available' && <Check size={16} className="text-green-500" />}
                  {availability === 'taken' && <X size={16} className="text-red-500" />}
                </span>
              </div>

              {/* Messages */}
              {formik.touched.username && formik.errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.username}</p>
              )}
              {!formik.errors.username && availability === 'available' && (
                <p className="mt-1.5 text-xs text-green-600">That username is available!</p>
              )}
              {availability === 'taken' && (
                <p className="mt-1.5 text-xs text-red-500">That username is already taken.</p>
              )}
            </div>

            <button
              type="submit"
              id="username-continue-btn"
              disabled={isDisabled}
              className={`h-[52px] w-full rounded-full font-sans text-base font-bold tracking-tight transition-all ${
                isDisabled
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'cursor-pointer bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.985]'
              }`}
            >
              {mutation.isPending ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden items-center justify-center overflow-hidden bg-gray-100 lg:flex lg:flex-none lg:basis-1/2">
        <img src="/hero-register.png" alt="LinkGrove showcase" className="h-dvh w-full object-cover" />
      </div>
    </div>
  )
}
