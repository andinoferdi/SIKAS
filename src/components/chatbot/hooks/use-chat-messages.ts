"use client"

import { useState, useRef, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { type Message } from "@/types/chatbot"
import type { EnhancedRAGContext } from "@/types/rag"
import {
  handleModelFallback,
  generateMessageId,
  getGreetingMessage,
  retrieveContext,
} from "@/services/chatbot"
import {
  parseActions,
  parsePendingActions,
  cleanContentForDisplay,
} from "@/components/chatbot/utils/action-parser"
import type { PendingAction } from "@/components/chatbot/batch-action-confirmation"

interface UseChatMessagesOptions {
  isOnDashboard: boolean
  onPendingAction: (action: PendingAction) => void
}

interface UseChatMessagesReturn {
  messages: Message[]
  isLoading: boolean
  showQuickReplies: boolean
  initializeMessages: () => void
  addMessage: (message: Message) => void
  sendMessage: (content: string) => Promise<void>
  sendImageMessage: (imageFile: File, prompt: string, imageDataUrl: string) => Promise<void>
  setIsLoading: (loading: boolean) => void
  setShowQuickReplies: (show: boolean) => void
}

export function useChatMessages({ isOnDashboard, onPendingAction }: UseChatMessagesOptions): UseChatMessagesReturn {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] })
    queryClient.invalidateQueries({ queryKey: ["summary"] })
    queryClient.invalidateQueries({ queryKey: ["user", "current"] })
  }, [queryClient])

  const initializeMessages = useCallback(() => {
    if (messages.length === 0) {
      setMessages([getGreetingMessage()])
    }
  }, [messages.length])

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    setShowQuickReplies(false)

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
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

      // Fallback if response is still empty after all retries
      if (!fullContent || fullContent.trim().length === 0) {
        console.warn("[useChatMessages] All models returned empty response, using fallback message")
        fullContent = "Maaf, saya tidak bisa memberikan respons saat ini. Silakan coba lagi dalam beberapa saat."
      }

      const actions = parseActions(fullContent)
      const pendingActions = parsePendingActions(fullContent)

      // PERBAIKAN: Konversi [ACTION:...] menjadi pending actions untuk konfirmasi
      // AI seharusnya TIDAK menggunakan [ACTION:...], tapi jika terjadi, tetap minta konfirmasi
      if (actions.length > 0) {
        console.warn("[Security] AI menggunakan [ACTION:...] yang seharusnya tidak digunakan. Mengkonversi ke pending action.")
        for (const { action, payload } of actions) {
          // Buat description berdasarkan tipe aksi
          let description = `Konfirmasi: ${action}?`
          if (action === "create_transaction" && payload && typeof payload === "object") {
            const p = payload as { type?: string; amount?: number }
            if (p.type && p.amount) {
              description = `Tambah transaksi ${p.type === "income" ? "pemasukan" : "pengeluaran"} Rp ${p.amount.toLocaleString("id-ID")}?`
            }
          }
          onPendingAction({ action, payload, description })
        }
      }

      if (pendingActions.length > 0) {
        console.log("Pending actions detected:", pendingActions)
        onPendingAction(pendingActions[0])
      }

      const cleanedContent = cleanContentForDisplay(fullContent)
      
      if (cleanedContent.length > 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: cleanedContent, isStreaming: false }
              : msg
          )
        )
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId))
      }
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
  }, [isLoading, messages, isOnDashboard, onPendingAction])

  const sendImageMessage = useCallback(async (
    imageFile: File,
    prompt: string,
    imageDataUrl: string
  ) => {
    setShowQuickReplies(false)
    setIsLoading(true)

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
      imageUrl: imageDataUrl,
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const formData = new FormData()
      formData.append("image", imageFile)
      formData.append("prompt", prompt)

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
      setIsLoading(false)
    }
  }, [invalidateQueries])

  return {
    messages,
    isLoading,
    showQuickReplies,
    initializeMessages,
    addMessage,
    sendMessage,
    sendImageMessage,
    setIsLoading,
    setShowQuickReplies,
  }
}
