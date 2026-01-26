"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { X, Bot } from "lucide-react"
import { type ModelSelection } from "@/types/chatbot"
import { LANDING_QUICK_REPLIES, DASHBOARD_QUICK_REPLIES } from "@/services/chatbot"
import { useChatMessages } from "@/components/chatbot/hooks/use-chat-messages"
import { useChatActions } from "@/components/chatbot/hooks/use-chat-actions"
import { ChatMessages } from "@/components/chatbot/chat-messages"
import { ChatInput } from "@/components/chatbot/chat-input"

interface PendingImage {
  file: File
  preview: string
}

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const pathname = usePathname()
  const isOnDashboard = pathname?.startsWith("/dashboard") ?? false

  const [input, setInput] = useState("")
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [modelSelection, setModelSelection] = useState<ModelSelection>({ mode: "auto" })

  const {
    pendingAction,
    isExecuting,
    setPendingAction,
    handleConfirmAction,
    handleCancelAction,
  } = useChatActions({
    onAddMessage: (message) => addMessage(message),
  })

  const {
    messages,
    isLoading,
    showQuickReplies,
    initializeMessages,
    addMessage,
    sendMessage,
    sendImageMessage,
    setShowQuickReplies,
  } = useChatMessages({
    isOnDashboard,
    onPendingAction: setPendingAction,
  })

  useEffect(() => {
    if (isOpen) {
      initializeMessages()
    }
  }, [isOpen, initializeMessages])

  const handleImageSelect = useCallback((file: File) => {
    const preview = URL.createObjectURL(file)
    setPendingImage({ file, preview })
  }, [])

  const handleImageRemove = useCallback(() => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.preview)
      setPendingImage(null)
    }
  }, [pendingImage])

  const handleSubmit = useCallback(async () => {
    if (pendingImage) {
      setUploadingImage(true)
      setShowQuickReplies(false)

      const reader = new FileReader()
      const imageDataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(pendingImage.file)
      })

      const userPrompt = input.trim() || "Analisis gambar ini"
      const imageFile = pendingImage.file

      URL.revokeObjectURL(pendingImage.preview)
      setPendingImage(null)
      setInput("")

      await sendImageMessage(imageFile, userPrompt, imageDataUrl)
      setUploadingImage(false)
    } else if (input.trim()) {
      const content = input
      setInput("")
      await sendMessage(content)
    }
  }, [pendingImage, input, sendImageMessage, sendMessage, setShowQuickReplies])

  const handleQuickReply = useCallback((message: string) => {
    sendMessage(message)
  }, [sendMessage])

  if (!isOpen) return null

  const quickReplies = isOnDashboard ? DASHBOARD_QUICK_REPLIES : LANDING_QUICK_REPLIES
  const quickRepliesLabel = isOnDashboard ? "Aksi cepat:" : "Pertanyaan populer:"
  const combinedLoading = isLoading || isExecuting

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-100 h-full sm:h-182 sm:max-h-[90vh] bg-card sm:rounded-2xl shadow-2xl sm:border sm:border-border flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-on-surface-subtle flex items-center justify-center">
            <Bot className="w-4 h-4 text-on-surface" />
          </div>
          <div>
            <h3 className="font-semibold text-on-surface text-sm">SIKAS Bot</h3>
            <p className="text-xs text-on-surface-variant">Asisten Keuangan Anda</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-on-surface-subtle flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-on-surface" />
        </button>
      </div>

      <ChatMessages
        messages={messages}
        showQuickReplies={showQuickReplies}
        quickReplies={quickReplies}
        onQuickReplySelect={handleQuickReply}
        pendingAction={pendingAction}
        onConfirmAction={handleConfirmAction}
        onCancelAction={handleCancelAction}
        isLoading={combinedLoading}
        quickRepliesLabel={quickRepliesLabel}
      />

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isUploading={uploadingImage}
        pendingImage={pendingImage}
        onImageSelect={handleImageSelect}
        onImageRemove={handleImageRemove}
        modelSelection={modelSelection}
        onModelSelectionChange={setModelSelection}
      />
    </div>
  )
}
