import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { useState } from 'react'
import { TreePine, CheckCircle2, BarChart3, Users, Share2, ChevronLeft } from 'lucide-react'
import connectToDatabase from '../../lib/db'
import PollModel from '../../models/Poll'
import UserModel from '../../models/User'

// ── Types ─────────────────────────────────────────────────────────────────────

type PollOption = { id: string; text: string; votes: number }
type PublicPoll = {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  status: 'active' | 'ended'
  allowMultiple: boolean
  ownerUsername: string
  ownerName: string
}

// ── Server functions ──────────────────────────────────────────────────────────

const getPollFn = createServerFn()
  .inputValidator(z.object({ pollId: z.string() }))
  .handler(async ({ data }) => {
    await connectToDatabase()
    const poll = await PollModel.findById(data.pollId).lean() as any
    if (!poll) return null

    const owner = await UserModel.findById(poll.userId)
      .select('username firstName lastName').lean() as any

    const totalVotes = poll.options.reduce((s: number, o: any) => s + o.votes, 0)

    return {
      id: String(poll._id),
      question: poll.question,
      options: poll.options.map((o: any) => ({
        id: String(o._id),
        text: o.text,
        votes: o.votes,
      })),
      totalVotes,
      status: poll.status as 'active' | 'ended',
      allowMultiple: poll.allowMultiple,
      ownerUsername: (owner?.username ?? '') as string,
      ownerName: (`${owner?.firstName ?? ''} ${owner?.lastName ?? ''}`.trim() || owner?.username || '') as string,
    } as PublicPoll
  })

const voteFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    pollId: z.string(),
    optionIds: z.array(z.string()).min(1),
  }))
  .handler(async ({ data }) => {
    await connectToDatabase()
    const poll = await PollModel.findById(data.pollId)
    if (!poll) throw new Error('Poll not found')
    if (poll.status === 'ended') throw new Error('This poll has ended')

    // Increment votes for selected options
    for (const optId of data.optionIds) {
      await PollModel.updateOne(
        { _id: data.pollId, 'options._id': optId },
        { $inc: { 'options.$.votes': 1 } },
      )
    }

    // Return updated poll
    const updated = await PollModel.findById(data.pollId).lean() as any
    const totalVotes = updated.options.reduce((s: number, o: any) => s + o.votes, 0)
    return {
      options: updated.options.map((o: any) => ({
        id: String(o._id),
        text: o.text,
        votes: o.votes,
      })),
      totalVotes,
    }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/poll/$pollId')({
  loader: async ({ params }) => {
    const poll = await getPollFn({ data: { pollId: params.pollId } })
    return { poll }
  },
  component: PublicPollPage,
})

// ── Component ─────────────────────────────────────────────────────────────────

function PublicPollPage() {
  const { poll: initial } = Route.useLoaderData()
  const [poll, setPoll] = useState<PublicPoll | null>(initial)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [hasVoted, setHasVoted] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!poll) return <NotFoundPage />

  const isEnded = poll.status === 'ended'
  const showResults = hasVoted || isEnded
  const maxVotes = Math.max(...poll.options.map(o => o.votes), 1)

  const voteMutation = useMutation({
    mutationFn: () => voteFn({ data: { pollId: poll.id, optionIds: Array.from(selected) } }),
    onSuccess: (updated) => {
      setPoll(prev => prev ? { ...prev, options: updated.options, totalVotes: updated.totalVotes } : prev)
      setHasVoted(true)
    },
    onError: (err: any) => alert(err?.message || 'Failed to submit vote'),
  })

  function toggleOption(id: string) {
    if (showResults || isEnded) return
    setSelected(prev => {
      const next = new Set(prev)
    if (poll!.allowMultiple) {
        next.has(id) ? next.delete(id) : next.add(id)
      } else {
        next.clear()
        next.add(id)
      }
      return next
    })
  }

  function handleShare() {
    const url = window.location.href
    if (navigator.share) navigator.share({ title: poll!.question, url })
    else { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  return (
    <div className="min-h-dvh bg-gray-50 font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5">
            <TreePine size={20} strokeWidth={2.5} className="text-[#1069f9]" />
            <span className="text-sm font-extrabold tracking-tight text-gray-900">Linkgrove</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Share2 size={13} />
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-5 py-10">
        {/* Creator attribution */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1069f9]/10 text-xs font-bold text-[#1069f9]">
            {(poll.ownerName || poll.ownerUsername)[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-gray-400">
              Poll by{' '}
              <Link to={`/${poll.ownerUsername}` as any} className="font-semibold text-gray-700 hover:text-[#1069f9]">
                {poll.ownerName || poll.ownerUsername}
              </Link>
            </p>
          </div>
        </div>

        {/* Poll card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Status bar */}
          <div className={`flex items-center justify-between px-5 py-3 ${isEnded ? 'bg-gray-50' : 'bg-[#1069f9]/5'}`}>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className={isEnded ? 'text-gray-400' : 'text-[#1069f9]'} />
              <span className={`text-xs font-semibold ${isEnded ? 'text-gray-400' : 'text-[#1069f9]'}`}>
                {isEnded ? 'Poll ended' : 'Active poll'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Users size={12} />
              {poll.totalVotes.toLocaleString()} vote{poll.totalVotes !== 1 && 's'}
            </div>
          </div>

          <div className="p-5">
            {/* Question */}
            <h1 className="mb-6 text-lg font-extrabold leading-snug text-gray-900">
              {poll.question}
            </h1>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {poll.options.map(option => {
                const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
                const isLeading = option.votes === maxVotes && option.votes > 0
                const isSelected = selected.has(option.id)

                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    disabled={showResults || isEnded}
                    className={`relative w-full overflow-hidden rounded-xl border-2 text-left transition-all ${
                      showResults
                        ? 'cursor-default'
                        : isSelected
                        ? 'border-[#1069f9] bg-[#1069f9]/5'
                        : 'border-gray-200 hover:border-[#1069f9]/40 hover:bg-gray-50 cursor-pointer'
                    } ${isEnded ? 'cursor-default' : ''}`}
                  >
                    {/* Progress bar fill */}
                    {showResults && (
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ${isLeading ? 'bg-[#1069f9]/10' : 'bg-gray-100'}`}
                        style={{ width: `${pct}%` }}
                      />
                    )}

                    <div className="relative flex items-center justify-between px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Selection indicator */}
                        {!showResults && (
                          <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected ? 'border-[#1069f9] bg-[#1069f9]' : 'border-gray-300'
                          }`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                        )}
                        {showResults && isLeading && (
                          <CheckCircle2 size={16} className="shrink-0 text-[#1069f9]" />
                        )}
                        <span className={`text-sm font-semibold ${showResults && isLeading ? 'text-[#1069f9]' : 'text-gray-800'}`}>
                          {option.text}
                        </span>
                      </div>

                      {showResults && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-400">{option.votes.toLocaleString()}</span>
                          <span className={`min-w-[36px] text-right text-sm font-bold ${isLeading ? 'text-[#1069f9]' : 'text-gray-400'}`}>
                            {pct}%
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Action area */}
            <div className="mt-6">
              {!showResults && !isEnded ? (
                <button
                  onClick={() => voteMutation.mutate()}
                  disabled={selected.size === 0 || voteMutation.isPending}
                  className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-[0.98] ${
                    selected.size === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#1069f9] text-white hover:bg-[#0558e0]'
                  }`}
                >
                  {voteMutation.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    'Submit vote'
                  )}
                </button>
              ) : hasVoted ? (
                <div className="flex items-center justify-center gap-2 rounded-full bg-emerald-50 py-3 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 size={16} />
                  Your vote has been recorded
                </div>
              ) : null}

              {poll.allowMultiple && !showResults && (
                <p className="mt-2 text-center text-xs text-gray-400">You can select multiple options</p>
              )}
            </div>
          </div>
        </div>

        {/* Back to profile */}
        {poll.ownerUsername && (
          <div className="mt-6 text-center">
            <Link
              to={`/${poll.ownerUsername}` as any}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#1069f9]"
            >
              <ChevronLeft size={15} />
              Back to {poll.ownerName || poll.ownerUsername}'s page
            </Link>
          </div>
        )}

        {/* Linkgrove CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-6 text-center">
          <TreePine size={24} className="text-[#1069f9]" />
          <p className="text-sm font-bold text-gray-900">Create your own polls with Linkgrove</p>
          <p className="text-xs text-gray-400">Share polls, links, and more — all from one page.</p>
          <Link
            to="/auth/register"
            className="rounded-full bg-[#1069f9] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0558e0]"
          >
            Get started free
          </Link>
        </div>
      </main>
    </div>
  )
}

// ── 404 ───────────────────────────────────────────────────────────────────────

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-5 text-center">
      <BarChart3 size={40} className="text-[#1069f9]" />
      <h1 className="text-2xl font-extrabold text-gray-900">Poll not found</h1>
      <p className="text-sm text-gray-400">This poll doesn't exist or has been removed.</p>
      <Link to="/" className="mt-2 rounded-full bg-[#1069f9] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0558e0]">
        Go to Linkgrove
      </Link>
    </div>
  )
}
