"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-5 h-5 border-2",
  lg: "w-6 h-6 border-2",
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "rounded-full border-white/20 border-t-white animate-spin",
        sizeClasses[size],
        className
      )}
    />
  )
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size="lg" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  )
}
