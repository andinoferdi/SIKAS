"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, Loader2, Bot } from "lucide-react"
import { type Message } from "@/types/chatbot"
import {
  handleModelFallback,
  generateMessageId,
  getGreetingMessage,
  QUICK_REPLIES,
} from "@/services/chatbot"
import { ChatMessage } from "./chat-message"
import { QuickReplies } from "./quick-replies"

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatbotPanel({ isOpen, onClose }: ChatbotPanelProps) {
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
      await handleModelFallback(
        [...messages, userMessage],
        0,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          )
        },
        abortControllerRef.current.signal
      )

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
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
