import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  EyeOff,
  Copy,
  Share2,
  Trash2,
  MessageSquare,
  Link2,
  Check,
  Heart,
  Mail,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard/anonymous-messages')({
  component: AnonMessagesPage,
})

// Mock messages
const initialMessages = [
  {
    id: '1',
    text: 'You are honestly one of the most talented developers I have seen. Keep pushing! 🔥',
    timestamp: '2m ago',
    liked: true,
    isRead: false,
    sender: 'a friend',
    theme: 'from-pink-500 to-rose-400',
  },
  {
    id: '2',
    text: 'I love your content! Can you make a tutorial on building REST APIs with Go?',
    timestamp: '15m ago',
    liked: false,
    isRead: false,
    sender: 'team NGL',
    theme: 'from-purple-500 to-indigo-500',
  },
  {
    id: '3',
    text: 'Your LinkGrove page design is 🔥🔥🔥. What tools do you use?',
    timestamp: '1h ago',
    liked: false,
    isRead: true,
    sender: 'a friend',
    theme: 'from-orange-500 to-red-500',
  },
  {
    id: '4',
    text: "I've been following you for a while. Your growth is inspiring. Don't stop!",
    timestamp: '3h ago',
    liked: true,
    isRead: false,
    sender: 'a friend',
    theme: 'from-red-500 to-rose-400',
  },
  {
    id: '5',
    text: 'Can we collaborate on a project sometime? I think our skills complement each other 🤝',
    timestamp: '5h ago',
    liked: false,
    isRead: true,
    sender: 'team NGL',
    theme: 'from-blue-500 to-cyan-400',
  },
  {
    id: '6',
    text: 'Your Spotify playlist is absolute vibes. What genre do you prefer when coding?',
    timestamp: '1d ago',
    liked: false,
    isRead: true,
    sender: 'a friend',
    theme: 'from-emerald-400 to-teal-500',
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

  function handleRead(id: string) {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isRead: true } : msg)),
    )
  }

  return (
    <div className="flex-1 px-4 pt-6 pb-12 sm:px-10 lg:px-12 mx-auto max-w-2xl w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-500">
              <EyeOff size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Inbox
              </h1>
              <p className="text-sm font-medium text-gray-500">{messages.length} messages</p>
            </div>
          </div>
        </div>

        {/* Share link */}
        <button
          onClick={handleCopyLink}
          className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 transition-all hover:bg-gray-100 border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <Link2 size={16} className="text-pink-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{shareLink}</span>
          </div>
          {copied ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-50 text-green-600">
              <Check size={14} strokeWidth={2.5} />
              <span className="text-xs font-bold">Copied</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-500">
              <Copy size={14} />
              <span className="text-xs font-bold">Copy</span>
            </div>
          )}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex items-center gap-1 overflow-hidden rounded-xl bg-gray-100/80 p-1 w-full sm:w-fit">
        {[
          { key: 'all' as const, label: `All Messages` },
          { key: 'liked' as const, label: `Liked` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 sm:flex-none cursor-pointer rounded-lg border-none px-6 py-2.5 font-sans text-sm font-bold transition-all ${
              filter === tab.key
                ? 'bg-white text-gray-900'
                : 'bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <div key={msg.id}>
              {!msg.isRead ? (
                /* Unread Message State */
                <div
                  onClick={() => handleRead(msg.id)}
                  className="flex cursor-pointer items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition-all hover:ring-pink-100 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${msg.theme} cursor-pointer`}
                    >
                      <Mail className="text-white" size={22} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className={`bg-gradient-to-r ${msg.theme} bg-clip-text text-base font-extrabold tracking-tight text-transparent`}>
                        New Message!
                      </span>
                      <span className="text-xs font-semibold text-gray-400">
                        From {msg.sender} • {msg.timestamp}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-300 transition-colors group-hover:bg-pink-50 group-hover:text-pink-400">
                    <ChevronRight size={18} strokeWidth={3} />
                  </div>
                </div>
              ) : (
                /* Read Message State */
                <div className="group rounded-2xl bg-white p-5 ring-1 ring-gray-100 transition-all hover:ring-gray-200">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Mail size={14} className="text-gray-500" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700">From {msg.sender}</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{msg.timestamp}</span>
                    </div>
                  </div>

                  <p className="mb-6 text-[15px] font-medium leading-relaxed text-gray-800">
                    {msg.text}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-t border-gray-50 pt-3">
                    <button
                      onClick={() => handleLike(msg.id)}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none px-4 py-2.5 text-xs font-bold transition-all ${
                        msg.liked
                          ? 'bg-rose-50 text-rose-500'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <Heart size={14} strokeWidth={msg.liked ? 3 : 2} fill={msg.liked ? 'currentColor' : 'none'} />
                      {msg.liked ? 'Loved' : 'Love'}
                    </button>

                    <button className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-none bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-700">
                      <Share2 size={14} strokeWidth={2} />
                      Share
                    </button>

                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="flex cursor-pointer items-center justify-center rounded-xl border-none bg-gray-50 p-2.5 text-gray-400 transition-all hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50">
              <MessageSquare size={28} className="text-pink-500" strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-lg font-extrabold text-gray-900 tracking-tight">Your inbox is empty</h3>
            <p className="mb-6 max-w-xs text-sm font-medium text-gray-500 leading-relaxed">
              Share your anonymous link on your socials to start receiving messages from your audience.
            </p>
            <button
              onClick={handleCopyLink}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-sans text-sm font-bold text-white transition-all hover:bg-gray-800 active:scale-[0.98]"
            >
              <Copy size={16} />
              Copy your link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

