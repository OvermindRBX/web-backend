"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, Zap, Search, FileCode, Sparkles, Code, Terminal, CheckCircle2, ArrowRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Zap,
    title: "Real-time AI",
    description: "Instant responses from cutting-edge models like GPT-4, Claude, and Gemini",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20"
  },
  {
    icon: Search,
    title: "Web Search",
    description: "Access real-time information from the web during conversations",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  {
    icon: FileCode,
    title: "Code Canvas",
    description: "Interactive code visualization and live preview in your browser",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20"
  },
  {
    icon: Sparkles,
    title: "Academy Mode",
    description: "AI-powered learning assistant that teaches as it helps",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  {
    icon: Code,
    title: "Multi-Model",
    description: "Switch between GPT-4, Claude, Gemini and more on the fly",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20"
  },
  {
    icon: Terminal,
    title: "Tool Calling",
    description: "Advanced workflows with file creation, Roblox integration, and more",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20"
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-950 overflow-hidden">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 grid-glow pointer-events-none" />

      <nav className="relative border-b border-white/[0.06] backdrop-blur-xl bg-neutral-950/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-300">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">Overmind</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg shadow-white/10 hover:shadow-white/20 transition-all duration-200">
                  Get Started
                  <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-neutral-300 mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Now in public beta — 10,000+ developers
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              The AI assistant
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                built for developers
              </span>
            </h1>
            
            <p className="text-xl text-neutral-400 mb-10 max-w-xl leading-relaxed">
              Overmind combines powerful AI models with integrated tools. Code faster, learn smarter, build better.
            </p>
            
            <div className="flex items-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 h-12 px-8 text-base shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5">
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:border-white/20 h-12 px-8 text-base transition-all duration-200">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-12 text-sm text-neutral-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>150 free credits daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">Powerful features that make AI assistance actually useful for development</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className={cn(
                  "group p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20",
                  "backdrop-blur-sm"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", feature.bg, "border", feature.border)}>
                  <feature.icon className={cn("w-6 h-6", feature.color)} />
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-neutral-400 text-lg">Start free. Upgrade when you need more power.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-1">Free</h3>
                <p className="text-neutral-500 text-sm">For personal projects</p>
                <div className="text-4xl font-bold text-white mt-4">$0<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
                <p className="text-sm text-neutral-500 mt-1">150 credits/day</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Basic AI models
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Limited web search
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-neutral-600" />
                  Community support
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full h-11 border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all duration-200">
                  Get started
                </Button>
              </Link>
            </div>

            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent border border-violet-500/30 shadow-2xl shadow-violet-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-xs font-semibold rounded-full shadow-lg">
                Most Popular
              </div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-1">Pro</h3>
                <p className="text-neutral-500 text-sm">For serious developers</p>
                <div className="text-4xl font-bold text-white mt-4">$19<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
                <p className="text-sm text-neutral-500 mt-1">500 credits/day</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  All AI models
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  Unlimited web search
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  Canvas & Academy
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  Priority support
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 shadow-lg shadow-violet-500/25 transition-all duration-200">
                  Upgrade to Pro
                </Button>
              </Link>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-300">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-1">Studio</h3>
                <p className="text-neutral-500 text-sm">For teams & agencies</p>
                <div className="text-4xl font-bold text-white mt-4">$49<span className="text-lg text-neutral-500 font-normal">/mo</span></div>
                <p className="text-sm text-neutral-500 mt-1">2000 credits/day</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Everything in Pro
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Team collaboration
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Custom integrations
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Dedicated support
                </li>
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full h-11 border-white/10 text-white hover:bg-white/5 hover:border-white/20 transition-all duration-200">
                  Contact sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to level up?</h2>
          <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">Join thousands of developers using Overmind to build faster and smarter.</p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 h-12 px-10 text-base shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5">
              Get started for free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.04] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Overmind</span>
            </div>
            <p className="text-sm text-neutral-600">© 2026 Overmind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
