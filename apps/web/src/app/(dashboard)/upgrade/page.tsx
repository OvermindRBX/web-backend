"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Crown, 
  Check, 
  Zap, 
  ArrowLeft,
  Rocket,
  ArrowRight,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TIERS as TIER_CONFIG, type Tier, type BillingCycle } from "@/lib/billing/tiers"

interface TierUI {
  id: Tier
  icon: React.ReactNode
  accent: string
  highlighted?: boolean
  badge?: string
}

const TIER_UI: Record<Tier, TierUI> = {
  free: {
    id: "free",
    icon: <Zap className="w-5 h-5" />,
    accent: "white/60",
  },
  pro: {
    id: "pro",
    icon: <Rocket className="w-5 h-5" />,
    accent: "violet-400",
    highlighted: true,
    badge: "Popular",
  },
  studio: {
    id: "studio",
    icon: <Crown className="w-5 h-5" />,
    accent: "amber-400",
    badge: "Best Value",
  },
}

export default function UpgradePage() {
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly")
  const [currentTier, setCurrentTier] = useState<Tier>("free")
  const [currentCycle, setCurrentCycle] = useState<BillingCycle | null>(null)
  const [loading, setLoading] = useState<Tier | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    fetchCurrentTier()
  }, [])

  async function fetchCurrentTier() {
    try {
      const res = await fetch("/api/billing")
      const data = await res.json()
      if (data.tier) {
        setCurrentTier(data.tier)
        setCurrentCycle(data.tierConfig?.billingCycle || null)
      }
    } catch {}
    finally {
      setPageLoading(false)
    }
  }

  async function handleSubscribe(tier: Tier) {
    if (tier === "free") return
    
    const isSameTierDifferentCycle = tier === currentTier && billingCycle !== currentCycle
    const isUpgrade = tier !== currentTier
    
    if (!isUpgrade && !isSameTierDifferentCycle) return
    
    setLoading(tier)
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upgrade",
          tier,
          cycle: billingCycle,
        }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccessMessage(data.message)
        setCurrentTier(tier)
        setCurrentCycle(billingCycle)
        setTimeout(() => setSuccessMessage(null), 3000)
      } else if (data.redirectTo) {
        router.push(data.redirectTo)
      }
    } catch (error) {
      console.error("upgrade failed:", error)
    } finally {
      setLoading(null)
    }
  }

  function getPrice(tierId: Tier) {
    const tier = TIER_CONFIG[tierId]
    if (tier.price === 0) return "0"
    return billingCycle === "yearly" 
      ? (tier.yearlyPrice / 12).toFixed(0) 
      : tier.price.toFixed(0)
  }

  function getOriginalPrice(tierId: Tier) {
    const tier = TIER_CONFIG[tierId]
    return tier.price.toFixed(0)
  }

  function canPurchase(tierId: Tier) {
    if (tierId === "free") return false
    if (tierId !== currentTier) return true
    return billingCycle !== currentCycle
  }

  function getButtonText(tierId: Tier) {
    const tier = TIER_CONFIG[tierId]
    if (tierId === "free") {
      return currentTier === "free" ? "Current Plan" : "Free Forever"
    }
    if (loading === tierId) return "Processing..."
    if (tierId === currentTier && billingCycle === currentCycle) return "Current Plan"
    if (tierId === currentTier && billingCycle !== currentCycle) {
      return billingCycle === "yearly" ? "Switch to Yearly" : "Switch to Monthly"
    }
    return `Get ${tier.name}`
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#08080c]">
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Button 
          variant="ghost" 
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground group"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        {successMessage && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-center animate-fade-in backdrop-blur-sm">
            <Check className="w-5 h-5 inline-block mr-2" />
            {successMessage}
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Choose your plan</h1>
          <p className="text-white/50 text-base max-w-lg mx-auto">
            Unlock more credits and features with a premium plan
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center p-1 bg-white/[0.04] border border-white/[0.06] rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-5 py-2 rounded-md text-sm font-medium transition-all duration-200",
                billingCycle === "monthly" 
                  ? "bg-white/[0.08] text-white" 
                  : "text-white/50 hover:text-white/70"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={cn(
                "px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                billingCycle === "yearly" 
                  ? "bg-white/[0.08] text-white" 
                  : "text-white/50 hover:text-white/70"
              )}
            >
              Yearly
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
          {(["free", "pro", "studio"] as Tier[]).map((tierId) => {
            const tier = TIER_CONFIG[tierId]
            const ui = TIER_UI[tierId]
            const isCurrentPlan = currentTier === tierId && (tierId === "free" || billingCycle === currentCycle)
            const purchasable = canPurchase(tierId)
            
            return (
              <div
                key={tierId}
                className={cn(
                  "relative rounded-2xl p-6 transition-all duration-300",
                  "bg-[#111115]/80 backdrop-blur-sm border",
                  ui.highlighted 
                    ? "border-violet-500/30" 
                    : "border-white/[0.06] hover:border-white/[0.12]"
                )}
              >
                {ui.badge && (
                  <div className="absolute -top-3 left-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-[10px] font-semibold",
                      tierId === "pro" 
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30" 
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    )}>
                      {ui.badge}
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400">
                      <Check className="w-3 h-3" />
                      Current
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    tierId === "free" && "bg-white/[0.06] text-white/60",
                    tierId === "pro" && "bg-violet-500/20 text-violet-400",
                    tierId === "studio" && "bg-amber-500/20 text-amber-400"
                  )}>
                    {ui.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    <p className="text-xs text-white/40">{tier.description}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">${getPrice(tierId)}</span>
                    <span className="text-white/40 text-sm">/mo</span>
                    {billingCycle === "yearly" && tier.price > 0 && (
                      <span className="text-xs text-white/30 line-through ml-1">
                        ${getOriginalPrice(tierId)}
                      </span>
                    )}
                  </div>
                  {tier.price > 0 && billingCycle === "yearly" && (
                    <p className="text-xs text-emerald-400 mt-1">
                      Save ${(tier.price * 12 - tier.yearlyPrice).toFixed(0)}/year
                    </p>
                  )}
                </div>

                <Button
                  className={cn(
                    "w-full h-10 rounded-lg font-medium transition-all duration-200 text-sm",
                    tierId === "free" 
                      ? "bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.08]"
                      : tierId === "pro"
                        ? "bg-violet-500 hover:bg-violet-400 text-white"
                        : "bg-amber-500 hover:bg-amber-400 text-black"
                  )}
                  disabled={!purchasable || loading !== null}
                  onClick={() => handleSubscribe(tierId)}
                >
                  {loading === tierId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {getButtonText(tierId)}
                      {purchasable && tierId !== "free" && <ArrowRight className="w-4 h-4 ml-1" />}
                    </>
                  )}
                </Button>

                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <ul className="space-y-2.5">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className={cn(
                          "w-4 h-4 flex-shrink-0 mt-0.5",
                          tierId === "free" && "text-white/40",
                          tierId === "pro" && "text-violet-400",
                          tierId === "studio" && "text-amber-400"
                        )} />
                        <span className="text-white/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-white/40">
            Secure payments via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
