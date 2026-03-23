import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { TreePine, Lock, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/anon/$username')({
  component: AnonMessagePage,
})

function AnonMessagePage() {
  const { username } = Route.useParams()
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const maxChars = 300

  function handleSend() {
    if (!message.trim() || sending) return
    setSending(true)
    // Simulate send
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 800)
  }

  function handleReset() {
    setMessage('')
    setSent(false)
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#1069f9] via-[#3b82f6] to-[#06b6d4] px-5 py-12">
      {/* Decorative background elements — LinkGrove unique touch */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating grove leaves */}
        <div className="absolute -left-10 top-1/4 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -right-10 bottom-1/4 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/3 top-10 h-24 w-24 rounded-full bg-[#06b6d4]/20 blur-2xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-[520px] flex-col items-center">
        {/* Card */}
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20">
          {/* User header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#1069f9] to-[#06b6d4]">
              <span className="text-lg">🌳</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">@{username}</p>
              <p className="text-sm text-gray-500">send me anonymous messages!</p>
            </div>
          </div>

          {/* Message input area */}
          {!sent ? (
            <div className="px-5 pb-5">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1069f9]/10 via-[#3b82f6]/8 to-[#06b6d4]/5">
                <textarea
                  id="anon-message-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
                  placeholder="Say something nice... or spill the tea 🍵"
                  rows={4}
                  className="w-full resize-none border-none bg-transparent px-5 pt-5 pb-5 font-sans text-[15px] text-gray-800 outline-none placeholder:text-gray-400/70"
                />
              </div>
            </div>
          ) : (
            /* Success state */
            <div className="flex flex-col items-center px-6 pb-8 pt-4">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1069f9]/10 to-[#06b6d4]/10">
                <Sparkles size={28} className="text-[#1069f9]" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">Message sent! 🎉</h3>
              <p className="mb-5 text-center text-sm text-gray-500">
                Your anonymous message has been delivered to @{username}
              </p>
              <button
                onClick={handleReset}
                className="h-10 cursor-pointer rounded-full bg-gradient-to-r from-[#1069f9] to-[#06b6d4] px-6 font-sans text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Send another message
              </button>
            </div>
          )}
        </div>

        {/* Footer branding */}
        <div className="mt-5 flex items-center gap-1.5">
          <Lock size={12} className="text-white/60" />
          <span className="text-xs font-medium text-white/60">anonymous &amp; secure</span>
          <span className="mx-1.5 text-white/30">•</span>
          <TreePine size={13} className="text-white/70" />
          <span className="text-xs font-bold tracking-tight text-white/70">Linkgrove</span>
        </div>

        {/* Big Send button — outside the card */}
        {!sent && (
          <button
            id="anon-send-btn"
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="mt-5 flex h-[56px] w-full cursor-pointer items-center justify-center rounded-full border-none bg-gray-900 font-sans text-base font-bold text-white shadow-xl shadow-black/25 transition-all hover:bg-gray-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              'Send!'
            )}
          </button>
        )}

        {/* Create your own CTA */}
        <a
          href="/auth/register"
          className="mt-4 text-xs font-semibold text-white/50 underline decoration-white/20 underline-offset-2 transition-colors hover:text-white/80"
        >
          Create your own anonymous page →
        </a>
      </div>
    </div>
  )
}
