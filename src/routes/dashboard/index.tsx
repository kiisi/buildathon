import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import LinkCard from '../../components/dashboard/LinkCard'
import LivePreview from '../../components/dashboard/LivePreview'
import connectToDatabase from '../../lib/db'
import LinkModel from '../../models/Link'
import {
  Sparkles, Settings, Plus, FolderOpen,
  Archive, ChevronRight, User, Globe,
  Instagram, Youtube, Twitch, Link2, TreePine,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

export type LinkItem = {
  id: string
  title: string
  url: string
  enabled: boolean
  order: number
  clicks: number
}

// ── Server Functions ─────────────────────────────────────────────────────────

const getLinksFn = createServerFn().handler(async () => {
  const { getSession } = await import('../../lib/session')

  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const links = await LinkModel.find({ userId: session.userId }).sort({ order: 1 }).lean()
  return links.map((l: any) => ({
    id: String(l._id),
    title: l.title,
    url: l.url,
    enabled: l.enabled,
    order: l.order,
    clicks: l.clicks,
  }))
})

const addLinkFn = createServerFn({ method: 'POST' }).handler(async () => {
  const { getSession } = await import('../../lib/session')

  const session = await getSession()
  if (!session) throw new Error('Unauthorized')
  await connectToDatabase()
  const count = await LinkModel.countDocuments({ userId: session.userId })
  const link = await LinkModel.create({
    userId: session.userId,
    title: '',
    url: '',
    enabled: true,
    order: count,
    clicks: 0,
  })
  return {
    id: String(link._id),
    title: link.title,
    url: link.url,
    enabled: link.enabled,
    order: link.order,
    clicks: link.clicks,
  }
})

const updateLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      url: z.string().optional(),
      enabled: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await LinkModel.updateOne(
      { _id: data.id, userId: session.userId },
      { $set: { title: data.title, url: data.url, enabled: data.enabled } },
    )
    return { ok: true }
  })

const deleteLinkFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getSession } = await import('../../lib/session')

    const session = await getSession()
    if (!session) throw new Error('Unauthorized')
    await connectToDatabase()
    await LinkModel.deleteOne({ _id: data.id, userId: session.userId })
    return { ok: true }
  })

// ── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute('/dashboard/')({
  loader: async () => {
    const links = await getLinksFn()
    return { links }
  },
  component: DashboardLinksPage,
})

// ── Component ────────────────────────────────────────────────────────────────

function DashboardLinksPage() {
  const { links: initialLinks } = Route.useLoaderData()
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAdd() {
    const newLink = await addLinkFn()
    setLinks((prev) => [newLink, ...prev])
  }

  async function handleUpdate(id: string, updates: Partial<LinkItem>) {
    // Optimistic update
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)))
    setSaving((s) => ({ ...s, [id]: true }))
    try {
      const current = links.find((l) => l.id === id)!
      await updateLinkFn({
        data: {
          id,
          title: updates.title ?? current.title,
          url: updates.url ?? current.url,
          enabled: updates.enabled ?? current.enabled,
        },
      })
    } finally {
      setSaving((s) => ({ ...s, [id]: false }))
    }
  }

  async function handleDelete(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    await deleteLinkFn({ data: { id } })
  }

  return (
    <>
      {/* ── Left: Editor ── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:px-10 lg:px-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Links</h1>
          <div className="flex items-center gap-2">
            <button className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 font-sans text-sm font-semibold text-gray-700 transition-all hover:border-gray-300">
              <Sparkles size={16} className="text-gray-500" />
              Enhance
            </button>
            <button className="flex cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white p-2.5 text-gray-500 transition-all hover:border-gray-300">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Profile header */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900">devkiisi</h2>
            <p className="text-sm text-gray-400">Kiisi</p>
            <div className="mt-2 flex items-center gap-2">
              {[Globe, Instagram, Youtube, Twitch].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                >
                  <Icon size={14} />
                </button>
              ))}
              <button className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-none bg-gray-100 text-gray-400 hover:bg-gray-200">
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <User size={24} className="text-gray-400" />
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="mb-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#1069f9] font-sans text-sm font-bold text-white transition-all hover:bg-[#0b5ad4] active:scale-[0.985]"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add link
        </button>

        {/* Collection row */}
        {/* <div className="mb-6 flex items-center justify-between">
          <button className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-sans text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            <FolderOpen size={14} />
            Add collection
          </button>
          <button className="flex cursor-pointer items-center gap-1 border-none bg-transparent font-sans text-xs font-semibold text-gray-500 hover:text-gray-700">
            <Archive size={14} />
            View archive
            <ChevronRight size={12} />
          </button>
        </div> */}

        {/* Link cards */}
        <div className="flex flex-col gap-3">
          {links.length > 0 ? (
            links.map((link) => (
              <LinkCard
                key={link.id}
                id={link.id}
                title={link.title}
                url={link.url}
                enabled={link.enabled}
                clicks={link.clicks}
                saving={saving[link.id]}
                onChange={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-10">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1069f9]/10">
                <Link2 size={24} className="text-[#1069f9]" />
              </div>
              <h3 className="mb-2 text-sm font-bold text-gray-900">No links yet</h3>
              <p className="max-w-[250px] text-center text-xs text-gray-500">
                Click "Add link" to create your first link and start sharing!
              </p>
            </div>
          )}
        </div>

        {/* Linkgrove footer toggle */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
          <div>
            <span className="text-sm font-bold text-gray-900">Linkgrove footer</span>
            <div className="mt-1.5 flex items-center gap-1.5">
              <TreePine size={14} className="text-[#1069f9]" />
              <span className="text-sm font-extrabold tracking-tight text-gray-900">Linkgrove</span>
            </div>
          </div>
          <button className="relative h-6 w-11 cursor-pointer rounded-full border-none bg-[#22c55e] transition-colors">
            <span className="absolute left-[22px] top-0.5 h-5 w-5 rounded-full bg-white" />
          </button>
        </div>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="hidden overflow-y-auto border-l border-gray-100 bg-white p-6 pb-12 xl:block">
        <LivePreview username="devkiisi" displayName="Kiisi" links={links} />
      </div>
    </>
  )
}
