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
  const [isStreaming, setIsStreaming] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      const maxHeight = 120 // Max 5 lines approximately
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [])

  // Initialize with greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([getGreetingMessage()])
    }
  }, [isOpen, messages.length])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Hide quick replies after first message
    setShowQuickReplies(false)

    // Add user message
    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    setIsLoading(true)
    setIsStreaming(true)

    // Create assistant message placeholder
    const assistantMessageId = generateMessageId()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }

    setMessages((prev) => [...prev, assistantMessage])

    // Create abort controller
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

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // User cancelled
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
      setIsStreaming(false)
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
    <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-100 max-h-[80vh] h-185 bg-white rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      {/* Header */}
      <div className="bg-sky-500 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">SIKAS Bot</h3>
            <p className="text-xs text-sky-100">Asisten Keuangan Anda</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Quick Replies - Show only at beginning */}
        {showQuickReplies && messages.length === 1 && (
          <div className="pt-2">
            <p className="text-xs text-neutral-500 mb-2 px-1">Pertanyaan populer:</p>
            <QuickReplies
              replies={QUICK_REPLIES}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-neutral-100 shrink-0"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            disabled={isLoading}
            rows={1}
            className="flex-1 px-4 py-2.5 text-sm bg-neutral-100 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 resize-none overflow-y-auto"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 shrink-0 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
