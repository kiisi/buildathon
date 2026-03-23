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
  Search,
  SlidersHorizontal,
} from 'lucide-react'

// Mock messages data
const mockMessages = [
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

export default function AnonInbox() {
  const [messages, setMessages] = useState(mockMessages)
  const [filter, setFilter] = useState<'all' | 'liked'>('all')
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const shareLink = 'linkgrove.ee/anon/devkiisi'

  const filteredMessages = messages.filter((msg) => {
    const matchesFilter = filter === 'all' || msg.liked
    const matchesSearch = msg.text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
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
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1069f9]/10">
              <EyeOff size={18} className="text-[#1069f9]" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Anonymous Messages
            </h1>
          </div>
          <p className="mt-1 ml-[46px] text-sm text-gray-400">
            {messages.length} messages received
          </p>
        </div>

        {/* Share link pill */}
        <button
          onClick={handleCopyLink}
          className="flex cursor-pointer items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-[#1069f9]/30 hover:shadow"
        >
          <Link2 size={14} className="text-[#1069f9]" />
          <span className="text-sm font-medium text-gray-600">{shareLink}</span>
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Filters + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`cursor-pointer rounded-lg border-none px-4 py-1.5 font-sans text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('liked')}
            className={`cursor-pointer rounded-lg border-none px-4 py-1.5 font-sans text-xs font-semibold transition-all ${
              filter === 'liked'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Liked ({messages.filter((m) => m.liked).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 font-sans text-xs text-gray-700 outline-none transition-colors focus:border-[#1069f9] sm:w-[220px]"
          />
        </div>
      </div>

      {/* Messages list */}
      {filteredMessages.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:border-gray-200 hover:shadow"
            >
              {/* Anonymous badge */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#1069f9]/20 to-[#06b6d4]/20">
                    <EyeOff size={12} className="text-[#1069f9]" />
                  </div>
                  <span className="text-xs font-semibold text-gray-400">Anonymous</span>
                </div>
                <div className="flex items-center gap-1 text-gray-300">
                  <Clock size={11} />
                  <span className="text-[11px]">{msg.timestamp}</span>
                </div>
              </div>

              {/* Message body */}
              <p className="mb-4 text-[15px] leading-relaxed text-gray-800">{msg.text}</p>

              {/* Action row */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleLike(msg.id)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border-none px-2.5 py-1.5 text-xs font-medium transition-all ${
                    msg.liked
                      ? 'bg-red-50 text-red-500'
                      : 'bg-transparent text-gray-300 hover:bg-gray-50 hover:text-gray-500'
                  }`}
                >
                  <Heart size={14} fill={msg.liked ? 'currentColor' : 'none'} />
                  {msg.liked ? 'Liked' : 'Like'}
                </button>

                <button className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-all hover:bg-gray-50 hover:text-gray-500">
                  <Share2 size={14} />
                  Share
                </button>

                <button
                  onClick={() => handleDelete(msg.id)}
                  className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-xs font-medium text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1069f9]/10">
            <MessageSquare size={28} className="text-[#1069f9]" />
          </div>
          <h3 className="mb-1 text-base font-bold text-gray-900">No messages yet</h3>
          <p className="mb-5 text-center text-sm text-gray-400">
            Share your anonymous link to start receiving messages
          </p>
          <button
            onClick={handleCopyLink}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#1069f9] px-5 py-2.5 font-sans text-sm font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-[#0b5ad4] active:scale-[0.98]"
          >
            <Copy size={14} />
            Copy your link
          </button>
        </div>
      )}
    </div>
  )
}
