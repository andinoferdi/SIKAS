"use client"

import { useRef, useEffect, useCallback, memo } from "react"
import { Send, Loader2, ImagePlus, X } from "lucide-react"

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  attachment?: { name: string; dataUrl: string } | null
  onAttachmentChange?: (value: { name: string; dataUrl: string } | null) => void
}

/* Data URL base64 membesar sekitar 33 persen dari berkas aslinya, jadi
   batas 3 MB di sisi klien menjaga payload tetap di bawah batas server. */
const MAX_BYTES = 3 * 1024 * 1024

export const ChatInput = memo(function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  attachment = null,
  onAttachmentChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 100)
    return () => window.clearTimeout(timer)
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

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !onAttachmentChange) return

    if (!file.type.startsWith("image/")) return
    if (file.size > MAX_BYTES) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onAttachmentChange({ name: file.name, dataUrl: reader.result })
      }
    }
    reader.readAsDataURL(file)
  }

  const canSend = (input.trim().length > 0 || Boolean(attachment)) && !isLoading
  const canAttach = Boolean(onAttachmentChange)

  return (
    <div className="shrink-0 border-t border-border">
      {attachment ? (
        <div className="flex items-center gap-3 border-b border-border px-4 py-2">
          <span className="truncate text-sm text-muted-foreground">{attachment.name}</span>
          <button
            type="button"
            onClick={() => onAttachmentChange?.(null)}
            aria-label="Hapus lampiran"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <form onSubmit={handleFormSubmit} className="flex items-end gap-1 p-2">
        {canAttach ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
              aria-hidden="true"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isLoading}
              aria-label="Lampirkan gambar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <label htmlFor="chat-input" className="sr-only">
          Tulis pesan
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tulis pesan"
          disabled={isLoading}
          rows={1}
          className="max-h-64 flex-1 resize-none bg-transparent px-2 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Kirim pesan"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-primary transition-colors hover:bg-muted disabled:opacity-30"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  )
})
