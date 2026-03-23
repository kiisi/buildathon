import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { TreePine } from 'lucide-react'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  function handleContinue(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    navigate({
      to: '/auth/otp',
      search: { email: email.trim() },
    })
  }

  return (
    <div className="auth-layout">
      {/* ── Left Panel: Form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          {/* Logo */}
          <div className="auth-logo">
            <TreePine size={28} strokeWidth={2.5} color="#1069f9" />
            <span className="auth-logo-text">Linkgrove</span>
          </div>

          {/* Heading */}
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subtitle">
            Log in to your <span className="auth-brand-link">Linkgrove</span>
          </p>

          {/* Form */}
          <form onSubmit={handleContinue} className="auth-form">
            <div className="auth-input-wrapper">
              <input
                id="email-input"
                type="text"
                className="auth-input"
                placeholder="Email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <button type="submit" className="auth-continue-btn" id="continue-btn">
              Continue
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-text">OR</span>
          </div>

          {/* Social buttons */}
          <div className="auth-social-buttons">
            <button type="button" className="auth-social-btn" id="google-btn">
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <button type="button" className="auth-social-btn" id="apple-btn">
              <AppleIcon />
              <span>Continue with Apple</span>
            </button>
          </div>

          {/* Forgot links */}
          <div className="auth-forgot-links">
            <a href="#" className="auth-link">
              Forgot password?
            </a>
            <span className="auth-forgot-dot"> • </span>
            <a href="#" className="auth-link">
              Forgot username?
            </a>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            <span className="auth-cookie-link">Cookie preferences</span>
            <p className="auth-signup-text">
              Don't have an account?{' '}
              <a href="/auth/register" className="auth-signup-link">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Hero Image ── */}
      <div className="auth-hero-panel">
        <img
          src="/hero-login.png"
          alt="LinkGrove showcase"
          className="auth-hero-img"
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
