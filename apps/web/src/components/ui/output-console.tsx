"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Terminal, X, Maximize2, Minimize2, Trash2, Download, ChevronDown, ChevronUp } from "lucide-react"

type LogLevel = "info" | "warn" | "error" | "success" | "debug"

interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  source?: string
}

interface OutputConsoleProps {
  logs: LogEntry[]
  onClear?: () => void
  className?: string
  defaultCollapsed?: boolean
  maxHeight?: number
}

const levelstyles: Record<LogLevel, { text: string; bg: string; label: string }> = {
  info: { text: "text-white/70", bg: "bg-transparent", label: "INFO" },
  warn: { text: "text-amber-400", bg: "bg-amber-500/5", label: "WARN" },
  error: { text: "text-red-400", bg: "bg-red-500/5", label: "ERROR" },
  success: { text: "text-emerald-400", bg: "bg-emerald-500/5", label: "OK" },
  debug: { text: "text-violet-400", bg: "bg-violet-500/5", label: "DEBUG" },
}

function formattime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function OutputConsole({ 
  logs,
  onClear,
  className,
  defaultCollapsed = false,
  maxHeight = 300 
}: OutputConsoleProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [maximized, setMaximized] = React.useState(false)
  const [filter, setFilter] = React.useState<LogLevel | "all">("all")
  const scrollref = React.useRef<HTMLDivElement>(null)
  const [autoscroll, setAutoscroll] = React.useState(true)

  const filteredlogs = React.useMemo(() => {
    if (filter === "all") return logs
    return logs.filter(log => log.level === filter)
  }, [logs, filter])

  React.useEffect(() => {
    if (autoscroll && scrollref.current) {
      scrollref.current.scrollTop = scrollref.current.scrollHeight
    }
  }, [filteredlogs, autoscroll])

  const handlescroll = () => {
    if (!scrollref.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollref.current
    const atbottom = scrollHeight - scrollTop - clientHeight < 50
    setAutoscroll(atbottom)
  }

  const exportlogs = () => {
    const content = logs.map(log => 
      `[${formattime(log.timestamp)}] [${log.level.toUpperCase()}]${log.source ? ` [${log.source}]` : ""} ${log.message}`
    ).join("\n")
    
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `overmind-logs-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const errorcount = logs.filter(l => l.level === "error").length
  const warncount = logs.filter(l => l.level === "warn").length

  return (
    <div className={cn(
      "flex flex-col bg-[#0d0d10] border border-white/[0.08] rounded-xl overflow-hidden transition-all duration-200",
      maximized && "fixed inset-4 z-[100]",
      className
    )}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            <Terminal className="w-4 h-4" />
            <span>Output</span>
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          
          {!collapsed && (
            <div className="flex items-center gap-1.5 text-xs">
              {errorcount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">{errorcount} errors</span>
              )}
              {warncount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">{warncount} warnings</span>
              )}
            </div>
          )}
        </div>
        
        {!collapsed && (
          <div className="flex items-center gap-1">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as LogLevel | "all")}
              className="h-7 px-2 text-xs bg-white/[0.04] border border-white/[0.08] rounded-md text-white/70 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="info">Info</option>
              <option value="warn">Warnings</option>
              <option value="error">Errors</option>
              <option value="success">Success</option>
              <option value="debug">Debug</option>
            </select>
            
            <button
              onClick={exportlogs}
              className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
              title="Export logs"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={onClear}
              className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            
            <button
              onClick={() => setMaximized(!maximized)}
              className="p-1.5 rounded-md text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
              title={maximized ? "Minimize" : "Maximize"}
            >
              {maximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
      
      {!collapsed && (
        <div
          ref={scrollref}
          onScroll={handlescroll}
          className="flex-1 overflow-y-auto scrollbar-thin font-mono text-xs"
          style={{ maxHeight: maximized ? "none" : maxHeight }}
        >
          {filteredlogs.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-white/30">
              No logs to display
            </div>
          ) : (
            filteredlogs.map((log) => {
              const styles = levelstyles[log.level]
              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-2 px-3 py-1 border-b border-white/[0.03] hover:bg-white/[0.02]",
                    styles.bg
                  )}
                >
                  <span className="text-sky-400/70 whitespace-nowrap">
                    [{formattime(log.timestamp)}]
                  </span>
                  <span className={cn("w-12 text-center", styles.text)}>
                    [{styles.label}]
                  </span>
                  {log.source && (
                    <span className="text-violet-400/60">[{log.source}]</span>
                  )}
                  <span className={cn("flex-1 break-all", styles.text)}>
                    {log.message}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export function useOutputLogs() {
  const [logs, setLogs] = React.useState<LogEntry[]>([])

  const addlog = React.useCallback((level: LogLevel, message: string, source?: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
      source,
    }
    setLogs(prev => [...prev, entry])
    return entry.id
  }, [])

  const clearlogs = React.useCallback(() => {
    setLogs([])
  }, [])

  const log = React.useMemo(() => ({
    info: (msg: string, src?: string) => addlog("info", msg, src),
    warn: (msg: string, src?: string) => addlog("warn", msg, src),
    error: (msg: string, src?: string) => addlog("error", msg, src),
    success: (msg: string, src?: string) => addlog("success", msg, src),
    debug: (msg: string, src?: string) => addlog("debug", msg, src),
  }), [addlog])

  return { logs, log, clearlogs }
}
