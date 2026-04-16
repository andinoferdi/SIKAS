"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { type Message, type ModelSelection, type StreamChunk } from "@/types/chatbot"
import type { EnhancedRAGContext } from "@/types/rag"
import { generateMessageId, getGreetingMessage, retrieveContext } from "@/services/chatbot"
import {
  parseActions,
  parsePendingActions,
  cleanContentForDisplay,
  extractTransactionFromText,
  shouldRejectAssistantSuccess,
} from "@/components/chatbot/utils/action-parser"
import { getJakartaDateString } from "@/lib/utils/format"
import type { PendingAction } from "@/components/chatbot/batch-action-confirmation"
import { saveChatHistory, loadChatHistory, clearChatHistory } from "@/lib/utils/chat-storage"

const streamChatFromServer = async (
  messages: Message[],
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
      preferredModelId,
      ragContext,
    }),
    signal,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }))
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
      if (!line.startsWith("data: ")) continue

      const data = line.slice(6)
      if (data === "[DONE]") continue

      try {
        const chunk: StreamChunk = JSON.parse(data)
        const content = chunk.choices?.[0]?.delta?.content

        if (content) {
          fullContent += content
          hasContent = true
          onChunk(content)
        }
      } catch {
        continue
      }
    }
  }

  return { content: fullContent, hasContent }
}

interface UseChatMessagesOptions {
  includePersonalContext: boolean
  userId: string | null
  isUserLoading: boolean
  onPendingAction: (action: PendingAction) => void
  onClearPendingAction: () => void
}

interface UseChatMessagesReturn {
  messages: Message[]
  isLoading: boolean
  showQuickReplies: boolean
  initializeMessages: () => void
  addMessage: (message: Message) => void
  sendMessage: (content: string, modelSelection?: ModelSelection) => Promise<void>
  setIsLoading: (loading: boolean) => void
  setShowQuickReplies: (show: boolean) => void
  clearMessages: () => void
}

export function useChatMessages({
  includePersonalContext,
  userId,
  isUserLoading,
  onPendingAction,
  onClearPendingAction,
}: UseChatMessagesOptions): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const prevUserIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (isUserLoading) return

    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = userId
      return
    }

    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId

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
    if (messages.length > 0) return

    const savedMessages = loadChatHistory(userId)
    if (savedMessages.length > 0) {
      setMessages(savedMessages)
      setShowQuickReplies(false)
      return
    }

    setMessages([getGreetingMessage()])
    setShowQuickReplies(true)
  }, [messages.length, userId])

  useEffect(() => {
    if (messages.length > 0 && !messages.some((message) => message.isStreaming)) {
      saveChatHistory(messages, userId)
    }
  }, [messages, userId])

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const clearMessages = useCallback(() => {
    onClearPendingAction()
    clearChatHistory(userId)
    setMessages([getGreetingMessage()])
    setShowQuickReplies(true)
  }, [onClearPendingAction, userId])

  const sendMessage = useCallback(
    async (content: string, modelSelection?: ModelSelection) => {
      if (!content.trim() || isLoading) return

      onClearPendingAction()
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

      const preferredModelId =
        modelSelection?.mode === "manual" ? modelSelection.selectedModelId : undefined

      try {
        let ragContext: EnhancedRAGContext | undefined

        try {
          ragContext = await retrieveContext(content.trim(), 0.4, 3, includePersonalContext)
        } catch (ragError) {
          console.warn("RAG retrieval failed:", ragError)
        }

        let fullContent = ""
        const result = await streamChatFromServer(
          [...messages, userMessage],
          preferredModelId,
          (chunk) => {
            fullContent += chunk
            const displayContent = cleanContentForDisplay(fullContent)
            setMessages((prev) =>
              prev.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: displayContent }
                  : message
              )
            )
          },
          abortControllerRef.current.signal,
          ragContext
        )

        fullContent = result.content

        if (!result.hasContent || fullContent.trim().length === 0) {
          fullContent =
            "Maaf, saya tidak bisa memberikan respons saat ini. Silakan coba lagi dalam beberapa saat."
        }

        const actions = parseActions(fullContent)
        const pendingActions = parsePendingActions(fullContent)

        if (actions.length > 0) {
          console.warn(
            "[Security] AI menggunakan [ACTION:...] yang seharusnya tidak digunakan. Mengkonversi ke pending action."
          )

          for (const { action, payload } of actions) {
            let description = `Konfirmasi: ${action}?`

            if (action === "create_transaction" && payload && typeof payload === "object") {
              const draftPayload = payload as { type?: string; amount?: number }
              if (draftPayload.type && draftPayload.amount) {
                description = `Tambah transaksi ${
                  draftPayload.type === "income" ? "pemasukan" : "pengeluaran"
                } Rp ${draftPayload.amount.toLocaleString("id-ID")}?`
              }
            }

            onPendingAction({ action, payload, description })
          }
        }

        if (pendingActions.length > 0) {
          onPendingAction(pendingActions[0])
        }

        if (actions.length === 0 && pendingActions.length === 0) {
          const today = getJakartaDateString()
          const extracted = extractTransactionFromText(fullContent, today, userMessage.content)
          if (extracted) {
            console.warn(
              "[Fallback] Model tidak generate PENDING_ACTION, auto-detect dari text:",
              extracted
            )
            onPendingAction(extracted)
          }
        }

        let cleanedContent = cleanContentForDisplay(fullContent)

        if (
          actions.length === 0 &&
          pendingActions.length === 0 &&
          shouldRejectAssistantSuccess(userMessage.content, fullContent)
        ) {
          cleanedContent =
            "Saya belum menjalankan transaksi apa pun. Kalau kamu mau, kirim ulang instruksinya dan saya akan siapkan konfirmasi transaksi yang jelas dulu."
        }

        if (cleanedContent.length > 0) {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: cleanedContent, isStreaming: false }
                : message
            )
          )
        } else {
          setMessages((prev) => prev.filter((message) => message.id !== assistantMessageId))
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessageId
                ? { ...message, content: message.content || "Dibatalkan.", isStreaming: false }
                : message
            )
          )
        } else {
          const errorMessage =
            error instanceof Error ? error.message : "Terjadi kesalahan"

          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessageId
                ? {
                    ...message,
                    content: `Maaf, terjadi kesalahan: ${errorMessage}. Silakan coba lagi.`,
                    isStreaming: false,
                  }
                : message
            )
          )
        }
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [includePersonalContext, isLoading, messages, onClearPendingAction, onPendingAction]
  )

  return {
    messages,
    isLoading,
    showQuickReplies,
    initializeMessages,
    addMessage,
    sendMessage,
    setIsLoading,
    setShowQuickReplies,
    clearMessages,
  }
}
