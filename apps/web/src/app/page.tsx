"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Zap, Search, FileCode, Sparkles, Code, Terminal, CheckCircle2, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Zap,
    title: "Real-time AI",
    description: "Instant responses from cutting-edge models like GPT-4, Claude, and Gemini"
  },
  {
    icon: Search,
    title: "Web Search",
    description: "Access real-time information from the web during conversations"
  },
  {
    icon: FileCode,
    title: "Code Canvas",
    description: "Interactive code visualization and live preview in your browser"
  },
  {
    icon: Sparkles,
    title: "Academy Mode",
    description: "AI-powered learning assistant that teaches as it helps"
  },
  {
    icon: Code,
    title: "Multi-Model",
    description: "Switch between GPT-4, Claude, Gemini and more on the fly"
  },
  {
    icon: Terminal,
    title: "Tool Calling",
    description: "Advanced workflows with file creation, Roblox integration, and more"
  }
]

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const progress = Math.min(scrollY / 80, 1)

  return (
    <div className="min-h-screen bg-[#08080a] overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.04),transparent)] pointer-events-none" />

      <nav 
        className="fixed z-50 transition-all duration-200 overflow-hidden"
        style={{
          top: progress * 12,
          left: '50%',
          transform: 'translateX(-50%)',
          paddingLeft: 24 - (progress * 14),
          paddingRight: 24 - (progress * 14),
          paddingTop: progress * 6,
          paddingBottom: progress * 6,
          width: `calc(100% - ${progress * 40}%)`,
          maxWidth: 1152 - (progress * 900),
          borderRadius: progress * 20,
          background: progress > 0.1 
            ? `rgba(10, 10, 12, ${0.75 + progress * 0.15})`
            : 'transparent',
          backdropFilter: progress > 0.1 ? `blur(${30 + progress * 10}px) saturate(180%)` : 'none',
          WebkitBackdropFilter: progress > 0.1 ? `blur(${30 + progress * 10}px) saturate(180%)` : 'none',
          border: progress > 0.1 ? `1px solid rgba(255,255,255,${0.05 + progress * 0.03})` : 'none',
          boxShadow: progress > 0.1 
            ? `0 8px 32px rgba(0,0,0,${progress * 0.5}), inset 0 1px 0 rgba(255,255,255,${progress * 0.05})`
            : 'none',
        }}
      >
        <div 
          className="flex items-center justify-between"
          style={{
            height: 56 - (progress * 16),
          }}
        >
          <Link href="/" className="flex items-center overflow-hidden group">
            <Brain 
              className="text-white flex-shrink-0 group-hover:scale-110"
              style={{
                width: 24 - (progress * 4),
                height: 24 - (progress * 4),
                transition: 'transform 0.2s',
              }}
            />
            <span 
              className="font-semibold text-white whitespace-nowrap overflow-hidden"
              style={{
                width: (1 - progress) * 80,
                opacity: 1 - progress,
                marginLeft: (1 - progress) * 8,
                fontSize: 16,
              }}
            >
              Overmind
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                style={{
                  height: 36 - (progress * 8),
                  paddingLeft: 16 - (progress * 6),
                  paddingRight: 16 - (progress * 6),
                  fontSize: 14 - (progress * 2),
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button 
                size="sm" 
                className="bg-white text-black hover:bg-neutral-200 font-medium hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  height: 36 - (progress * 8),
                  paddingLeft: 16 - (progress * 6),
                  paddingRight: 16 - (progress * 6),
                  fontSize: 14 - (progress * 2),
                }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-28 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6 animate-fade-in">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-neutral-700" />
              <span className="text-xs font-medium tracking-widest text-neutral-500 uppercase">Early Access</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-neutral-700" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight mb-6 animate-fade-in [animation-delay:100ms]">
              The AI assistant
              <br />
              <span className="text-neutral-500">built for developers</span>
            </h1>
            
            <p className="text-lg text-neutral-400 mb-8 leading-relaxed animate-fade-in [animation-delay:200ms]">
              Overmind combines powerful AI models with integrated tools. 
              Code faster, learn smarter, build better.
            </p>
            
            <div className="flex items-center gap-3 animate-fade-in [animation-delay:300ms]">
              <Link href="/register">
                <Button className="bg-white text-black hover:bg-neutral-200 h-11 px-6 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98]">
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-white/[0.1] text-white hover:bg-white/[0.04] hover:border-white/[0.15] h-11 px-6 font-medium transition-all duration-200">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-5 mt-10 text-sm text-neutral-500 animate-fade-in [animation-delay:400ms]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />
                <span>150 free credits daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-2">Features</h2>
            <p className="text-neutral-500">Everything you need for AI-powered development</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className={cn(
                  "group relative p-5 rounded-2xl cursor-default",
                  "bg-gradient-to-b from-white/[0.03] to-transparent",
                  "border border-white/[0.04]",
                  "backdrop-blur-sm",
                  "hover:from-white/[0.06] hover:border-white/[0.08]",
                  "hover:-translate-y-1",
                  "transition-all duration-300 ease-out",
                  "animate-fade-in"
                )}
                style={{ 
                  animationDelay: `${i * 60}ms`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <feature.icon className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-medium text-white mb-1.5">{feature.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-white mb-2">Pricing</h2>
            <p className="text-neutral-500">Start free. Upgrade when you need more.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            <div 
              className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white">Free</h3>
                <div className="text-3xl font-semibold text-white mt-2">$0<span className="text-base text-neutral-500 font-normal">/mo</span></div>
                <p className="text-sm text-neutral-500 mt-1">150 credits/day</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Basic models
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Limited web search
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Community support
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full border-white/[0.08] text-white hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200">
                  Get started
                </Button>
              </Link>
            </div>

            <div 
              className="group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 bg-white text-black text-xs font-medium rounded-md">
                Popular
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white">Pro</h3>
                <div className="text-3xl font-semibold text-white mt-2">$19<span className="text-base text-neutral-500 font-normal">/mo</span></div>
                <p className="text-sm text-neutral-500 mt-1">500 credits/day</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-white/70" />
                  All AI models
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-white/70" />
                  Unlimited web search
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-white/70" />
                  Canvas & Academy
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-white/70" />
                  Priority support
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full bg-white text-black hover:bg-neutral-200 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)]">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>

            <div 
              className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white">Studio</h3>
                <div className="text-3xl font-semibold text-white mt-2">$49<span className="text-base text-neutral-500 font-normal">/mo</span></div>
                <p className="text-sm text-neutral-500 mt-1">2000 credits/day</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Team collaboration
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Dedicated support
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full border-white/[0.08] text-white hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-200">
                  Contact sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Ready to build faster?</h2>
          <p className="text-neutral-500 mb-8 max-w-md mx-auto">Join developers using Overmind to supercharge their workflow.</p>
          <Link href="/register">
            <Button className="bg-white text-black hover:bg-neutral-200 h-11 px-8 font-medium transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98]">
              Get started for free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-neutral-600" />
              <span className="text-sm font-medium text-neutral-600">Overmind</span>
            </div>
            <p className="text-sm text-neutral-700">© 2026 Overmind</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
