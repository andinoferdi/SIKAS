"use client"

import { useRef, useEffect, useCallback, memo } from "react"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
}

export const ChatInput = memo(function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 260)}px`
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      onSubmit()
    }
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  const canSend = input.trim().length > 0 && !isLoading

  return (
    <div className="border-t border-border shrink-0">
      <div className="px-4 pt-3 text-xs text-muted-foreground">
        Analisis gambar dan scan nota sedang dinonaktifkan setelah migrasi AI ke Cerebras.
      </div>

      <div className="flex items-end">
        <form onSubmit={handleFormSubmit} className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan Anda..."
            disabled={isLoading}
            rows={1}
            className="w-full px-4 py-3 text-sm bg-transparent border-0 focus:outline-none disabled:opacity-50 resize-none"
            style={{ maxHeight: "260px", overflowY: "auto" }}
          />
        </form>

        <div className="flex items-center gap-1 pr-2 pb-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            className="p-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
})
