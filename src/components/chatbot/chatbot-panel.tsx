"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { X, Send, Loader2, Bot } from "lucide-react"
import { type Message } from "@/types/chatbot"
import {
  handleModelFallback,
  generateMessageId,
  getGreetingMessage,
  QUICK_REPLIES,
  retrieveContext,
} from "@/services/chatbot"
import type { EnhancedRAGContext, ChatbotAction, ActionPayload } from "@/types/rag"
import { ChatMessage } from "./chat-message"
import { QuickReplies } from "./quick-replies"

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

function cleanContentForDisplay(content: string): string {
  return content.replace(/\[ACTION:\w+\][\s\S]*?\[\/ACTION\]/g, "").trim()
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

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
          // Clean ACTION tags in real-time during streaming so users never see them
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
      if (actions.length > 0) {
        console.log("Actions detected:", actions)
        for (const { action, payload } of actions) {
          const result = await executeAction(action, payload)
          console.log(`Action ${action} result:`, result)

          if (result.success) {
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

        const cleanedContent = cleanContentForDisplay(fullContent)
        if (cleanedContent !== fullContent) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: cleanedContent, isStreaming: false }
                : msg
            )
          )
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
            )
          )
        }
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          )
        )
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
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickReply = (message: string) => {
    sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {showQuickReplies && messages.length === 1 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-2 px-1">Pertanyaan populer:</p>
            <QuickReplies
              replies={QUICK_REPLIES}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border shrink-0">
        <div className="flex items-end">
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis pesan Anda..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 text-sm bg-transparent border-0 focus:outline-none disabled:opacity-50 resize-none"
              style={{ maxHeight: "260px", overflowY: "auto" }}
            />
          </form>
          <div className="flex items-center pr-2 pb-2">
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
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
    </div>
  )
}
