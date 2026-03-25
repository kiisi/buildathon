import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TreePine } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import connectToDatabase from '../../lib/db'
import User from '../../models/User'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema_server = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema_server)
  .handler(async ({ data }) => {
    await connectToDatabase()

    const existing = await User.findOne({ email: data.email })
    if (existing) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const newUser = await User.create({ email: data.email, password: hashedPassword })

    const { createSession } = await import('../../lib/session')


    await createSession(String(newUser._id))

    return { userId: String(newUser._id) }
  })

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

const registerSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

function RegisterPage() {
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      registerFn({ data: values }),
    onSuccess: () => {
      navigate({ to: '/auth/username' })
    },
    onError: (error: any) => {
      alert(error?.message || 'Registration failed')
    },
  })

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: registerSchema,
    onSubmit: (values) => {
      mutation.mutate(values)
    },
  })

  const isDisabled = !formik.dirty || !formik.isValid

  return (
    <div className="flex min-h-dvh w-full">
      {/* ── Left Panel: Form ── */}
      <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:flex-none lg:basis-1/2">
        <div className="flex w-full max-w-[420px] flex-col">
          {/* Logo */}
          <div className="mb-9 flex items-center gap-1.5">
            <TreePine size={28} strokeWidth={2.5} className="text-[#1069f9]" />
            <span className="text-[1.35rem] font-extrabold tracking-tight text-gray-900">
              Linkgrove
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-2 text-[2rem] font-extrabold tracking-tight text-gray-900">
            Join Linkgrove
          </h1>
          <p className="mb-9 text-[0.95rem] text-gray-400">Sign up for free!</p>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="mb-5 flex flex-col gap-4" noValidate>
            <div className="w-full">
              <input
                id="register-email"
                name="email"
                type="email"
                className={`h-[52px] w-full rounded-[10px] border-[1.5px] bg-white px-4 font-sans text-[0.95rem] text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-gray-900'
                }`}
                placeholder="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="email"
                autoFocus
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.email}</p>
              )}
            </div>

            <div className="w-full">
              <input
                id="register-password"
                name="password"
                type="password"
                className={`h-[52px] w-full rounded-[10px] border-[1.5px] bg-white px-4 font-sans text-[0.95rem] text-gray-900 outline-none transition-colors placeholder:text-gray-400 ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-gray-900'
                }`}
                placeholder="Password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="new-password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              id="register-continue-btn"
              disabled={isDisabled || mutation.isPending}
              className={`h-[52px] w-full rounded-full font-sans text-base font-bold tracking-tight transition-all mt-2 ${
                isDisabled || mutation.isPending
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'cursor-pointer bg-gray-900 text-white hover:bg-gray-700 active:scale-[0.985]'
              }`}
            >
              {mutation.isPending ? 'Loading...' : 'Continue'}
            </button>
          </form>

          {/* Terms */}
          <p className="mb-6 text-[0.8rem] leading-relaxed text-gray-500">
            By clicking <span className="font-bold text-gray-900">Create account</span>, you agree
            to LinkGrove's{' '}
            <a href="#" className="underline">
              privacy notice
            </a>
            ,{' '}
            <a href="#" className="underline">
              T&Cs
            </a>{' '}
            and to receive offers, news and updates.
          </p>

          {/* Divider */}
          {/* <div className="relative mb-6 text-center">
            <div className="absolute inset-x-0 top-1/2 h-px bg-gray-100" />
            <span className="relative z-10 bg-white px-[18px] text-[0.85rem] font-medium tracking-wide text-gray-300">
              OR
            </span>
          </div> */}

          {/* Social buttons */}
          {/* <div className="mb-7 flex flex-col gap-3">
            <button
              type="button"
              id="register-google-btn"
              className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-[1.5px] border-gray-200 bg-white font-sans text-[0.95rem] font-bold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <button
              type="button"
              id="register-apple-btn"
              className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-full border-[1.5px] border-gray-200 bg-white font-sans text-[0.95rem] font-bold text-gray-900 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <AppleIcon />
              <span>Continue with Apple</span>
            </button>
          </div> */}

          {/* Footer */}
          <div className="mt-auto flex flex-col items-center gap-2.5 pt-6">
            <span className="cursor-pointer self-start text-xs text-gray-400 hover:underline">
              Cookie preferences
            </span>
            <p className="m-0 text-sm text-gray-500">
              Already have an account?{' '}
              <a
                href="/auth/login"
                className="font-bold text-gray-900 underline hover:text-[#1069f9]"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Hero Image ── */}
      <div className="hidden items-center justify-center overflow-hidden bg-gray-100 lg:flex lg:flex-none lg:basis-1/2">
        <img
          src="/hero-register.png"
          alt="LinkGrove showcase"
          className="h-dvh w-full object-cover"
        />
      </div>
    </div>
  )
}

/* ── Inline SVG Icons ── */

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
