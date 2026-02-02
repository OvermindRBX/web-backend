"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"

type ToastVariant = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addtoast: (toast: Omit<Toast, "id">) => string
  removetoast: (id: string) => void
  clearall: () => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

const variantstyles: Record<ToastVariant, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: <AlertCircle className="w-4 h-4 text-red-400" />,
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  },
  info: {
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: <Info className="w-4 h-4 text-sky-400" />,
  },
}

function ToastItem({ toast, onremove }: { toast: Toast; onremove: () => void }) {
  const [progress, setProgress] = React.useState(100)
  const [exiting, setExiting] = React.useState(false)
  const duration = toast.duration ?? 5000
  const styles = variantstyles[toast.variant]

  React.useEffect(() => {
    if (duration <= 0) return

    const starttime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - starttime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        handleclose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration])

  const handleclose = () => {
    setExiting(true)
    setTimeout(onremove, 150)
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-[#1a1a1f]/95 backdrop-blur-xl",
        "border shadow-xl shadow-black/20",
        styles.border,
        exiting ? "animate-out fade-out-0 slide-out-to-right-full duration-150" : "animate-in fade-in-0 slide-in-from-right-full duration-200"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={cn("p-1.5 rounded-lg", styles.bg)}>
          {styles.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-sm font-medium text-white mb-0.5">{toast.title}</p>
          )}
          <p className="text-sm text-white/70">{toast.message}</p>
        </div>
        
        <button
          onClick={handleclose}
          className="p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div 
            className={cn("h-full transition-all duration-50", {
              "bg-emerald-500/50": toast.variant === "success",
              "bg-red-500/50": toast.variant === "error",
              "bg-amber-500/50": toast.variant === "warning",
              "bg-sky-500/50": toast.variant === "info",
            })}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addtoast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { ...toast, id }])
    return id
  }, [])

  const removetoast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearall = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addtoast, removetoast, clearall }}>
      {children}
      <ToastContainer toasts={toasts} onremove={removetoast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onremove }: { toasts: Toast[]; onremove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onremove={() => onremove(toast.id)} />
        </div>
      ))}
    </div>
  )
}

export function toast(message: string, variant: ToastVariant = "info", title?: string) {
  const event = new CustomEvent("toast", { detail: { message, variant, title } })
  window.dispatchEvent(event)
}

export function Toaster() {
  const { addtoast } = useToast()

  React.useEffect(() => {
    const handler = (e: CustomEvent<{ message: string; variant: ToastVariant; title?: string }>) => {
      addtoast(e.detail)
    }
    window.addEventListener("toast", handler as EventListener)
    return () => window.removeEventListener("toast", handler as EventListener)
  }, [addtoast])

  return null
}
