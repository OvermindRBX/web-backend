"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  X,
  User,
  Lock,
  Key,
  Brain,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Skeleton } from "./skeleton"

interface ApiKey {
  id: string
  name: string
  prefix: string
  expiresAt: number | null
  createdAt: number
  lastUsedAt: number | null
}

interface UserProfile {
  id: string
  email: string
  displayName: string
  createdAt: number
}

interface Provider {
  id: string
  name: string
  modelCount: number
}

type Tab = "account" | "security" | "api-keys" | "ai"
type Tier = "free" | "pro" | "studio"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function SettingsModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("settings") === "true"
  const initialTab = (searchParams.get("tab") as Tab) || "account"
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [closing, setClosing] = useState(false)
  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [email, setEmail] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState("")
  const [profileError, setProfileError] = useState("")

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [keys, setKeys] = useState<ApiKey[]>([])
  const [keysLoading, setKeysLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyDays, setNewKeyDays] = useState("")
  const [newPlainKey, setNewPlainKey] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [keysError, setKeysError] = useState("")
  const [copyingKey, setCopyingKey] = useState<string | null>(null)

  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProvider, setSelectedProvider] = useState("")
  const [providersLoading, setProvidersLoading] = useState(true)
  const [providerSaving, setProviderSaving] = useState(false)
  const [providerSuccess, setProviderSuccess] = useState("")
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  const [userTier, setUserTier] = useState<Tier>("free")

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.delete("settings")
      url.searchParams.delete("tab")
      window.history.replaceState({}, "", url.pathname + (url.search || ""))
      setClosing(false)
    }, 200)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [isOpen, handleClose])

  useEffect(() => {
    if (isOpen) {
      fetchUser()
      fetchKeys()
      fetchProviders()
      fetchTier()
    }
  }, [isOpen])

  async function fetchUser() {
    setProfileLoading(true)
    try {
      const res = await fetch("/api/user")
      const data = await res.json()
      if (data.user) {
        setUser(data.user)
        setEmail(data.user.email)
        setDisplayName(data.user.displayName)
      }
    } catch {
      setProfileError("Failed to load profile")
    } finally {
      setProfileLoading(false)
    }
  }

  async function fetchKeys() {
    setKeysLoading(true)
    try {
      const res = await fetch("/api/keys")
      const data = await res.json()
      setKeys(data.keys || [])
    } catch {
      setKeysError("Failed to fetch API keys")
    } finally {
      setKeysLoading(false)
    }
  }

  async function fetchProviders() {
    setProvidersLoading(true)
    try {
      const res = await fetch("/api/providers")
      const data = await res.json()
      setProviders(data.providers || [])
      
      const userRes = await fetch("/api/user")
      const userData = await userRes.json()
      setSelectedProvider(userData.user?.preferredProvider || data.default || "chat.gpt-chatbot.ru")
    } catch {
      setProviders([])
    } finally {
      setProvidersLoading(false)
    }
  }

  async function fetchTier() {
    try {
      const res = await fetch("/api/billing")
      const data = await res.json()
      if (data.tier) setUserTier(data.tier)
    } catch {}
  }

  async function handleSaveProfile() {
    setProfileSaving(true)
    setProfileError("")
    setProfileSuccess("")
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(data.user)
      setProfileSuccess("Profile updated")
      setTimeout(() => setProfileSuccess(""), 3000)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword() {
    setPasswordSaving(true)
    setPasswordError("")
    setPasswordSuccess("")
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match")
      setPasswordSaving(false)
      return
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters")
      setPasswordSaving(false)
      return
    }
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSuccess("Password changed")
      setTimeout(() => setPasswordSuccess(""), 3000)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleCreateKey() {
    if (!newKeyName.trim()) return
    setCreating(true)
    setKeysError("")
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          expiresInDays: newKeyDays ? parseInt(newKeyDays) : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewPlainKey(data.plainKey)
      setKeys((prev) => [...prev, data.key])
      setNewKeyName("")
      setNewKeyDays("")
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Failed to create key")
    } finally {
      setCreating(false)
    }
  }

  async function handleDeleteKey(id: string) {
    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setKeys((prev) => prev.filter((k) => k.id !== id))
    } catch {
      setKeysError("Failed to revoke key")
    }
  }

  function handleCopy(text: string, id?: string) {
    navigator.clipboard.writeText(text)
    setCopied(id || "new")
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleCopyFullKey(keyId: string) {
    setCopyingKey(keyId)
    try {
      const res = await fetch("/api/keys", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: keyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      try {
        await navigator.clipboard.writeText(data.key)
      } catch (clipErr) {
        const textarea = document.createElement("textarea")
        textarea.value = data.key
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      
      setCopied(`full-${keyId}`)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Failed to copy key")
    } finally {
      setCopyingKey(null)
    }
  }

  async function handleSaveProvider() {
    setProviderSaving(true)
    try {
      await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredProvider: selectedProvider }),
      })
      setProviderSuccess("Provider saved!")
      setTimeout(() => setProviderSuccess(""), 2000)
    } catch {}
    finally {
      setProviderSaving(false)
    }
  }

  const tabs = [
    { id: "account" as Tab, label: "Account", icon: User },
    { id: "security" as Tab, label: "Security", icon: Lock },
    { id: "api-keys" as Tab, label: "API Keys", icon: Key },
    { id: "ai" as Tab, label: "AI", icon: Brain, isPro: true },
  ]

  if (!isOpen) return null

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200",
          closing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={cn(
            "w-full max-w-2xl max-h-[85vh] pointer-events-auto",
            "bg-[#0c0c10] rounded-2xl border border-white/[0.08]",
            "shadow-2xl shadow-black/60",
            "transition-all duration-200 ease-out",
            closing ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          <div className="flex overflow-hidden" style={{ height: "calc(85vh - 65px)", maxHeight: "600px" }}>
            <nav className="w-44 flex-shrink-0 border-r border-white/[0.06] p-3 space-y-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      const url = new URL(window.location.href)
                      url.searchParams.set("tab", tab.id)
                      window.history.replaceState({}, "", url.toString())
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      activeTab === tab.id
                        ? "bg-white/[0.08] text-white"
                        : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.isPro && (
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                )
              })}
            </nav>

            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Profile</h3>
                    <p className="text-sm text-white/40">Update your account details</p>
                  </div>
                  
                  {profileError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {profileSuccess}
                    </div>
                  )}
                  
                  {profileLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full rounded-lg" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                      <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Display Name</label>
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/70">Email</label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
                        />
                      </div>
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={profileSaving}
                        className="bg-white/10 hover:bg-white/[0.15] text-white border-0"
                      >
                        {profileSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">Password</h3>
                    <p className="text-sm text-white/40">Update your password</p>
                  </div>
                  
                  {passwordError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {passwordSuccess}
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showOldPassword ? "text" : "password"}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">New Password</label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-white/30">At least 8 characters</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">Confirm Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
                      />
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={passwordSaving || !oldPassword || !newPassword || !confirmPassword}
                      className="bg-white/10 hover:bg-white/[0.15] text-white border-0"
                    >
                      {passwordSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "api-keys" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">API Keys</h3>
                    <p className="text-sm text-white/40">Manage keys for Roblox Plugin or VSCode</p>
                  </div>

                  {keysError && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {keysError}
                    </div>
                  )}

                  {newPlainKey && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Save Your API Key</span>
                      </div>
                      <p className="text-xs text-white/50 mb-3">Copy this key now. You won't see it again!</p>
                      <div className="flex gap-2">
                        <Input value={newPlainKey} readOnly className="font-mono text-xs bg-black/30 border-white/[0.08] text-white" />
                        <Button onClick={() => handleCopy(newPlainKey)} size="icon" className="bg-white/10 hover:bg-white/[0.15] border-0">
                          {copied === "new" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button variant="ghost" className="mt-3 text-white/50 hover:text-white" onClick={() => setNewPlainKey("")}>
                        I've saved the key
                      </Button>
                    </div>
                  )}

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <h4 className="text-sm font-medium text-white/70 mb-3">Create New Key</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Key name"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="flex-1 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
                      />
                      <Input
                        type="number"
                        placeholder="Days"
                        value={newKeyDays}
                        onChange={(e) => setNewKeyDays(e.target.value)}
                        className="w-20 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/30"
                      />
                      <Button onClick={handleCreateKey} disabled={creating || !newKeyName.trim()} className="bg-white/10 hover:bg-white/[0.15] border-0">
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {keysLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : keys.length === 0 ? (
                      <div className="text-center py-8">
                        <Key className="w-10 h-10 mx-auto mb-3 text-white/20" />
                        <p className="text-white/40 text-sm">No API keys yet</p>
                      </div>
                    ) : (
                      keys.map((key) => (
                        <div
                          key={key.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
                            <Key className="w-4 h-4 text-white/50" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-white/90 truncate">{key.name}</p>
                            <code className="text-xs text-white/40 font-mono">{key.prefix}...</code>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-white"
                              onClick={() => handleCopyFullKey(key.id)}
                              disabled={copyingKey === key.id}
                            >
                              {copyingKey === key.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : copied === `full-${key.id}` ? (
                                <Check className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-red-400"
                              onClick={() => handleDeleteKey(key.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">AI Provider</h3>
                    <p className="text-sm text-white/40">Choose your preferred AI provider</p>
                  </div>

                  {providerSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      {providerSuccess}
                    </div>
                  )}

                  {providersLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-14 w-full rounded-xl" />
                      <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                          className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center">
                              <Brain className="w-5 h-5 text-white/50" />
                            </div>
                            <div>
                              <p className="font-medium text-white/90">
                                {providers.find(p => p.id === selectedProvider)?.name || "Select Provider"}
                              </p>
                              <p className="text-xs text-white/40">
                                {providers.find(p => p.id === selectedProvider)?.modelCount || 0} models
                              </p>
                            </div>
                          </div>
                          <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", showProviderDropdown && "rotate-180")} />
                        </button>
                        
                        {showProviderDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-[#12121a] border border-white/[0.08] shadow-xl z-10">
                            {providers.map((provider) => (
                              <button
                                key={provider.id}
                                onClick={() => {
                                  setSelectedProvider(provider.id)
                                  setShowProviderDropdown(false)
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                                  selectedProvider === provider.id
                                    ? "bg-white/[0.08] text-white"
                                    : "text-white/70 hover:bg-white/[0.04]"
                                )}
                              >
                                <Brain className="w-4 h-4" />
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{provider.name}</p>
                                  <p className="text-xs text-white/40">{provider.modelCount} models</p>
                                </div>
                                {selectedProvider === provider.id && (
                                  <Check className="w-4 h-4 text-emerald-400" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={handleSaveProvider} 
                        disabled={providerSaving}
                        className="bg-white/10 hover:bg-white/[0.15] text-white border-0"
                      >
                        {providerSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Provider"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
