"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Plus, Trash2, Brain, Lightbulb, MessageSquare, AlertCircle, Search, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "./button"

interface Memory {
  id: string
  content: string
  source: "ai_learned" | "user_added" | "mistake_correction"
  enabled: boolean
  createdAt: number
}

interface MemoryManagerProps {
  open: boolean
  onclose: () => void
}

const sourcestyles = {
  ai_learned: { icon: Brain, label: "AI Learned", color: "text-violet-400" },
  user_added: { icon: Plus, label: "User Added", color: "text-emerald-400" },
  mistake_correction: { icon: AlertCircle, label: "Correction", color: "text-amber-400" },
}

export function MemoryManager({ open, onclose }: MemoryManagerProps) {
  const [memories, setMemories] = React.useState<Memory[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [newmemory, setNewmemory] = React.useState("")
  const [adding, setAdding] = React.useState(false)
  const modalref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open) {
      fetchmemories()
    }
  }, [open])

  React.useEffect(() => {
    const handlekey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onclose()
    }
    if (open) {
      document.addEventListener("keydown", handlekey)
    }
    return () => document.removeEventListener("keydown", handlekey)
  }, [open, onclose])

  async function fetchmemories() {
    setLoading(true)
    try {
      const res = await fetch("/api/memories")
      if (res.ok) {
        const data = await res.json()
        setMemories(data.memories || [])
      }
    } catch (err) {
      console.error("[MemoryManager] Failed to fetch memories:", err)
    } finally {
      setLoading(false)
    }
  }

  async function addmemory() {
    if (!newmemory.trim()) return
    setAdding(true)
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newmemory.trim(), source: "user_added" }),
      })
      if (res.ok) {
        const data = await res.json()
        setMemories(prev => [data.memory, ...prev])
        setNewmemory("")
      }
    } catch (err) {
      console.error("[MemoryManager] Failed to add memory:", err)
    } finally {
      setAdding(false)
    }
  }

  async function deletememory(id: string) {
    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setMemories(prev => prev.filter(m => m.id !== id))
      }
    } catch (err) {
      console.error("[MemoryManager] Failed to delete memory:", err)
    }
  }

  async function togglememory(id: string, enabled: boolean) {
    try {
      const res = await fetch("/api/memories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      })
      if (res.ok) {
        setMemories(prev => prev.map(m => m.id === id ? { ...m, enabled } : m))
      }
    } catch (err) {
      console.error("[MemoryManager] Failed to toggle memory:", err)
    }
  }

  const filteredmemories = React.useMemo(() => {
    if (!search.trim()) return memories
    const lower = search.toLowerCase()
    return memories.filter(m => m.content.toLowerCase().includes(lower))
  }, [memories, search])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150">
      <div
        ref={modalref}
        className="w-[560px] max-h-[80vh] bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 fade-in-0 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Brain className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-medium text-white">AI Memories</h3>
              <p className="text-xs text-white/40">{memories.length} memories saved</p>
            </div>
          </div>
          <button
            onClick={onclose}
            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/[0.06] space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memories..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newmemory}
              onChange={(e) => setNewmemory(e.target.value)}
              placeholder="Add a new memory..."
              onKeyDown={(e) => e.key === "Enter" && addmemory()}
              className="flex-1 h-10 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <Button
              onClick={addmemory}
              disabled={adding || !newmemory.trim()}
              size="sm"
              className="h-10 px-4 bg-violet-600 hover:bg-violet-500"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            </div>
          ) : filteredmemories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-white/[0.04] mb-3">
                <Lightbulb className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-sm text-white/50">
                {search ? "No memories match your search" : "No memories saved yet"}
              </p>
              <p className="text-xs text-white/30 mt-1">
                Add memories manually or let AI learn from your conversations
              </p>
            </div>
          ) : (
            filteredmemories.map((memory) => {
              const source = sourcestyles[memory.source]
              const Icon = source.icon

              return (
                <div
                  key={memory.id}
                  className={cn(
                    "group p-3 rounded-xl border transition-all duration-150",
                    memory.enabled
                      ? "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]"
                      : "bg-white/[0.01] border-white/[0.03] opacity-50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-1.5 rounded-md bg-white/[0.04]", source.color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 leading-relaxed">{memory.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={cn("text-xs", source.color)}>{source.label}</span>
                        <span className="text-xs text-white/20">•</span>
                        <span className="text-xs text-white/30">
                          {new Date(memory.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglememory(memory.id, !memory.enabled)}
                        className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
                        title={memory.enabled ? "Disable" : "Enable"}
                      >
                        {memory.enabled ? (
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deletememory(memory.id)}
                        className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-xs text-white/30 text-center">
            Memories help the AI remember important context about you and your projects
          </p>
        </div>
      </div>
    </div>
  )
}
