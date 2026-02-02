"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type TooltipPlacement = "top" | "bottom" | "left" | "right"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  placement?: TooltipPlacement
  delay?: number
  className?: string
  disabled?: boolean
}

interface TooltipContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  placement: TooltipPlacement
  triggerRef: React.RefObject<HTMLDivElement | null>
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

function useTooltipContext() {
  const context = React.useContext(TooltipContext)
  if (!context) throw new Error("Tooltip components must be used within Tooltip")
  return context
}

const placementstyles: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
}

const arrowstyles: Record<TooltipPlacement, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-white/10 border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white/10 border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-white/10 border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-white/10 border-y-transparent border-l-transparent",
}

export function Tooltip({ 
  content, 
  children, 
  placement = "top", 
  delay = 200,
  className,
  disabled = false 
}: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLDivElement>(null)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleenter = React.useCallback(() => {
    if (disabled) return
    timeoutRef.current = setTimeout(() => setOpen(true), delay)
  }, [delay, disabled])

  const handleleave = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setOpen(false)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <TooltipContext.Provider value={{ open, setOpen, placement, triggerRef }}>
      <div 
        ref={triggerRef}
        className="relative inline-flex"
        onMouseEnter={handleenter}
        onMouseLeave={handleleave}
        onFocus={handleenter}
        onBlur={handleleave}
      >
        {children}
        {open && content && (
          <div
            role="tooltip"
            className={cn(
              "absolute z-50 px-3 py-1.5 text-xs font-medium",
              "bg-[#1a1a1f]/95 backdrop-blur-xl",
              "border border-white/[0.08] rounded-lg",
              "text-white/90 shadow-xl shadow-black/20",
              "animate-in fade-in-0 zoom-in-95 duration-150",
              "whitespace-nowrap",
              placementstyles[placement],
              className
            )}
          >
            {content}
            <span 
              className={cn(
                "absolute w-0 h-0 border-4",
                arrowstyles[placement]
              )} 
            />
          </div>
        )}
      </div>
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
  const { triggerRef } = useTooltipContext()
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<HTMLDivElement> }>, {
      ref: triggerRef,
    })
  }
  
  return <span ref={triggerRef as React.RefObject<HTMLSpanElement>}>{children}</span>
}

export function TooltipContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, placement } = useTooltipContext()
  
  if (!open) return null
  
  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 px-3 py-1.5 text-xs font-medium",
        "bg-[#1a1a1f]/95 backdrop-blur-xl",
        "border border-white/[0.08] rounded-lg",
        "text-white/90 shadow-xl shadow-black/20",
        "animate-in fade-in-0 zoom-in-95 duration-150",
        placementstyles[placement],
        className
      )}
    >
      {children}
    </div>
  )
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => children
