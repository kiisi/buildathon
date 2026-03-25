import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import connectToDatabase from '../../lib/db'
import ShortLink from '../../models/ShortLink'

const resolveShortCodeFn = createServerFn()
  .inputValidator(z.object({ code: z.string() }))
  .handler(async ({ data }) => {
    await connectToDatabase()
    const link = await ShortLink.findOne({ shortCode: data.code, enabled: true }).lean() as any
    if (!link) return null
    // increment clicks in background
    await ShortLink.updateOne({ _id: link._id }, { $inc: { clicks: 1 } })
    return link.originalUrl as string
  })

export const Route = createFileRoute('/s/$code')({
  loader: async ({ params }) => {
    const url = await resolveShortCodeFn({ data: { code: params.code } })
    if (url) throw redirect({ href: url })
    return { notFound: true }
  },
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white">
      <p className="text-2xl font-extrabold text-gray-900">Link not found</p>
      <p className="text-sm text-gray-400">This short link doesn't exist or has been disabled.</p>
      <a href="/" className="mt-2 text-sm font-semibold text-[#1069f9] hover:underline">
        Go to Linkgrove
      </a>
    </div>
  )
}
