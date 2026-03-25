import {
  GripVertical,
  Pencil,
  Share2,
  Link2,
  Image,
  Star,
  Copy,
  ExternalLink,
  BarChart3,
  Trash2,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export interface LinkCardProps {
  id: string
  title: string
  url: string
  icon?: React.ReactNode
  enabled?: boolean
  clicks?: number
  onChange: (id: string, updates: { title?: string; url?: string; enabled?: boolean }) => void
  onDelete: (id: string) => void
}

export default function LinkCard({
  id,
  title,
  url,
  icon,
  enabled = false,
  clicks = 0,
  onChange,
  onDelete,
}: LinkCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(title)

  const [isEditingUrl, setIsEditingUrl] = useState(false)
  const [editUrl, setEditUrl] = useState(url)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditingTitle) titleInputRef.current?.focus()
  }, [isEditingTitle])

  useEffect(() => {
    if (isEditingUrl) urlInputRef.current?.focus()
  }, [isEditingUrl])

  function handleSaveTitle() {
    setIsEditingTitle(false)
    if (editTitle !== title) {
      onChange(id, { title: editTitle })
    }
  }

  function handleSaveUrl() {
    setIsEditingUrl(false)
    if (editUrl !== url) {
      onChange(id, { url: editUrl })
    }
  }

  return (
    <div
      className={`rounded-2xl border bg-white p-4 transition-shadow ${
        enabled ? 'border-[#1069f9]/30 shadow-sm' : 'border-gray-200'
      }`}
    >
      <div className="mb-2 flex items-start gap-2">
        <button className="mt-1 shrink-0 cursor-grab border-none bg-transparent p-0 text-gray-300 hover:text-gray-500">
          <GripVertical size={16} />
        </button>
        <div className="flex-1 overflow-hidden">
          {/* Title Editor */}
          <div className="flex items-center gap-1.5 mb-1">
            {isEditingTitle ? (
              <div className="flex items-center w-full max-w-sm">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  onBlur={handleSaveTitle}
                  className="w-full text-sm font-bold text-gray-900 outline-none border-b border-[#1069f9] bg-transparent pb-0.5"
                />
              </div>
            ) : (
              <>
                <span className="text-sm font-bold text-gray-900 truncate">
                  {title || 'Title'}
                </span>
                <Pencil
                  size={12}
                  className="cursor-pointer text-gray-300 hover:text-gray-500 shrink-0"
                  onClick={() => setIsEditingTitle(true)}
                />
              </>
            )}
          </div>
          
          {/* URL Editor */}
          <div className="flex items-center gap-1.5">
            {isEditingUrl ? (
              <div className="flex items-center w-full max-w-sm">
                <input
                  ref={urlInputRef}
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUrl()}
                  onBlur={handleSaveUrl}
                  placeholder="URL"
                  className="w-full text-xs text-gray-600 outline-none border-b border-[#1069f9] bg-transparent pb-0.5"
                />
              </div>
            ) : (
              <>
                <span className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-xs cursor-pointer hover:text-gray-600" onClick={() => setIsEditingUrl(true)}>
                  {url || 'URL'}
                </span>
                <Pencil
                  size={10}
                  className="cursor-pointer text-gray-300 hover:text-gray-500 shrink-0"
                  onClick={() => setIsEditingUrl(true)}
                />
              </>
            )}
          </div>
        </div>
        
        {/* Actions side */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="cursor-pointer border-none bg-transparent p-1 text-gray-300 hover:text-gray-500 hidden sm:block">
            <Share2 size={16} />
          </button>
          {/* Toggle */}
          <button
            onClick={() => onChange(id, { enabled: !enabled })}
            className={`relative h-6 w-11 cursor-pointer rounded-full border-none transition-colors duration-200 ${
              enabled ? 'bg-[#22c55e]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-in-out ${
                enabled ? 'left-[22px]' : 'left-[2px]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action icons row */}
      <div className="mt-3 flex items-center gap-1">
        <span className="mr-1 shrink-0 text-gray-400 flex items-center justify-center w-6">{icon || <Link2 size={16} />}</span>
        <ActionBtn icon={<Image size={14} />} />
        <ActionBtn icon={<Star size={14} />} />
        <ActionBtn icon={<Copy size={14} />} onClick={() => navigator.clipboard.writeText(url)} />
        <ActionBtn icon={<ExternalLink size={14} />} onClick={() => url && window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')} />
        
        <span className="ml-2 flex items-center gap-1 text-xs text-gray-400" title="Analytics">
          <BarChart3 size={12} />
          {clicks} clicks
        </span>
        <button 
          onClick={() => onDelete(id)}
          className="ml-auto cursor-pointer border-none bg-transparent p-1 text-gray-300 hover:text-red-500 transition-colors"
          title="Delete Link"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function ActionBtn({ icon, onClick }: { icon: React.ReactNode, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="cursor-pointer rounded-md border-none bg-transparent p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700">
      {icon}
    </button>
  )
}
