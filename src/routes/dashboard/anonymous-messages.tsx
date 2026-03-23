import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  EyeOff,
  Copy,
  Share2,
  Trash2,
  MessageSquare,
  Clock,
  Link2,
  Check,
  Heart,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/anonymous-messages')({
  component: AnonMessagesPage,
})

// Mock messages
const initialMessages = [
  {
    id: '1',
    text: 'You are honestly one of the most talented developers I have seen. Keep pushing! 🔥',
    timestamp: '2 minutes ago',
    liked: true,
  },
  {
    id: '2',
    text: 'I love your content! Can you make a tutorial on building REST APIs with Go?',
    timestamp: '15 minutes ago',
    liked: false,
  },
  {
    id: '3',
    text: 'Your LinkGrove page design is 🔥🔥🔥. What tools do you use?',
    timestamp: '1 hour ago',
    liked: false,
  },
  {
    id: '4',
    text: "I've been following you for a while. Your growth is inspiring. Don't stop!",
    timestamp: '3 hours ago',
    liked: true,
  },
  {
    id: '5',
    text: 'Can we collaborate on a project sometime? I think our skills complement each other 🤝',
    timestamp: '5 hours ago',
    liked: false,
  },
  {
    id: '6',
    text: 'Your Spotify playlist is absolute vibes. What genre do you prefer when coding?',
    timestamp: 'Yesterday',
    liked: false,
  },
]

function AnonMessagesPage() {
  const [messages, setMessages] = useState(initialMessages)
  const [filter, setFilter] = useState<'all' | 'liked'>('all')
  const [copied, setCopied] = useState(false)

  const shareLink = 'linkgrove.ee/anon/devkiisi'

  const filteredMessages = messages.filter((msg) => {
    return filter === 'all' || msg.liked
  })

  function handleCopyLink() {
    navigator.clipboard.writeText(`https://${shareLink}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleLike(id: string) {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, liked: !msg.liked } : msg)),
    )
  }

  function handleDelete(id: string) {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  return (
    <div className="flex-1 px-6 py-6 sm:px-10 lg:px-12">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1069f9]/10">
            <EyeOff size={16} className="text-[#1069f9]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
              Anonymous Messages
            </h1>
            <p className="text-xs text-gray-400">{messages.length} messages</p>
          </div>
        </div>

        {/* Share link */}
        <button
          onClick={handleCopyLink}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 transition-colors hover:border-[#1069f9]/30"
        >
          <Link2 size={13} className="text-[#1069f9]" />
          <span className="text-xs font-medium text-gray-500">{shareLink}</span>
          {copied ? (
            <Check size={13} className="text-green-500" />
          ) : (
            <Copy size={13} className="text-gray-300" />
          )}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 w-fit">
        {[
          { key: 'all' as const, label: `All (${messages.length})` },
          { key: 'liked' as const, label: `Liked (${messages.filter((m) => m.liked).length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`cursor-pointer rounded-md border-none px-3.5 py-1.5 font-sans text-xs font-semibold transition-all ${
              filter === tab.key
                ? 'bg-white text-gray-900'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {filteredMessages.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="group rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200"
            >
              {/* Top row */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1069f9]/10">
                    <EyeOff size={10} className="text-[#1069f9]" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-400">Anonymous</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock size={10} />
                  <span className="text-[11px]">{msg.timestamp}</span>
                </div>
              </div>

              {/* Message */}
              <p className="mb-3 text-sm leading-relaxed text-gray-700">{msg.text}</p>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleLike(msg.id)}
                  className={`flex cursor-pointer items-center gap-1 rounded-md border-none px-2 py-1 text-[11px] font-medium transition-colors ${
                    msg.liked
                      ? 'bg-red-50 text-red-500'
                      : 'bg-transparent text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                  }`}
                >
                  <Heart size={12} fill={msg.liked ? 'currentColor' : 'none'} />
                  {msg.liked ? 'Liked' : 'Like'}
                </button>

                <button className="flex cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-2 py-1 text-[11px] font-medium text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-500">
                  <Share2 size={12} />
                  Share
                </button>

                <button
                  onClick={() => handleDelete(msg.id)}
                  className="ml-auto flex cursor-pointer items-center gap-1 rounded-md border-none bg-transparent px-2 py-1 text-[11px] font-medium text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-[#1069f9]/10">
            <MessageSquare size={24} className="text-[#1069f9]" />
          </div>
          <h3 className="mb-1 text-sm font-bold text-gray-900">No messages yet</h3>
          <p className="mb-4 text-center text-xs text-gray-400">
            Share your anonymous link to start receiving messages
          </p>
          <button
            onClick={handleCopyLink}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1069f9] px-4 py-2 font-sans text-xs font-bold text-white transition-all hover:bg-[#0b5ad4] active:scale-[0.98]"
          >
            <Copy size={13} />
            Copy your link
          </button>
        </div>
      )}
    </div>
  )
}
