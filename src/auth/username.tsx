import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { TreePine, ChevronLeft } from 'lucide-react'

type UsernameSearch = { email?: string }

export const Route = createFileRoute('/auth/username')({
  component: UsernamePage,
  validateSearch: (search: Record<string, unknown>): UsernameSearch => ({
    email: (search.email as string) || '',
  }),
})

const usernameSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .matches(
      /^[a-zA-Z0-9._]+$/,
      'Only letters, numbers, dots, and underscores are allowed',
    )
    .required('Username is required'),
})

function UsernamePage() {
  const { email } = Route.useSearch()
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: { username: '' },
    validationSchema: usernameSchema,
    onSubmit: (values) => {
      // TODO: validate username availability on server
      navigate({
        to: '/auth/otp',
        search: { email },
      })
    },
  })

  const isDisabled = !formik.dirty || !formik.isValid

  return (
    <div className="flex min-h-dvh w-full">
      {/* ── Left Panel ── */}
      <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:flex-none lg:basis-1/2">
        <div className="flex w-full max-w-[420px] flex-col">
          {/* Logo */}
          <div className="mb-6 flex items-center gap-1.5">
            <TreePine size={28} strokeWidth={2.5} className="text-[#1069f9]" />
            <span className="text-[1.35rem] font-extrabold tracking-tight text-gray-900">
              Linkgrove
            </span>
          </div>

          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate({ to: '/auth/register' })}
            className="mb-6 flex w-fit cursor-pointer items-center gap-0.5 border-none bg-transparent p-0 font-sans text-sm font-semibold text-[#1069f9] hover:underline"
            id="username-back-btn"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
            Back
          </button>

          {/* Heading */}
          <h1 className="mb-2 text-[1.75rem] font-extrabold tracking-tight text-gray-900">
            Choose your username
          </h1>
          <p className="mb-9 text-[0.875rem] leading-relaxed text-gray-400">
            Try something similar to your social handles for easy recognition.
          </p>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Username input with prefix */}
            <div className="w-full">
              <div
                className={`flex h-[52px] items-center overflow-hidden rounded-[10px] border-[1.5px] bg-white transition-colors ${
                  formik.touched.username && formik.errors.username
                    ? 'border-red-400 focus-within:border-red-500'
                    : 'border-gray-200 focus-within:border-gray-900'
                }`}
              >
                <span className="select-none pl-4 text-[0.9rem] text-gray-400">
                  linkgrove.ee/
                </span>
                <input
                  id="username-input"
                  name="username"
                  type="text"
                  className="h-full flex-1 border-none bg-transparent pr-4 font-sans text-[0.95rem] font-semibold text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-300"
                  placeholder="your-username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  autoFocus
                  autoComplete="username"
                />
              </div>
              {formik.touched.username && formik.errors.username && (
                <p className="mt-1.5 text-xs text-red-500">{formik.errors.username}</p>
              )}
            </div>

            <button
              type="submit"
              id="username-continue-btn"
              disabled={isDisabled}
              className={`h-[52px] w-full rounded-full font-sans text-base font-bold tracking-tight transition-all ${
                isDisabled
                  ? 'cursor-not-allowed border-[1.5px] border-gray-200 bg-white text-gray-900 opacity-80'
                  : 'cursor-pointer border-[1.5px] border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50 active:scale-[0.985]'
              }`}
            >
              Continue
            </button>
          </form>
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
