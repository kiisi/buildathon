import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState, useCallback } from 'react'

type OtpSearch = { email?: string }

export const Route = createFileRoute('/auth/otp')({
  component: OtpPage,
  validateSearch: (search: Record<string, unknown>): OtpSearch => ({
    email: (search.email as string) || '',
  }),
})

const CODE_LENGTH = 6

function OtpPage() {
  const { email } = Route.useSearch()
  const navigate = useNavigate()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const allFilled = digits.every((d) => d !== '')

  const setRef = useCallback(
    (idx: number) => (el: HTMLInputElement | null) => {
      inputRefs.current[idx] = el
    },
    [],
  )

  function handleChange(idx: number, value: string) {
    // Accept only single digit
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = char
    setDigits(next)

    if (char && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus()
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = [...digits]
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled) return
    const code = digits.join('')
    console.log('OTP submitted:', code)
    // Navigate to onboarding category selection
    navigate({ to: '/onboarding/select-category' })
  }

  return (
    <div className="otp-page">
      <div className="otp-container">
        <h1 className="otp-heading">Check your inbox</h1>
        <p className="otp-subtitle">
          We sent a temporary 6-digit code to{' '}
          <span className="otp-email">{email || 'your email'}</span>.
        </p>

        <form onSubmit={handleSubmit} className="otp-form">
          {/* Code inputs */}
          <div className="otp-inputs" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={setRef(idx)}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className={`otp-box ${digit ? 'otp-box--filled' : ''}`}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="otp-submit-btn"
            className={`otp-submit-btn ${allFilled ? 'otp-submit-btn--active' : ''}`}
            disabled={!allFilled}
          >
            Submit
          </button>
        </form>

        {/* Resend */}
        <button type="button" className="otp-resend" id="otp-resend-btn">
          Resend code
        </button>
      </div>
    </div>
  )
}
