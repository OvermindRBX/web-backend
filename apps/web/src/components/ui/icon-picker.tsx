"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Search } from "lucide-react"
import * as LucideIcons from "lucide-react"

const PRESET_ICONS = [
  "Folder", "FolderOpen", "Star", "Heart", "Bookmark", "Flag", "Tag",
  "Hash", "AtSign", "Zap", "Flame", "Sparkles", "Crown", "Trophy",
  "Target", "Crosshair", "Eye", "Shield", "Lock", "Key", "Gem",
  "Diamond", "Circle", "Square", "Triangle", "Hexagon", "Octagon",
  "Code", "Terminal", "FileCode", "Braces", "Binary", "Database",
  "Server", "Cloud", "Globe", "Wifi", "Radio", "Antenna",
  "Gamepad", "Gamepad2", "Joystick", "Sword", "Swords", "Skull",
  "Ghost", "Bot", "Bug", "Puzzle", "Dice1", "Dice5",
  "Music", "Music2", "Headphones", "Volume2", "Mic", "Video",
  "Camera", "Image", "Palette", "Paintbrush", "Pencil", "Pen",
  "MessageSquare", "MessageCircle", "Mail", "Send", "Inbox", "Bell",
  "Calendar", "Clock", "Timer", "Hourglass", "Watch", "Alarm",
  "Home", "Building", "Store", "Warehouse", "Factory", "Landmark",
  "User", "Users", "UserCircle", "UserCog", "UserPlus", "UserCheck",
  "Settings", "Sliders", "Wrench", "Hammer", "Screwdriver", "Cog",
  "Sun", "Moon", "CloudSun", "CloudMoon", "Snowflake", "Umbrella",
  "Leaf", "TreeDeciduous", "Flower", "Apple", "Cherry", "Grape",
  "Coffee", "Pizza", "Cake", "Cookie", "IceCream", "Candy",
  "Car", "Truck", "Bus", "Train", "Plane", "Rocket",
  "Map", "MapPin", "Compass", "Navigation", "Route", "Signpost",
  "Book", "BookOpen", "Library", "Newspaper", "FileText", "Notebook",
  "Lightbulb", "Lamp", "FlashlightOn", "SunMedium", "Sunrise", "Sunset",
  "ThumbsUp", "ThumbsDown", "HandMetal", "Hand", "Grab", "PointerOff",
  "Check", "CheckCircle", "CheckSquare", "X", "XCircle", "XSquare",
  "Plus", "Minus", "Equal", "Percent", "Hash", "Asterisk",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Move", "Maximize",
] as const

type IconName = typeof PRESET_ICONS[number]

interface IconPickerProps {
  open: boolean
  onclose: () => void
  onselect: (icon: string) => void
  selected?: string
}

export function IconPicker({ open, onclose, onselect, selected }: IconPickerProps) {
  const [search, setSearch] = React.useState("")
  const modalref = React.useRef<HTMLDivElement>(null)

  const filteredicons = React.useMemo(() => {
    if (!search.trim()) return PRESET_ICONS
    const lower = search.toLowerCase()
    return PRESET_ICONS.filter(name => name.toLowerCase().includes(lower))
  }, [search])

  React.useEffect(() => {
    const handleclick = (e: MouseEvent) => {
      if (modalref.current && !modalref.current.contains(e.target as Node)) {
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        ref={modalref}
        className="w-[360px] max-h-[480px] bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in-0 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <h3 className="text-sm font-medium text-white">Choose Icon</h3>
          <button
            onClick={onclose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        <div className="p-3 overflow-y-auto max-h-[320px] scrollbar-thin">
          <div className="grid grid-cols-8 gap-1">
            {filteredicons.map((name) => {
              const Icon = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>
              if (!Icon) return null
              
              const isselected = selected === name
              
              return (
                <button
                  key={name}
                  onClick={() => {
                    onselect(name)
                    onclose()
                  }}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-150",
                    "hover:bg-white/[0.08] active:scale-95",
                    isselected && "bg-primary/20 ring-1 ring-primary/50"
                  )}
                  title={name}
                >
                  <Icon className={cn("w-5 h-5", isselected ? "text-primary" : "text-white/60")} />
                </button>
              )
            })}
          </div>
          
          {filteredicons.length === 0 && (
            <div className="py-8 text-center text-sm text-white/40">
              No icons found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function getIconComponent(name: string): React.ComponentType<{ className?: string }> | null {
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string }>
  return Icon || null
}
