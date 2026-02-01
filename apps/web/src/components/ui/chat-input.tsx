"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Send, Loader2, Paperclip, X, FileText, Image as ImageIcon, Upload, Square } from "lucide-react"

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  data: string
  preview?: string
}

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop?: () => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  className?: string
  files?: UploadedFile[]
  onFilesChange?: (files: UploadedFile[]) => void
  settingsButton?: React.ReactNode
}

const TEXT_EXTENSIONS = [
  ".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".csv", ".log",
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py", ".rb", ".php", ".java", ".c", ".cpp", ".h", ".hpp", ".cs", ".go", ".rs", ".swift", ".kt",
  ".lua", ".luau",
  ".html", ".htm", ".css", ".scss", ".sass", ".less",
  ".sql", ".sh", ".bash", ".zsh", ".ps1", ".bat", ".cmd",
  ".env", ".gitignore", ".dockerignore", ".editorconfig",
  ".toml", ".ini", ".cfg", ".conf"
]

const BLOCKED_EXTENSIONS = [".exe", ".msi", ".dll", ".so", ".dylib", ".app", ".dmg", ".pkg", ".deb", ".rpm"]

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"]

function isBlockedFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  return BLOCKED_EXTENSIONS.includes(ext)
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  placeholder = "Type a message...",
  disabled = false,
  loading = false,
  className,
  files = [],
  onFilesChange,
  settingsButton,
}: ChatInputProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [focused, setFocused] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const dragCounter = React.useRef(0)

  React.useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "0"
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      if ((value.trim() || files.length > 0) && !disabled && !loading) {
        onSend()
      }
    }
  }

  const processFiles = async (fileList: FileList | File[]) => {
    if (!onFilesChange) return

    const newFiles: UploadedFile[] = []

    for (const file of Array.from(fileList)) {
      if (isBlockedFile(file)) {
        console.warn(`Blocked file type: ${file.name}`)
        continue
      }

      const reader = new FileReader()
      
      const fileData = await new Promise<string>((resolve) => {
        if (file.type.startsWith("image/")) {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        } else {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsText(file)
        }
      })

      newFiles.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type || "text/plain",
        size: file.size,
        data: fileData,
        preview: file.type.startsWith("image/") ? fileData : undefined
      })
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return
    await processFiles(selectedFiles)
    e.target.value = ""
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      await processFiles(droppedFiles)
    }
  }

  const removeFile = (id: string) => {
    if (onFilesChange) {
      onFilesChange(files.filter(f => f.id !== id))
    }
  }

  const isDisabled = disabled || loading
  const canSend = (value.trim() || files.length > 0) && !isDisabled

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <div 
      className={cn("relative", className)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "absolute -inset-0.5 rounded-xl blur-lg transition-all duration-700 ease-out pointer-events-none",
          "bg-gradient-to-r from-white/30 via-neutral-400/30 to-white/30",
          focused && !isDisabled ? "opacity-25 scale-100" : "opacity-0 scale-95"
        )}
      />

      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-neutral-500/5 to-transparent backdrop-blur-sm" />
          <div className="absolute inset-0 border border-white/20 rounded-xl" />
          <div className="absolute inset-[1px] border border-white/10 rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] backdrop-blur border border-white/[0.08]">
              <div className="p-2 rounded-lg bg-white/10">
                <Upload className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-sm font-medium text-white/70">Drop to attach</span>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "relative rounded-xl transition-all duration-300",
          "bg-card/95 backdrop-blur-md",
          "border",
          focused && !isDisabled
            ? "border-white/20 shadow-lg shadow-white/5"
            : "border-border/60",
          isDisabled && "opacity-60"
        )}
      >
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {files.map(file => (
              <div
                key={file.id}
                className="relative group flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10"
              >
                {file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-muted-foreground">
                    {getFileIcon(file.type)}
                  </div>
                )}
                <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                  {file.name}
                </span>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "w-full resize-none bg-transparent py-3 px-4",
            "min-h-[48px] max-h-[200px]",
            "text-sm text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none",
            "disabled:cursor-not-allowed",
            "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          )}
        />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[...TEXT_EXTENSIONS, ...IMAGE_TYPES.map(t => t.replace("image/", "."))].join(",")}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center justify-between px-3 pb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] text-muted-foreground/40 transition-opacity duration-300",
                focused ? "opacity-100" : "opacity-0"
              )}
            >
              <kbd className="px-1 py-0.5 rounded bg-muted/30 font-mono text-[9px]">Enter</kbd>
              <span>send</span>
              <span className="mx-0.5">·</span>
              <kbd className="px-1 py-0.5 rounded bg-muted/30 font-mono text-[9px]">Shift+Enter</kbd>
              <span>newline</span>
            </div>

            <Button
              type="button"
              size="icon"
              disabled={!canSend && !loading}
              onClick={(e) => {
                e.preventDefault()
                if (loading && onStop) {
                  onStop()
                } else if (canSend) {
                  onSend()
                }
              }}
              className={cn(
                "h-8 w-8 rounded-lg transition-all",
                loading
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : canSend 
                    ? "bg-white text-neutral-900 hover:bg-neutral-200" 
                    : "bg-white/10 text-muted-foreground cursor-not-allowed"
              )}
            >
              {loading ? (
                <Square className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>

            {settingsButton}
          </div>
        </div>
      </div>
    </div>
  )
}
