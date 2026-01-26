"use client"

import { useRef, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import { X, Send, Loader2, ImageIcon } from "lucide-react"
import { type ModelSelection } from "@/types/chatbot"
import { ALL_MODELS } from "@/services/chatbot"

interface PendingImage {
  file: File
  preview: string
}

interface ChatInputProps {
  input: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  isLoading: boolean
  isUploading: boolean
  pendingImage: PendingImage | null
  onImageSelect: (file: File) => void
  onImageRemove: () => void
  modelSelection: ModelSelection
}

export const ChatInput = memo(function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  isUploading,
  pendingImage,
  onImageSelect,
  onImageRemove,
  modelSelection,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedModel =
    modelSelection.mode === "manual" && modelSelection.selectedModelId
      ? ALL_MODELS.find((m) => m.id === modelSelection.selectedModelId)
      : null

  const isVisionEnabled =
    modelSelection.mode === "auto" || (selectedModel?.supportsVision ?? false)

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const maxHeight = 260
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      return
    }

    onImageSelect(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const canSend = (input.trim() || pendingImage) && !isLoading && !isUploading

  return (

    <div className="border-t border-border shrink-0">
      {pendingImage && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <Image
              src={pendingImage.preview}
              alt="Preview"
              width={128}
              height={80}
              className="h-20 max-w-32 object-cover rounded-lg border border-border"
              unoptimized
            />
            <button
              onClick={onImageRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors cursor-pointer shadow-md"
              title="Hapus gambar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end">
        <form onSubmit={handleFormSubmit} className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingImage ? "Tulis instruksi untuk gambar..." : "Tulis pesan Anda..."}
            disabled={isLoading || isUploading}
            rows={1}
            className="w-full px-4 py-3 text-sm bg-transparent border-0 focus:outline-none disabled:opacity-50 resize-none"
            style={{ maxHeight: "260px", overflowY: "auto" }}
          />
        </form>

        <div className="flex items-center gap-1 pr-2 pb-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading || !isVisionEnabled || !!pendingImage}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title={!isVisionEnabled ? "Pilih model Vision untuk upload gambar" : pendingImage ? "Sudah ada gambar" : "Upload gambar"}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSend}
            className="p-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading || isUploading ? (
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
