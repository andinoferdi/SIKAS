"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useQueryClient } from "@tanstack/react-query"
import { X, Send, Loader2, Bot, ImageIcon, Check, XCircle } from "lucide-react"
import { type Message, type ModelSelection } from "@/types/chatbot"
import {
  handleModelFallback,
  generateMessageId,
  getGreetingMessage,
  LANDING_QUICK_REPLIES,
  DASHBOARD_QUICK_REPLIES,
  retrieveContext,
  ALL_MODELS,
} from "@/services/chatbot"
import type { EnhancedRAGContext, ChatbotAction, ActionPayload } from "@/types/rag"
import { ChatMessage } from "./chat-message"
import { QuickReplies } from "./quick-replies"
import { ModelSelector } from "./model-selector"

interface PendingAction {
  action: ChatbotAction
  payload: ActionPayload
  description: string
}

function parseActions(
  content: string
): Array<{ action: ChatbotAction; payload: ActionPayload }> {
  const actions: Array<{ action: ChatbotAction; payload: ActionPayload }> = []
  const actionRegex = /\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/g
  let match

  while ((match = actionRegex.exec(content)) !== null) {
    const actionType = match[1] as ChatbotAction
    try {
      const payload = JSON.parse(match[2].trim())
      actions.push({ action: actionType, payload })
    } catch (e) {
      console.error("Failed to parse action payload:", e)
    }
  }

  return actions
}

function parsePendingActions(content: string): PendingAction[] {
  const actions: PendingAction[] = []
  const pendingRegex = /\[PENDING_ACTION:(\w+)\]([\s\S]*?)\[\/PENDING_ACTION\]/g
  let match

  while ((match = pendingRegex.exec(content)) !== null) {
    const actionType = match[1] as ChatbotAction
    try {
      const payload = JSON.parse(match[2].trim())
      const description = actionType === "delete_transaction"
        ? "Hapus transaksi ini?"
        : "Ubah transaksi ini?"
      actions.push({ action: actionType, payload, description })
    } catch (e) {
      console.error("Failed to parse pending action payload:", e)
    }
  }

  return actions
}

function cleanContentForDisplay(content: string): string {
  return content
    .replace(/\[ACTION:[\w-]+\][\s\S]*?\[\/ACTION\]/gi, "")
    .replace(/\[PENDING_ACTION:[\w-]+\][\s\S]*?\[\/PENDING_ACTION\]/gi, "")
    .replace(/\[ACTION:[\w-]*(?:\][\s\S]*)?$/gi, "")
    .replace(/\[PENDING_ACTION:[\w-]*(?:\][\s\S]*)?$/gi, "")
    .replace(/\[\/ACTION\]/gi, "")
    .replace(/\[\/PENDING_ACTION\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

async function executeAction(
  action: ChatbotAction,
  payload: ActionPayload
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const response = await fetch("/api/chatbot/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.error || "Action failed" }
    }

    return { success: true, message: data.message || "Action completed", data }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
  const pathname = usePathname()
  const isOnDashboard = pathname?.startsWith("/dashboard") ?? false
  const queryClient = useQueryClient()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [modelSelection, setModelSelection] = useState<ModelSelection>({ mode: "auto" })
  const [pendingImage, setPendingImage] = useState<{ file: File; preview: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedModel = 
    modelSelection.mode === "manual" && modelSelection.selectedModelId
      ? ALL_MODELS.find((m) => m.id === modelSelection.selectedModelId)
      : null

  const isVisionEnabled = 
    modelSelection.mode === "auto" || (selectedModel?.supportsVision ?? false)

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] })
    queryClient.invalidateQueries({ queryKey: ["summary"] })
    queryClient.invalidateQueries({ queryKey: ["user", "current"] })
  }, [queryClient])

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const maxHeight = 260
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([getGreetingMessage()])
    }
  }, [isOpen, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    setShowQuickReplies(false)

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    setIsLoading(true)

    const assistantMessageId = generateMessageId()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    abortControllerRef.current = new AbortController()

    try {
      let ragContext: EnhancedRAGContext | undefined
      try {
        ragContext = await retrieveContext(content.trim(), 0.4, 3, isOnDashboard)
        if (ragContext.relevantDocs.length > 0) {
          console.log("RAG Context found:", {
            query: ragContext.query,
            avgSimilarity: (ragContext.avgSimilarity * 100).toFixed(1) + "%",
            hasUserContext: !!ragContext.userContext,
            docs: ragContext.relevantDocs.map((d) => ({
              category: d.category,
              similarity: (d.similarity * 100).toFixed(1) + "%",
              preview: d.content.substring(0, 50) + "...",
            })),
          })
        } else {
          console.log("No RAG context found for:", content.trim())
        }
        if (ragContext.userContext) {
          console.log("User context included:", ragContext.userContext.userName)
        }
      } catch (ragError) {
        console.warn("RAG retrieval failed:", ragError)
      }

      let fullContent = ""
      await handleModelFallback(
        [...messages, userMessage],
        0,
        (chunk) => {
          fullContent += chunk
          const displayContent = cleanContentForDisplay(fullContent)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: displayContent }
                : msg
            )
          )
        },
        abortControllerRef.current.signal,
        ragContext
      )

      const actions = parseActions(fullContent)
      const pendingActions = parsePendingActions(fullContent)

      if (actions.length > 0) {
        console.log("Actions detected:", actions)
        for (const { action, payload } of actions) {
          const result = await executeAction(action, payload)
          console.log(`Action ${action} result:`, result)

          if (result.success) {
            invalidateQueries()
            const actionMessage: Message = {
              id: generateMessageId(),
              role: "assistant",
              content: `✅ ${result.message}`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, actionMessage])
          } else {
            const errorMessage: Message = {
              id: generateMessageId(),
              role: "assistant",
              content: `❌ ${result.message}`,
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
          }
        }
      }

      if (pendingActions.length > 0) {
        console.log("Pending actions detected:", pendingActions)
        setPendingAction(pendingActions[0])
      }

      const cleanedContent = cleanContentForDisplay(fullContent)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: cleanedContent, isStreaming: false }
            : msg
        )
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content || "Dibatalkan.", isStreaming: false }
              : msg
          )
        )
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Terjadi kesalahan"
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `Maaf, terjadi kesalahan: ${errorMessage}. Silakan coba lagi.`,
                  isStreaming: false,
                }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleRemovePendingImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.preview)
      setPendingImage(null)
    }
  }

  const handleSendWithImage = async () => {
    if (!pendingImage) return

    setUploadingImage(true)
    setShowQuickReplies(false)

    // Convert file to base64 for display in message
    const reader = new FileReader()
    const imageDataUrl = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(pendingImage.file)
    })

    const userPrompt = input.trim() || "Analisis gambar ini"
    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
      imageUrl: imageDataUrl,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const imageFile = pendingImage.file
    URL.revokeObjectURL(pendingImage.preview)
    setPendingImage(null)

    try {
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("prompt", userPrompt)

      const response = await fetch("/api/chatbot/vision", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Gagal menganalisis gambar")
      }

      const resultMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, resultMessage])

      if (data.transaction) {
        invalidateQueries()
      }
    } catch (error) {
      const errorMsg: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: `${error instanceof Error ? error.message : "Gagal menganalisis gambar"}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingImage) {
      handleSendWithImage()
    } else {
      sendMessage(input)
    }
  }

  const handleQuickReply = (message: string) => {
    sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (pendingImage) {
        handleSendWithImage()
      } else {
        sendMessage(input)
      }
    }
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return

    const result = await executeAction(pendingAction.action, pendingAction.payload)
    if (result.success) {
      invalidateQueries()
      const successMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: `✅ ${result.message}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, successMessage])
    } else {
      const errorMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: `❌ ${result.message}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
    setPendingAction(null)
  }

  const handleCancelAction = () => {
    const cancelMessage: Message = {
      id: generateMessageId(),
      role: "assistant",
      content: "Baik, aksi dibatalkan.",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, cancelMessage])
    setPendingAction(null)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      const errorMsg: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "File harus berupa gambar (JPG, PNG, dll)",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      const errorMsg: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "Ukuran gambar maksimal 10MB",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    const preview = URL.createObjectURL(file)
    setPendingImage({ file, preview })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }



  if (!isOpen) return null

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

      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <ModelSelector
          models={ALL_MODELS}
          currentSelection={modelSelection}
          onSelectionChange={setModelSelection}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {showQuickReplies && messages.length === 1 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2 px-1">
              {isOnDashboard ? "Aksi cepat:" : "Pertanyaan populer:"}
            </p>
            <QuickReplies
              replies={isOnDashboard ? DASHBOARD_QUICK_REPLIES : LANDING_QUICK_REPLIES}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          </div>
        )}

        {pendingAction && (
          <div className="bg-muted/50 rounded-lg p-3 mx-1">
            <p className="text-sm text-foreground mb-3">{pendingAction.description}</p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmAction}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Ya, Lanjutkan
              </button>
              <button
                onClick={handleCancelAction}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-sm rounded-md hover:bg-destructive/20 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                Batal
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

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
                onClick={handleRemovePendingImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/80 transition-colors cursor-pointer shadow-md"
                title="Hapus gambar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        <div className="flex items-end">
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pendingImage ? "Tulis instruksi untuk gambar..." : "Tulis pesan Anda..."}
              disabled={isLoading || uploadingImage}
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
              disabled={isLoading || uploadingImage || !isVisionEnabled || !!pendingImage}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title={!isVisionEnabled ? "Pilih model Vision untuk upload gambar" : pendingImage ? "Sudah ada gambar" : "Upload gambar"}
            >
              {uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => pendingImage ? handleSendWithImage() : sendMessage(input)}
              disabled={(!input.trim() && !pendingImage) || isLoading || uploadingImage}
              className="p-2 text-primary hover:text-primary/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading || uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
