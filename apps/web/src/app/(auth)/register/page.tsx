"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2 } from "lucide-react"

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08080a] p-4 overflow-hidden">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(255,255,255,0.03),transparent)] pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-5 transition-transform duration-300 hover:scale-110">
            <Brain className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-xl font-semibold text-white">Create your account</h1>
          <p className="text-neutral-500 text-sm mt-1">Get started with Overmind</p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 p-6 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-neutral-300 text-sm">Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-neutral-600 h-10 rounded-lg focus:border-white/20 focus:bg-white/[0.06]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-neutral-300 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-neutral-600 h-10 rounded-lg focus:border-white/20 focus:bg-white/[0.06]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-300 text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-neutral-600 h-10 rounded-lg focus:border-white/20 focus:bg-white/[0.06]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-neutral-300 text-sm">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-neutral-600 h-10 rounded-lg focus:border-white/20 focus:bg-white/[0.06]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-neutral-200 h-10 font-medium transition-all duration-200 hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98]" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </div>

        <p className="text-sm text-center text-neutral-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline transition-colors">
            Sign in
          </Link>
        </p>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-neutral-600 hover:text-neutral-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
