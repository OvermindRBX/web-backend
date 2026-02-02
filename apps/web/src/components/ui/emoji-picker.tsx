"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const EMOJI_CATEGORIES = {
  reactions: ["👍", "👎", "❤️", "🔥", "⭐", "✨", "🎉", "🚀", "💯", "👏", "🙌", "💪"],
  faces: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗"],
  gestures: ["👋", "🤚", "🖐️", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🫰", "🤟", "🤘", "🤙"],
  symbols: ["✅", "❌", "❓", "❗", "💡", "💭", "💬", "🔔", "📌", "🏷️", "🔗", "📎", "🎯", "🎪", "🎨", "🎭"],
  objects: ["💻", "🖥️", "📱", "⌨️", "🖱️", "💾", "📀", "🎮", "🕹️", "🔧", "🔨", "⚙️", "🛠️", "📦", "📁", "📂"],
  nature: ["🌟", "⚡", "🌈", "☀️", "🌙", "⭐", "🌸", "🌺", "🌻", "🌿", "🍀", "🌴", "🌊", "🔥", "💧", "❄️"],
}

interface EmojiPickerProps {
  open: boolean
  onclose: () => void
  onselect: (emoji: string) => void
  position?: { x: number; y: number }
}

export function EmojiPicker({ open, onclose, onselect, position }: EmojiPickerProps) {
  const [category, setCategory] = React.useState<keyof typeof EMOJI_CATEGORIES>("reactions")
  const pickerref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleclick = (e: MouseEvent) => {
      if (pickerref.current && !pickerref.current.contains(e.target as Node)) {
        onclose()
      }
    }
    const handlekey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onclose()
    }
    
    if (open) {
      document.addEventListener("mousedown", handleclick)
      document.addEventListener("keydown", handlekey)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleclick)
      document.removeEventListener("keydown", handlekey)
    }
  }, [open, onclose])

  if (!open) return null

  const style: React.CSSProperties = position
    ? { position: "fixed", left: position.x, top: position.y }
    : {}

  return (
    <div
      ref={pickerref}
      style={style}
      className={cn(
        "z-[100] w-[280px] bg-[#1a1a1f]/95 backdrop-blur-xl",
        "border border-white/[0.08] rounded-xl shadow-2xl",
        "animate-in zoom-in-95 fade-in-0 duration-150",
        !position && "absolute bottom-full right-0 mb-2"
      )}
    >
      <div className="flex gap-1 p-2 border-b border-white/[0.06] overflow-x-auto scrollbar-none">
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat as keyof typeof EMOJI_CATEGORIES)}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
              category === cat
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/70 hover:bg-white/5"
            )}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-2 max-h-[200px] overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[category].map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onselect(emoji)
                onclose()
              }}
              className="p-1.5 rounded-md text-lg hover:bg-white/[0.08] active:scale-90 transition-all duration-100"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function QuickEmojiBar({ onselect }: { onselect: (emoji: string) => void }) {
  const quickemojis = ["👍", "❤️", "🔥", "⭐", "🚀", "💯"]
  
  return (
    <div className="flex gap-0.5">
      {quickemojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onselect(emoji)}
          className="p-1 rounded-md text-sm hover:bg-white/[0.08] active:scale-90 transition-all duration-100"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
