"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.06]",
        className
      )}
    >
      <div 
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.08)_50%,transparent_100%)] bg-[length:200%_100%] animate-shimmer"
      />
    </div>
  )
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function ChatListSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <Skeleton className="w-4 h-4 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-[80%]" />
            <Skeleton className="h-2.5 w-[50%]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
  )
}

export function CreditsSkeleton() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03]">
      <Skeleton className="w-4 h-4 rounded" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}
