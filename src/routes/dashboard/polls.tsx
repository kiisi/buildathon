import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { createServerFn } from '@tanstack/react-start'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import {
  BarChart, Plus, Trash2, Copy, Check, ToggleLeft, ToggleRight,
  Users, ChevronDown, ChevronUp, Share2, Clock, TrendingUp,
  Sparkles, X, Send, Eye, BarChart3, AlertCircle, Hash,
} from 'lucide-react'
import connectToDatabase from '../../lib/db'
import PollModel from '../../models/Poll'
import { APP_URL } from '../../lib/constants'

// ── Types ─────────────────────────────────────────────────────────────────────

type PollOption = { id: string; text: string; votes: number }
type Poll = {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
  status: 'active' | 'ended'
  createdAt: string
  allowMultiple: boolean
}

// ── Server functions ──────────────────────────────────────────────────────────

const getPollsFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')

  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const polls = await PollModel.find({ userId: session.userId }).sort({ createdAt: -1 }).lean()
  return polls.map((p: any) => ({
    id: String(p._id),
    question: p.question,
    options: p.options.map((o: any) => ({ id: String(o._id), text: o.text, votes: o.votes })),
    totalVotes: p.options.reduce((s: number, o: any) => s + o.votes, 0),
    status: p.status as 'active' | 'ended',
    createdAt: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    allowMultiple: p.allowMultiple,
  })) as Poll[]
})

const createPollFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(8),
    allowMultiple: z.boolean(),
  }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    const poll = await PollModel.create({
      userId: session.userId,
      question: data.question,
      options: data.options.map(text => ({ text, votes: 0 })),
      status: 'active',
      allowMultiple: data.allowMultiple,
    })
    return {
      id: String(poll._id),
      question: poll.question,
      options: poll.options.map((o: any) => ({ id: String(o._id), text: o.text, votes: 0 })),
      totalVotes: 0,
      status: 'active' as const,
      createdAt: 'Just now',
      allowMultiple: poll.allowMultiple,
    } as Poll
  })

const togglePollFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string(), status: z.enum(['active', 'ended']) }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await PollModel.updateOne({ _id: data.id, userId: session.userId }, { $set: { status: data.status } })
    return { ok: true }
  })

const deletePollFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await PollModel.deleteOne({ _id: data.id, userId: session.userId })
    return { ok: true }
  })

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/polls')({
  loader: async () => getPollsFn(),
  component: PollsPage,
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusStyle(status: string) {
  return status === 'active'
    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
    : 'bg-gray-100 text-gray-500 border-gray-200'
}

// ── Component ─────────────────────────────────────────────────────────────────

function PollsPage() {
  const initialPolls = Route.useLoaderData()
  const [polls, setPolls] = useState<Poll[]>(initialPolls)
  const [filter, setFilter] = useState<'all' | 'active' | 'ended'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  // Create form state
  const [newQuestion, setNewQuestion] = useState('')
  const [newOptions, setNewOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)

  const filtered = polls.filter(p => filter === 'all' || p.status === filter)
  const totalResponses = polls.reduce((s, p) => s + p.totalVotes, 0)
  const activeCount = polls.filter(p => p.status === 'active').length

  // ── Mutations ──────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: () => createPollFn({
      data: {
        question: newQuestion.trim(),
        options: newOptions.filter(o => o.trim()),
        allowMultiple,
      },
    }),
    onSuccess: (poll) => {
      setPolls(prev => [poll, ...prev])
      setExpandedId(poll.id)
      setShowCreate(false)
      setNewQuestion('')
      setNewOptions(['', ''])
      setAllowMultiple(false)
    },
    onError: (err: any) => alert(err?.message || 'Failed to create poll'),
  })

  const toggleMutation = useMutation({
    mutationFn: (vars: { id: string; status: 'active' | 'ended' }) => togglePollFn({ data: vars }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePollFn({ data: { id } }),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleToggle(poll: Poll) {
    const next = poll.status === 'active' ? 'ended' : 'active'
    setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, status: next } : p))
    toggleMutation.mutate({ id: poll.id, status: next })
  }

  function handleDelete(id: string) {
    setPolls(prev => prev.filter(p => p.id !== id))
    if (expandedId === id) setExpandedId(null)
    deleteMutation.mutate(id)
  }

  function handleCopyLink(pollId: string) {
    navigator.clipboard.writeText(`${APP_URL}/poll/${pollId}`)
    setCopiedId(pollId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const canCreate = newQuestion.trim() && newOptions.filter(o => o.trim()).length >= 2

  return (
    <div className="flex-1 px-6 pb-12 pt-6 sm:px-10 lg:px-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1069f9]">
            <BarChart size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">Polls</h1>
            <p className="text-xs text-gray-400">Engage your audience with interactive polls</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#1069f9] px-5 py-2.5 font-sans text-xs font-bold text-white transition-all hover:bg-[#0b5ad4] active:scale-[0.98]"
        >
          <Plus size={15} strokeWidth={2.5} /> Create Poll
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: 'Total Polls', value: polls.length, icon: <BarChart3 size={16} />, color: 'text-[#1069f9]', bg: 'bg-[#1069f9]/10' },
          { label: 'Total Responses', value: totalResponses.toLocaleString(), icon: <Users size={16} />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Active Polls', value: activeCount, icon: <TrendingUp size={16} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map(stat => (
          <div key={stat.label} className="group flex items-center gap-3.5 rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-105`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400">{stat.label}</p>
              <p className="text-base font-extrabold tracking-tight text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1069f9]">
                  <Sparkles size={13} className="text-white" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Create New Poll</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-6">
              {/* Question */}
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">Question</label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="Ask your audience something…"
                  autoFocus
                  className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-[#1069f9]/50 focus:bg-white focus:ring-2 focus:ring-[#1069f9]/10"
                />
              </div>

              {/* Options */}
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">Options</label>
                <div className="flex flex-col gap-2">
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Hash size={11} className="shrink-0 text-gray-300" />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => setNewOptions(prev => prev.map((o, i) => i === idx ? e.target.value : o))}
                        placeholder={`Option ${idx + 1}`}
                        className="h-10 flex-1 rounded-lg border border-gray-200 bg-gray-50/60 px-3 font-sans text-sm text-gray-800 outline-none transition-all placeholder:text-gray-300 focus:border-[#1069f9]/50 focus:bg-white"
                      />
                      {newOptions.length > 2 && (
                        <button
                          onClick={() => setNewOptions(prev => prev.filter((_, i) => i !== idx))}
                          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-transparent text-gray-300 hover:bg-red-50 hover:text-red-400"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {newOptions.length < 8 && (
                  <button
                    onClick={() => setNewOptions(prev => [...prev, ''])}
                    className="mt-2 flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-sans text-xs font-medium text-[#1069f9] hover:text-[#0b5ad4]"
                  >
                    <Plus size={12} /> Add option
                  </button>
                )}
              </div>

              {/* Allow multiple */}
              <label className="flex cursor-pointer items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setAllowMultiple(v => !v)}
                  className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full border-none transition-colors ${allowMultiple ? 'bg-[#1069f9]' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${allowMultiple ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
                <span className="text-xs font-medium text-gray-600">Allow multiple selections</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowCreate(false)} className="h-10 cursor-pointer rounded-xl border border-gray-200 bg-transparent px-5 font-sans text-xs font-semibold text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!canCreate || createMutation.isPending}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#1069f9] px-5 font-sans text-xs font-bold text-white transition-all hover:bg-[#0b5ad4] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {createMutation.isPending
                  ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Send size={13} />}
                Publish Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-5 flex w-fit items-center gap-1 rounded-lg bg-gray-100 p-0.5">
        {([
          { key: 'all' as const, label: `All (${polls.length})` },
          { key: 'active' as const, label: `Active (${polls.filter(p => p.status === 'active').length})` },
          { key: 'ended' as const, label: `Ended (${polls.filter(p => p.status === 'ended').length})` },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`cursor-pointer rounded-md border-none px-3.5 py-1.5 font-sans text-xs font-semibold transition-all ${
              filter === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Polls list */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map(poll => {
            const isExpanded = expandedId === poll.id
            const isCopied = copiedId === poll.id
            const maxVotes = Math.max(...poll.options.map(o => o.votes), 1)

            return (
              <div key={poll.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:border-gray-200">
                {/* Header row */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-4"
                  onClick={() => setExpandedId(isExpanded ? null : poll.id)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1069f9]/10 text-[#1069f9]">
                    <BarChart3 size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-gray-900">{poll.question}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyle(poll.status)}`}>
                        {poll.status}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Users size={10} /> {poll.totalVotes.toLocaleString()} response{poll.totalVotes !== 1 && 's'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-300">
                        <Clock size={10} /> {poll.createdAt}
                      </span>
                      {poll.allowMultiple && (
                        <span className="text-[10px] font-medium text-gray-400">· multi-select</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-gray-300">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3">
                    {/* Results bars */}
                    <div className="mb-4 flex flex-col gap-2.5">
                      {poll.options.map(option => {
                        const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
                        const isLeading = option.votes === maxVotes && option.votes > 0
                        return (
                          <div key={option.id}>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">{option.text}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-400">{option.votes.toLocaleString()} vote{option.votes !== 1 && 's'}</span>
                                <span className={`min-w-[34px] text-right text-[11px] font-bold ${isLeading ? 'text-[#1069f9]' : 'text-gray-400'}`}>{pct}%</span>
                              </div>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isLeading ? 'bg-[#1069f9]' : 'bg-gray-300'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={e => { e.stopPropagation(); handleCopyLink(poll.id) }}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          isCopied ? 'bg-emerald-50 text-emerald-600' : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                        }`}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? 'Copied!' : 'Copy link'}
                      </button>

                      <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <Share2 size={12} /> Share
                      </button>

                      <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-[11px] font-semibold text-gray-400 hover:bg-gray-50 hover:text-gray-600">
                        <Eye size={12} /> Preview
                      </button>

                      <div className="flex-1" />

                      <button
                        onClick={e => { e.stopPropagation(); handleToggle(poll) }}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          poll.status === 'active' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {poll.status === 'active' ? <><ToggleRight size={16} /> Active</> : <><ToggleLeft size={16} /> Ended</>}
                      </button>

                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(poll.id) }}
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
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1069f9]/10">
              <BarChart size={28} className="text-[#1069f9]" />
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1069f9]">
              <Plus size={12} className="text-white" />
            </div>
          </div>
          <h3 className="mb-1.5 text-sm font-bold text-gray-900">No polls yet</h3>
          <p className="mb-5 max-w-[280px] text-center text-xs leading-relaxed text-gray-400">
            Create your first poll to start collecting responses from your audience.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1069f9] px-5 py-2.5 font-sans text-xs font-bold text-white transition-all hover:bg-[#0b5ad4] active:scale-[0.98]"
          >
            <Plus size={14} strokeWidth={2.5} /> Create your first poll
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14">
          <AlertCircle size={28} className="mb-3 text-gray-200" />
          <p className="text-sm font-semibold text-gray-500">No {filter} polls found</p>
          <p className="text-xs text-gray-400">Try a different filter</p>
        </div>
      )}
    </div>
  )
}
