"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { MoreHorizontal, Bookmark, Copy, RefreshCw, GitBranch, Trash2, Reply, X } from "lucide-react"

interface MessageMenuProps {
  onbookmark?: () => void
  oncopy?: () => void
  onregenerate?: () => void
  onbranch?: () => void
  ondelete?: () => void
  onreply?: () => void
  isbookmarked?: boolean
  showregenerate?: boolean
  showreply?: boolean
  className?: string
}

export function MessageMenu({
  onbookmark,
  oncopy,
  onregenerate,
  onbranch,
  ondelete,
  onreply,
  isbookmarked = false,
  showregenerate = false,
  showreply = true,
  className,
}: MessageMenuProps) {
  const [open, setOpen] = React.useState(false)
  const menuref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleclick = (e: MouseEvent) => {
      if (menuref.current && !menuref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener("mousedown", handleclick)
    }
    
    return () => document.removeEventListener("mousedown", handleclick)
  }, [open])

  const handleaction = (action?: () => void) => {
    action?.()
    setOpen(false)
  }

  return (
    <div ref={menuref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "p-1.5 rounded-lg transition-all duration-150",
          "text-white/30 hover:text-white/60 hover:bg-white/[0.06]",
          open && "bg-white/[0.06] text-white/60"
        )}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] py-1 bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl animate-in zoom-in-95 fade-in-0 duration-150 origin-top-right">
          {showreply && onreply && (
            <MenuButton icon={Reply} label="Reply" onclick={() => handleaction(onreply)} />
          )}
          
          {onbookmark && (
            <MenuButton
              icon={Bookmark}
              label={isbookmarked ? "Remove Bookmark" : "Bookmark"}
              onclick={() => handleaction(onbookmark)}
              active={isbookmarked}
            />
          )}
          
          {onbranch && (
            <MenuButton icon={GitBranch} label="Branch from here" onclick={() => handleaction(onbranch)} />
          )}
          
          {oncopy && (
            <MenuButton icon={Copy} label="Copy message" onclick={() => handleaction(oncopy)} />
          )}
          
          {showregenerate && onregenerate && (
            <>
              <div className="my-1 border-t border-white/[0.06]" />
              <MenuButton icon={RefreshCw} label="Regenerate" onclick={() => handleaction(onregenerate)} />
            </>
          )}
          
          {ondelete && (
            <>
              <div className="my-1 border-t border-white/[0.06]" />
              <MenuButton
                icon={Trash2}
                label="Delete"
                onclick={() => handleaction(ondelete)}
                variant="danger"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

interface MenuButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onclick: () => void
  active?: boolean
  variant?: "default" | "danger"
}

function MenuButton({ icon: Icon, label, onclick, active, variant = "default" }: MenuButtonProps) {
  return (
    <button
      onClick={onclick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
        variant === "danger"
          ? "text-red-400 hover:bg-red-500/10"
          : active
            ? "text-primary bg-primary/10"
            : "text-white/70 hover:bg-white/[0.06]"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

interface ReplyPreviewProps {
  content: string
  oncancel: () => void
}

export function ReplyPreview({ content, oncancel }: ReplyPreviewProps) {
  const truncated = content.length > 100 ? content.slice(0, 100) + "..." : content
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border-l-2 border-primary rounded-lg animate-in slide-in-from-bottom-2 duration-150">
      <Reply className="w-4 h-4 text-primary flex-shrink-0" />
      <span className="flex-1 text-sm text-white/60 truncate">{truncated}</span>
      <button
        onClick={oncancel}
        className="p-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
