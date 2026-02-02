"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { type Message, type ModelSelection, type StreamChunk } from "@/types/chatbot"
import type { EnhancedRAGContext } from "@/types/rag"
import {
  generateMessageId,
  getGreetingMessage,
  retrieveContext,
  MODELS,
} from "@/services/chatbot"
import {
  parseActions,
  parsePendingActions,
  cleanContentForDisplay,
} from "@/components/chatbot/utils/action-parser"
import type { PendingAction } from "@/components/chatbot/batch-action-confirmation"
import { saveChatHistory, loadChatHistory, clearChatHistory } from "@/lib/utils/chat-storage"

const streamChatFromServer = async (
  messages: Message[],
  modelIndex: number,
  preferredModelId: string | undefined,
  onChunk: (chunk: string) => void,
  signal: AbortSignal,
  ragContext?: EnhancedRAGContext
): Promise<{ content: string; hasContent: boolean }> => {
  const response = await fetch("/api/chatbot/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      modelIndex,
      preferredModelId,
      ragContext,
    }),
    signal,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }))
    if (errorData.retryWithNextModel) {
      throw new Error(`MODEL_ERROR:${response.status}`)
    }
    throw new Error(errorData.error || "Request failed")
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("No response body")
  }

  const decoder = new TextDecoder()
  let buffer = ""
  let fullContent = ""
  let hasContent = false

  while (true) {
    if (signal.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }

    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6)
        if (data === "[DONE]") continue

        try {
          const chunk: StreamChunk = JSON.parse(data)
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content
            fullContent += content
            hasContent = true
            onChunk(content)
          }
        } catch {
          continue
        }
      }
    }
  }

  return { content: fullContent, hasContent }
}

const handleModelFallbackClient = async (
  messages: Message[],
  preferredModelId: string | undefined,
  onChunk: (chunk: string) => void,
  signal: AbortSignal,
  ragContext?: EnhancedRAGContext
): Promise<string> => {
  const startIndex = preferredModelId ? MODELS.indexOf(preferredModelId) : 0
  const validStartIndex = startIndex >= 0 ? startIndex : 0

  for (let attempt = 0; attempt < MODELS.length; attempt++) {
    const modelIndex = (validStartIndex + attempt) % MODELS.length

    try {
      const result = await streamChatFromServer(
        messages,
        modelIndex,
        attempt === 0 ? preferredModelId : undefined,
        onChunk,
        signal,
        ragContext
      )

      if (result.hasContent && result.content.trim().length > 0) {
        return result.content
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error
      }

      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.startsWith("MODEL_ERROR:")) {
        console.warn(`Model ${MODELS[modelIndex]} failed, trying next...`)
        continue
      }

      throw error
    }
  }

  throw new Error("Semua model sedang tidak tersedia. Silakan coba lagi nanti.")
}

interface UseChatMessagesOptions {
  isOnDashboard: boolean
  userId: string | null
  isUserLoading: boolean
  onPendingAction: (action: PendingAction) => void
}

interface UseChatMessagesReturn {
  messages: Message[]
  isLoading: boolean
  showQuickReplies: boolean
  initializeMessages: () => void
  addMessage: (message: Message) => void
  sendMessage: (content: string, modelSelection?: ModelSelection) => Promise<void>
  sendImageMessage: (imageFile: File, prompt: string, imageDataUrl: string) => Promise<void>
  setIsLoading: (loading: boolean) => void
  setShowQuickReplies: (show: boolean) => void
  clearMessages: () => void
}

export function useChatMessages({ isOnDashboard, userId, isUserLoading, onPendingAction }: UseChatMessagesOptions): UseChatMessagesReturn {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const prevUserIdRef = useRef<string | null | undefined>(undefined)

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] })
    queryClient.invalidateQueries({ queryKey: ["summary"] })
    queryClient.invalidateQueries({ queryKey: ["user", "current"] })
  }, [queryClient])

  // Reset chat state when userId changes (login/logout/user switch)
  useEffect(() => {
    // Don't reset while user data is loading - wait for actual userId
    if (isUserLoading) return

    // Skip on initial mount
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = userId
      return
    }

    // userId changed - reset chat state for new auth context
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId

      // Load new user's history or start fresh
      const savedMessages = loadChatHistory(userId)
      if (savedMessages.length > 0) {
        setMessages(savedMessages)
        setShowQuickReplies(false)
      } else {
        setMessages([getGreetingMessage()])
        setShowQuickReplies(true)
      }
    }
  }, [userId, isUserLoading])

  const initializeMessages = useCallback(() => {
    if (messages.length === 0) {
      const savedMessages = loadChatHistory(userId)
      if (savedMessages.length > 0) {
        setMessages(savedMessages)
        setShowQuickReplies(false)
      } else {
        setMessages([getGreetingMessage()])
        setShowQuickReplies(true)
      }
    }
  }, [messages.length, userId])

  useEffect(() => {
    if (messages.length > 0 && !messages.some((m) => m.isStreaming)) {
      saveChatHistory(messages, userId)
    }
  }, [messages, userId])

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const clearMessages = useCallback(() => {
    clearChatHistory(userId)
    setMessages([getGreetingMessage()])
    setShowQuickReplies(true)
  }, [userId])

  const sendMessage = useCallback(async (content: string, modelSelection?: ModelSelection) => {
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

    const preferredModelId = modelSelection?.mode === "manual" ? modelSelection.selectedModelId : undefined

    try {
      let ragContext: EnhancedRAGContext | undefined
      try {
        ragContext = await retrieveContext(content.trim(), 0.4, 3, isOnDashboard)
      } catch (ragError) {
        console.warn("RAG retrieval failed:", ragError)
      }

      let fullContent = ""
      fullContent = await handleModelFallbackClient(
        [...messages, userMessage],
        preferredModelId,
        (chunk: string) => {
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
    clearMessages,
  }
}
