"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Mic, MicOff } from "lucide-react"

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEventInit {
  resultIndex?: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string
  readonly message: string
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface VoiceInputProps {
  onresult: (text: string) => void
  onerror?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onresult, onerror, disabled, className }: VoiceInputProps) {
  const [recording, setRecording] = React.useState(false)
  const [interim, setInterim] = React.useState("")
  const [supported, setSupported] = React.useState(true)
  const recognitionref = React.useRef<SpeechRecognitionInstance | null>(null)

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const recognition = new SpeechRecognition() as SpeechRecognitionInstance
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finaltext = ""
      let interimtext = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finaltext += result[0].transcript
        } else {
          interimtext += result[0].transcript
        }
      }

      if (finaltext) {
        onresult(finaltext)
        setInterim("")
      } else {
        setInterim(interimtext)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("[VoiceInput] Recognition error:", event.error)
      setRecording(false)
      setInterim("")
      
      if (event.error === "not-allowed") {
        onerror?.("Microphone access denied. Please allow microphone access in your browser settings.")
      } else if (event.error === "no-speech") {
        onerror?.("No speech detected. Please try again.")
      } else {
        onerror?.(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setRecording(false)
      setInterim("")
    }

    recognitionref.current = recognition

    return () => {
      recognition.abort()
    }
  }, [onresult, onerror])

  const togglerecording = () => {
    if (!recognitionref.current) return

    if (recording) {
      recognitionref.current.stop()
      setRecording(false)
    } else {
      setInterim("")
      recognitionref.current.start()
      setRecording(true)
    }
  }

  if (!supported) {
    return (
      <button
        disabled
        className={cn(
          "p-2 rounded-lg text-white/20 cursor-not-allowed",
          className
        )}
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={togglerecording}
        disabled={disabled}
        className={cn(
          "p-2 rounded-lg transition-all duration-200",
          recording
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
            : "text-white/40 hover:text-white/70 hover:bg-white/[0.06]",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        title={recording ? "Stop recording" : "Start voice input"}
      >
        {recording ? (
          <div className="relative">
            <Mic className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {interim && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1a1a1f]/95 backdrop-blur-xl border border-white/[0.08] rounded-lg text-sm text-white/50 whitespace-nowrap max-w-[200px] truncate animate-in fade-in-0 slide-in-from-bottom-2 duration-150">
          {interim}
        </div>
      )}
    </div>
  )
}

export function useVoiceInput() {
  const [text, setText] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const handleresult = React.useCallback((result: string) => {
    setText(prev => prev + (prev ? " " : "") + result)
    setError(null)
  }, [])

  const handleerror = React.useCallback((err: string) => {
    setError(err)
  }, [])

  const clear = React.useCallback(() => {
    setText("")
    setError(null)
  }, [])

  return { text, error, handleresult, handleerror, clear, setText }
}
