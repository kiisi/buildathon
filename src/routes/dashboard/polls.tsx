import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  BarChart,
  Plus,
  Trash2,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  ThumbsUp,
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Share2,
  Clock,
  TrendingUp,
  Sparkles,
  X,
  GripVertical,
  Send,
  Eye,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/polls')({
  component: PollsPage,
})

/* ── Types ─────────────────────────────────────────── */
type PollOption = {
  id: string
  text: string
  votes: number
}

type Poll = {
  id: string
  question: string
  type: 'poll' | 'rating' | 'feedback'
  options: PollOption[]
  totalVotes: number
  status: 'active' | 'ended' | 'draft'
  createdAt: string
  endsAt?: string
  allowMultiple: boolean
}

/* ── Mock data ─────────────────────────────────────── */
const initialPolls: Poll[] = [
  {
    id: '1',
    question: 'What kind of content would you like to see more of?',
    type: 'poll',
    options: [
      { id: 'a', text: 'Coding tutorials', votes: 142 },
      { id: 'b', text: 'Design breakdowns', votes: 89 },
      { id: 'c', text: 'Career advice', votes: 67 },
      { id: 'd', text: 'Behind the scenes', votes: 53 },
    ],
    totalVotes: 351,
    status: 'active',
    createdAt: 'Mar 22, 2026',
    endsAt: 'Mar 29, 2026',
    allowMultiple: false,
  },
  {
    id: '2',
    question: 'Rate your experience with LinkGrove so far',
    type: 'rating',
    options: [
      { id: '1s', text: '⭐', votes: 3 },
      { id: '2s', text: '⭐⭐', votes: 5 },
      { id: '3s', text: '⭐⭐⭐', votes: 18 },
      { id: '4s', text: '⭐⭐⭐⭐', votes: 47 },
      { id: '5s', text: '⭐⭐⭐⭐⭐', votes: 89 },
    ],
    totalVotes: 162,
    status: 'active',
    createdAt: 'Mar 20, 2026',
    allowMultiple: false,
  },
  {
    id: '3',
    question: 'Which feature should we build next?',
    type: 'poll',
    options: [
      { id: 'e', text: 'Dark mode themes', votes: 234 },
      { id: 'f', text: 'Custom domains', votes: 187 },
      { id: 'g', text: 'Email collection', votes: 156 },
      { id: 'h', text: 'Payment integration', votes: 201 },
    ],
    totalVotes: 778,
    status: 'ended',
    createdAt: 'Mar 10, 2026',
    endsAt: 'Mar 17, 2026',
    allowMultiple: true,
  },
  {
    id: '4',
    question: 'How did you discover LinkGrove?',
    type: 'feedback',
    options: [
      { id: 'i', text: 'Twitter / X', votes: 92 },
      { id: 'j', text: 'Friend referral', votes: 68 },
      { id: 'k', text: 'Google search', votes: 45 },
      { id: 'l', text: 'YouTube', votes: 37 },
      { id: 'm', text: 'Other', votes: 21 },
    ],
    totalVotes: 263,
    status: 'active',
    createdAt: 'Mar 18, 2026',
    allowMultiple: false,
  },
]

/* ── Helpers ───────────────────────────────────────── */
function getStatusStyle(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200'
    case 'ended':
      return 'bg-gray-100 text-gray-500 border-gray-200'
    case 'draft':
      return 'bg-amber-50 text-amber-600 border-amber-200'
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'poll':
      return <BarChart3 size={13} />
    case 'rating':
      return <Star size={13} />
    case 'feedback':
      return <MessageSquare size={13} />
    default:
      return <BarChart3 size={13} />
  }
}

function getAvgRating(options: PollOption[]) {
  let total = 0
  let count = 0
  options.forEach((o, i) => {
    total += (i + 1) * o.votes
    count += o.votes
  })
  return count ? (total / count).toFixed(1) : '0.0'
}

/* ── Component ─────────────────────────────────────── */
function PollsPage() {
  const [polls, setPolls] = useState(initialPolls)
  const [filter, setFilter] = useState<'all' | 'active' | 'ended' | 'draft'>('all')
  const [expandedId, setExpandedId] = useState<string | null>('1')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Create poll form state
  const [newQuestion, setNewQuestion] = useState('')
  const [newType, setNewType] = useState<'poll' | 'rating' | 'feedback'>('poll')
  const [newOptions, setNewOptions] = useState(['', ''])

  const filtered = polls.filter((p) => filter === 'all' || p.status === filter)

  const totalResponses = polls.reduce((s, p) => s + p.totalVotes, 0)
  const activeCount = polls.filter((p) => p.status === 'active').length

  function handleCopyLink(pollId: string) {
    navigator.clipboard.writeText(`https://linkgrove.ee/poll/${pollId}`)
    setCopiedId(pollId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleToggleStatus(id: string) {
    setPolls((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'ended' : 'active' } as Poll
          : p,
      ),
    )
  }

  function handleDelete(id: string) {
    setPolls((prev) => prev.filter((p) => p.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function handleAddOption() {
    if (newOptions.length < 8) {
      setNewOptions((prev) => [...prev, ''])
    }
  }

  function handleRemoveOption(idx: number) {
    if (newOptions.length > 2) {
      setNewOptions((prev) => prev.filter((_, i) => i !== idx))
    }
  }

  function handleUpdateOption(idx: number, value: string) {
    setNewOptions((prev) => prev.map((o, i) => (i === idx ? value : o)))
  }

  function handleCreatePoll() {
    if (!newQuestion.trim()) return
    const validOptions = newOptions.filter((o) => o.trim())
    if (newType !== 'rating' && validOptions.length < 2) return

    const options: PollOption[] =
      newType === 'rating'
        ? [1, 2, 3, 4, 5].map((n) => ({
            id: `${Date.now()}-${n}`,
            text: '⭐'.repeat(n),
            votes: 0,
          }))
        : validOptions.map((text, i) => ({
            id: `${Date.now()}-${i}`,
            text,
            votes: 0,
          }))

    const poll: Poll = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      type: newType,
      options,
      totalVotes: 0,
      status: 'active',
      createdAt: 'Just now',
      allowMultiple: false,
    }

    setPolls((prev) => [poll, ...prev])
    setNewQuestion('')
    setNewType('poll')
    setNewOptions(['', ''])
    setShowCreate(false)
    setExpandedId(poll.id)
  }

  /* ── Render ─────────────────────────────────────── */
  return (
    <div className="flex-1 px-6 py-6 sm:px-10 lg:px-12">
      {/* ─── Header ─── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 shadow-md shadow-orange-400/20">
            <BarChart size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              Polls & Feedback
            </h1>
            <p className="text-xs text-gray-400">
              Engage your audience with interactive polls
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 px-5 py-2.5 font-sans text-xs font-bold text-white shadow-md shadow-orange-400/20 transition-all hover:shadow-lg hover:shadow-orange-400/25 active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.5} />
          Create Poll
        </button>
      </div>

      {/* ─── Stats row ─── */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Total Polls',
            value: polls.length,
            icon: <BarChart3 size={16} />,
            color: 'text-orange-500',
            bg: 'bg-orange-500/8',
          },
          {
            label: 'Total Responses',
            value: totalResponses.toLocaleString(),
            icon: <Users size={16} />,
            color: 'text-rose-500',
            bg: 'bg-rose-500/8',
          },
          {
            label: 'Active Polls',
            value: activeCount,
            icon: <TrendingUp size={16} />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/8',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group flex items-center gap-3.5 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400">{stat.label}</p>
              <p className="text-base font-extrabold tracking-tight text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Create Poll Modal ─── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-rose-500">
                  <Sparkles size={13} className="text-white" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Create New Poll</h2>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex flex-col gap-4 p-6">
              {/* Type selector */}
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">Type</label>
                <div className="flex gap-2">
                  {([
                    { key: 'poll' as const, label: 'Poll', icon: <BarChart3 size={14} /> },
                    { key: 'rating' as const, label: 'Rating', icon: <Star size={14} /> },
                    { key: 'feedback' as const, label: 'Feedback', icon: <MessageSquare size={14} /> },
                  ]).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setNewType(t.key)}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 font-sans text-xs font-semibold transition-all ${
                        newType === t.key
                          ? 'border-orange-300 bg-orange-50/60 text-orange-600 shadow-sm'
                          : 'border-gray-200 bg-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {t.icon}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">Question</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Ask your audience something…"
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                />
              </div>

              {/* Options (hidden for rating type) */}
              {newType !== 'rating' && (
                <div>
                  <label className="mb-2 block text-xs font-bold text-gray-700">Options</label>
                  <div className="flex flex-col gap-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold text-gray-300">
                          <Hash size={11} />
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          className="h-10 flex-1 rounded-lg border border-gray-200 bg-gray-50/60 px-3 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-orange-300 focus:bg-white"
                        />
                        {newOptions.length > 2 && (
                          <button
                            onClick={() => handleRemoveOption(idx)}
                            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {newOptions.length < 8 && (
                    <button
                      onClick={handleAddOption}
                      className="mt-2 flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-sans text-xs font-medium text-orange-500 transition-colors hover:text-orange-600"
                    >
                      <Plus size={12} />
                      Add option
                    </button>
                  )}
                </div>
              )}

              {newType === 'rating' && (
                <div className="rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                  <p className="text-xs text-gray-400">
                    A 5-star rating scale will be automatically generated for this poll.
                  </p>
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={18}
                        className="text-amber-400"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowCreate(false)}
                className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-transparent px-5 font-sans text-xs font-semibold text-gray-600 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePoll}
                disabled={
                  !newQuestion.trim() ||
                  (newType !== 'rating' && newOptions.filter((o) => o.trim()).length < 2)
                }
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-rose-500 px-5 font-sans text-xs font-bold text-white shadow-md shadow-orange-400/20 transition-all hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <Send size={13} />
                Publish Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Filter tabs ─── */}
      <div className="mb-5 flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
        {([
          { key: 'all' as const, label: `All (${polls.length})` },
          { key: 'active' as const, label: `Active (${polls.filter((p) => p.status === 'active').length})` },
          { key: 'ended' as const, label: `Ended (${polls.filter((p) => p.status === 'ended').length})` },
          { key: 'draft' as const, label: `Drafts (${polls.filter((p) => p.status === 'draft').length})` },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`cursor-pointer rounded-md border-none px-3.5 py-1.5 font-sans text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Polls list ─── */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((poll) => {
            const isExpanded = expandedId === poll.id
            const isCopied = copiedId === poll.id
            const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1)

            return (
              <div
                key={poll.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-gray-200 hover:shadow-sm"
              >
                {/* Poll header (always visible) */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-4"
                  onClick={() => setExpandedId(isExpanded ? null : poll.id)}
                >
                  {/* Type icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      poll.type === 'poll'
                        ? 'bg-orange-500/8 text-orange-500'
                        : poll.type === 'rating'
                          ? 'bg-amber-500/8 text-amber-500'
                          : 'bg-rose-500/8 text-rose-500'
                    }`}
                  >
                    {getTypeIcon(poll.type)}
                  </div>

                  {/* Question + meta */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-gray-900">
                      {poll.question}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusStyle(
                          poll.status,
                        )}`}
                      >
                        {poll.status}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Users size={10} />
                        {poll.totalVotes.toLocaleString()} response
                        {poll.totalVotes !== 1 && 's'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-300">
                        <Clock size={10} />
                        {poll.createdAt}
                      </span>
                      {poll.type === 'rating' && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                          <Star size={10} fill="currentColor" />
                          {getAvgRating(poll.options)} avg
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expand chevron */}
                  <div className="shrink-0 text-gray-300">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                    {/* Results bars */}
                    <div className="mb-4 flex flex-col gap-2">
                      {poll.options.map((option) => {
                        const pct =
                          poll.totalVotes > 0
                            ? Math.round((option.votes / poll.totalVotes) * 100)
                            : 0
                        const isLeading = option.votes === maxVotes && option.votes > 0

                        return (
                          <div key={option.id} className="group/option">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">
                                {option.text}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-gray-500">
                                  {option.votes.toLocaleString()} vote
                                  {option.votes !== 1 && 's'}
                                </span>
                                <span
                                  className={`min-w-[36px] text-right text-[11px] font-bold ${
                                    isLeading ? 'text-orange-500' : 'text-gray-400'
                                  }`}
                                >
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                  isLeading
                                    ? 'bg-gradient-to-r from-orange-400 to-rose-500'
                                    : 'bg-gray-300'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Share link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyLink(poll.id)
                        }}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                        }`}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? 'Copied!' : 'Copy link'}
                      </button>

                      <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600">
                        <Share2 size={12} />
                        Share
                      </button>

                      <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600">
                        <Eye size={12} />
                        Preview
                      </button>

                      <div className="flex-1" />

                      {/* Toggle status */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus(poll.id)
                        }}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          poll.status === 'active'
                            ? 'bg-transparent text-emerald-500 hover:bg-emerald-50'
                            : 'bg-transparent text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {poll.status === 'active' ? (
                          <>
                            <ToggleRight size={16} />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} />
                            Ended
                          </>
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(poll.id)
                        }}
                        className="flex cursor-pointer items-center rounded-lg border-none bg-transparent px-2 py-1.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : polls.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/10 to-rose-500/5">
              <BarChart size={28} className="text-orange-500" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-rose-500 shadow-lg shadow-orange-400/30">
              <Plus size={12} className="text-white" />
            </div>
          </div>
          <h3 className="mb-1.5 text-sm font-bold text-gray-900">
            No polls yet
          </h3>
          <p className="mb-5 max-w-[280px] text-center text-xs leading-relaxed text-gray-400">
            Create your first poll to start collecting feedback from your audience instantly.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 px-5 py-2.5 font-sans text-xs font-bold text-white shadow-md shadow-orange-400/20 transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={2.5} />
            Create your first poll
          </button>
        </div>
      ) : (
        /* ── No filter results ── */
        <div className="flex flex-col items-center justify-center py-14">
          <AlertCircle size={28} className="mb-3 text-gray-200" />
          <p className="text-sm font-semibold text-gray-500">
            No {filter} polls found
          </p>
          <p className="text-xs text-gray-400">Try a different filter</p>
        </div>
      )}
    </div>
  )
}
