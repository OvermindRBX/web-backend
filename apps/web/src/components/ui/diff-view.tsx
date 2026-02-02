"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react"

interface DiffLine {
  type: "add" | "remove" | "unchanged"
  content: string
  oldline?: number
  newline?: number
}

interface DiffViewProps {
  oldcontent: string
  newcontent: string
  filename?: string
  language?: string
  collapsible?: boolean
  maxunchanged?: number
}

function computediff(oldtext: string, newtext: string): DiffLine[] {
  const oldlines = oldtext.split("\n")
  const newlines = newtext.split("\n")
  const result: DiffLine[] = []
  
  let oldidx = 0
  let newidx = 0
  
  while (oldidx < oldlines.length || newidx < newlines.length) {
    const oldline = oldlines[oldidx]
    const newline = newlines[newidx]
    
    if (oldidx >= oldlines.length) {
      result.push({ type: "add", content: newline, newline: newidx + 1 })
      newidx++
    } else if (newidx >= newlines.length) {
      result.push({ type: "remove", content: oldline, oldline: oldidx + 1 })
      oldidx++
    } else if (oldline === newline) {
      result.push({ type: "unchanged", content: oldline, oldline: oldidx + 1, newline: newidx + 1 })
      oldidx++
      newidx++
    } else {
      const lookaheadold = oldlines.slice(oldidx + 1, oldidx + 5)
      const lookaheadnew = newlines.slice(newidx + 1, newidx + 5)
      
      if (lookaheadnew.includes(oldline)) {
        result.push({ type: "add", content: newline, newline: newidx + 1 })
        newidx++
      } else if (lookaheadold.includes(newline)) {
        result.push({ type: "remove", content: oldline, oldline: oldidx + 1 })
        oldidx++
      } else {
        result.push({ type: "remove", content: oldline, oldline: oldidx + 1 })
        result.push({ type: "add", content: newline, newline: newidx + 1 })
        oldidx++
        newidx++
      }
    }
  }
  
  return result
}

function groupdiff(lines: DiffLine[], maxunchanged: number): { lines: DiffLine[]; collapsed: boolean }[] {
  const groups: { lines: DiffLine[]; collapsed: boolean }[] = []
  let currentgroup: DiffLine[] = []
  let unchangedcount = 0
  
  for (const line of lines) {
    if (line.type === "unchanged") {
      unchangedcount++
      currentgroup.push(line)
      
      if (unchangedcount > maxunchanged && currentgroup.length > maxunchanged) {
        const contextbefore = currentgroup.slice(0, 3)
        const collapsedlines = currentgroup.slice(3, -3)
        const contextafter = currentgroup.slice(-3)
        
        if (contextbefore.length > 0) {
          groups.push({ lines: contextbefore, collapsed: false })
        }
        if (collapsedlines.length > 0) {
          groups.push({ lines: collapsedlines, collapsed: true })
        }
        currentgroup = contextafter
        unchangedcount = contextafter.length
      }
    } else {
      if (unchangedcount > maxunchanged) {
        const contextlines = currentgroup.slice(-3)
        const collapsedlines = currentgroup.slice(0, -3)
        
        if (collapsedlines.length > 0) {
          groups.push({ lines: collapsedlines, collapsed: true })
        }
        currentgroup = contextlines
      }
      
      unchangedcount = 0
      currentgroup.push(line)
    }
  }
  
  if (currentgroup.length > 0) {
    groups.push({ lines: currentgroup, collapsed: false })
  }
  
  return groups
}

export function DiffView({ 
  oldcontent, 
  newcontent, 
  filename, 
  language,
  collapsible = true,
  maxunchanged = 6 
}: DiffViewProps) {
  const [copied, setCopied] = React.useState(false)
  const [expandedgroups, setExpandedgroups] = React.useState<Set<number>>(new Set())
  
  const difflines = React.useMemo(() => computediff(oldcontent, newcontent), [oldcontent, newcontent])
  const groups = React.useMemo(() => 
    collapsible ? groupdiff(difflines, maxunchanged) : [{ lines: difflines, collapsed: false }],
    [difflines, collapsible, maxunchanged]
  )
  
  const stats = React.useMemo(() => {
    let added = 0
    let removed = 0
    for (const line of difflines) {
      if (line.type === "add") added++
      else if (line.type === "remove") removed++
    }
    return { added, removed }
  }, [difflines])

  const togglegroup = (idx: number) => {
    setExpandedgroups(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const copynew = async () => {
    await navigator.clipboard.writeText(newcontent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0d0d10] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-sm font-mono text-white/70">{filename}</span>
          )}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400">+{stats.added}</span>
            <span className="text-red-400">-{stats.removed}</span>
          </div>
        </div>
        
        <button
          onClick={copynew}
          className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          title="Copy new content"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {groups.map((group, groupidx) => {
              if (group.collapsed && !expandedgroups.has(groupidx)) {
                return (
                  <tr key={groupidx}>
                    <td colSpan={3}>
                      <button
                        onClick={() => togglegroup(groupidx)}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.02] transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        {group.lines.length} unchanged lines
                      </button>
                    </td>
                  </tr>
                )
              }
              
              return group.lines.map((line, lineidx) => (
                <tr
                  key={`${groupidx}-${lineidx}`}
                  className={cn({
                    "bg-emerald-500/10": line.type === "add",
                    "bg-red-500/10": line.type === "remove",
                  })}
                >
                  <td className="w-12 px-2 py-0.5 text-right text-white/20 select-none border-r border-white/[0.04]">
                    {line.oldline || ""}
                  </td>
                  <td className="w-12 px-2 py-0.5 text-right text-white/20 select-none border-r border-white/[0.04]">
                    {line.newline || ""}
                  </td>
                  <td className="px-4 py-0.5 whitespace-pre">
                    <span className={cn(
                      "inline-block w-4 text-center mr-2",
                      line.type === "add" && "text-emerald-400",
                      line.type === "remove" && "text-red-400"
                    )}>
                      {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                    </span>
                    <span className={cn(
                      line.type === "add" && "text-emerald-300/90",
                      line.type === "remove" && "text-red-300/90",
                      line.type === "unchanged" && "text-white/60"
                    )}>
                      {line.content}
                    </span>
                  </td>
                </tr>
              ))
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function InlineDiff({ oldtext, newtext }: { oldtext: string; newtext: string }) {
  if (oldtext === newtext) {
    return <span className="text-white/60">{oldtext}</span>
  }
  
  return (
    <span>
      <span className="bg-red-500/20 text-red-300 line-through">{oldtext}</span>
      <span className="mx-1">→</span>
      <span className="bg-emerald-500/20 text-emerald-300">{newtext}</span>
    </span>
  )
}
